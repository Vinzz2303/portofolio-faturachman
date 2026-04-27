import axios from 'axios'

type AzureChatMessage = {
  role: string
  content: string
}

type AzureConfig =
  | {
      enabled: false
      reason: 'disabled'
    }
  | {
      enabled: false
      reason: 'incomplete'
      missing: string[]
    }
  | {
      enabled: true
      endpoint: string
      apiKey: string
      modelName: string
    }

const azureLog = (message: string) => {
  console.log(`[AZURE_PROVIDER] ${message}`)
}

const readAzureConfig = (): AzureConfig => {
  const enabled = process.env.AZURE_PROVIDER_ENABLED === 'true'
  if (!enabled) {
    return { enabled: false, reason: 'disabled' }
  }

  const endpoint = process.env.AZURE_ENDPOINT?.trim()
  const apiKey = process.env.AZURE_API_KEY?.trim()
  const modelName = process.env.AZURE_MODEL_NAME?.trim()
  const missing = [
    !endpoint ? 'AZURE_ENDPOINT' : null,
    !apiKey ? 'AZURE_API_KEY' : null,
    !modelName ? 'AZURE_MODEL_NAME' : null
  ].filter(Boolean) as string[]

  if (missing.length) {
    return { enabled: false, reason: 'incomplete', missing }
  }

  return { enabled: true, endpoint: endpoint!, apiKey: apiKey!, modelName: modelName! }
}

const buildAzureChatUrl = (endpoint: string, modelName: string) => {
  const trimmedEndpoint = endpoint.replace(/\/+$/, '')
  if (/\/chat\/completions(?:\?|$)/i.test(trimmedEndpoint)) {
    return trimmedEndpoint
  }

  return `${trimmedEndpoint}/openai/deployments/${encodeURIComponent(
    modelName
  )}/chat/completions?api-version=2024-02-15-preview`
}

const getAzureErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    return status ? `request failed with status ${status}` : error.message
  }

  return error instanceof Error ? error.message : 'unknown request failure'
}

export const sendAzureChat = async (messages: AzureChatMessage[]) => {
  const config = readAzureConfig()

  if (!config.enabled) {
    if (config.reason === 'disabled') {
      azureLog('disabled')
    } else {
      azureLog(`enabled but incomplete config; missing=${config.missing.join(',')}`)
    }
    return null
  }

  azureLog('enabled and configured')

  try {
    const response = await axios.post(
      buildAzureChatUrl(config.endpoint, config.modelName),
      {
        messages,
        temperature: 0.4
      },
      {
        headers: {
          'api-key': config.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 12000
      }
    )

    const content = response.data?.choices?.[0]?.message?.content?.trim()
    if (!content) {
      azureLog('request failure; empty response content')
      return null
    }

    azureLog('request success')
    return content as string
  } catch (error) {
    azureLog(`request failure; ${getAzureErrorMessage(error)}`)
    return null
  }
}
