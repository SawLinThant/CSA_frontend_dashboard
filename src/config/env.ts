export interface AppEnv {
  apiBaseUrl: string
}

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'

export const env: AppEnv = {
  apiBaseUrl,
}

