exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: 'Missing GROQ_API_KEY' }
  }

  let body = {}
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const messages = body?.messages || []

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages,
      temperature: 0.6
    })
  })

  const text = await groqRes.text()
  return {
    statusCode: groqRes.status,
    headers: { 'Content-Type': 'application/json' },
    body: text
  }
}
