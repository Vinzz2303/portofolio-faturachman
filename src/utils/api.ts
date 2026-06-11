type RuntimeEnv = {
  VITE_API_URL?: string
  NEXT_PUBLIC_API_URL?: string
  NODE_ENV?: string
  DEV?: boolean
}

function getViteEnv(): RuntimeEnv {
  return ((import.meta as unknown as { env?: RuntimeEnv }).env ?? {})
}

function getProcessEnv(): RuntimeEnv {
  if (typeof process === 'undefined') return {}
  return process.env as RuntimeEnv
}

const viteEnv = getViteEnv()
const processEnv = getProcessEnv()

export const API_URL = viteEnv.VITE_API_URL || processEnv.NEXT_PUBLIC_API_URL || processEnv.VITE_API_URL || ''
export const IS_DEV = Boolean(viteEnv.DEV ?? processEnv.NODE_ENV === 'development')
