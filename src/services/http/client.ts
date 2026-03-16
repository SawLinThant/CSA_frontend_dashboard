import { env } from '../../config/env'
import type { ApiErrorPayload } from '../../types/api'

export class HttpClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async post<TRequest, TResponse>(
    path: string,
    body: TRequest,
  ): Promise<TResponse> {
    const response = await fetch(this.baseUrl + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    })

    const json = (await response.json().catch(() => undefined)) as
      | TResponse
      | ApiErrorPayload
      | undefined

    if (!response.ok) {
      const payload = json as ApiErrorPayload | undefined
      const message =
        payload?.error ?? `Request failed with status ${response.status}`
      throw new Error(message)
    }

    return json as TResponse
  }
}

export const httpClient = new HttpClient(env.apiBaseUrl)

