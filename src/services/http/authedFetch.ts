import { env } from "@/config/env"
import type { ApiErrorPayload } from "@/types/api"
import { loadTokens, persistTokens, refreshAccessToken } from "@/services/auth"

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(env.apiBaseUrl + path)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function parseJson(response: Response): Promise<unknown | undefined> {
  try {
    return (await response.json()) as unknown
  } catch {
    return undefined
  }
}

async function requestOnce(
  method: "GET" | "POST" | "PATCH",
  path: string,
  options?: { query?: Record<string, string | number | boolean | undefined>; body?: unknown },
) {
  const { accessToken } = loadTokens()
  const response = await fetch(buildUrl(path, options?.query), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: "include",
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })
  return response
}

export async function authedGetJson<T>(
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  let response = await requestOnce("GET", path, { query })

  if (response.status === 401) {
    const { refreshToken } = loadTokens()
    if (refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken)
      persistTokens(refreshed.accessToken, refreshed.refreshToken ?? refreshToken)
      response = await requestOnce("GET", path, { query })
    }
  }

  const json = (await parseJson(response)) as T | ApiErrorPayload | undefined

  if (!response.ok) {
    const payload = json as ApiErrorPayload | undefined
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`)
  }

  return json as T
}

export async function authedPostJson<TResponse>(
  path: string,
  body?: unknown,
): Promise<TResponse> {
  let response = await requestOnce("POST", path, { body })

  if (response.status === 401) {
    const { refreshToken } = loadTokens()
    if (refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken)
      persistTokens(refreshed.accessToken, refreshed.refreshToken ?? refreshToken)
      response = await requestOnce("POST", path, { body })
    }
  }

  const json = (await parseJson(response)) as TResponse | ApiErrorPayload | undefined

  if (!response.ok) {
    const payload = json as ApiErrorPayload | undefined
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`)
  }

  return json as TResponse
}

export async function authedPatchJson<TResponse>(
  path: string,
  body?: unknown,
): Promise<TResponse> {
  let response = await requestOnce("PATCH", path, { body })

  if (response.status === 401) {
    const { refreshToken } = loadTokens()
    if (refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken)
      persistTokens(refreshed.accessToken, refreshed.refreshToken ?? refreshToken)
      response = await requestOnce("PATCH", path, { body })
    }
  }

  const json = (await parseJson(response)) as TResponse | ApiErrorPayload | undefined

  if (!response.ok) {
    const payload = json as ApiErrorPayload | undefined
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`)
  }

  return json as TResponse
}

