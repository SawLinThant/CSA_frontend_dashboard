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
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  options?: {
    query?: Record<string, string | number | boolean | undefined>
    body?: unknown
    formData?: FormData
  },
) {
  const { accessToken } = loadTokens()
  const isMultipart = options?.formData instanceof FormData
  const response = await fetch(buildUrl(path, options?.query), {
    method,
    headers: isMultipart
      ? {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        }
      : {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
    credentials: "include",
    body: isMultipart
      ? options?.formData
      : options?.body
        ? JSON.stringify(options.body)
        : undefined,
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

export async function authedDelete(
  path: string,
): Promise<void> {
  let response = await requestOnce("DELETE", path)

  if (response.status === 401) {
    const { refreshToken } = loadTokens()
    if (refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken)
      persistTokens(refreshed.accessToken, refreshed.refreshToken ?? refreshToken)
      response = await requestOnce("DELETE", path)
    }
  }

  if (!response.ok) {
    const json = (await parseJson(response)) as ApiErrorPayload | undefined
    throw new Error(json?.error ?? `Request failed with status ${response.status}`)
  }
}

export async function authedPostFormData<TResponse>(
  path: string,
  formData: FormData,
): Promise<TResponse> {
  let response = await requestOnce("POST", path, { formData })

  if (response.status === 401) {
    const { refreshToken } = loadTokens()
    if (refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken)
      persistTokens(refreshed.accessToken, refreshed.refreshToken ?? refreshToken)
      response = await requestOnce("POST", path, { formData })
    }
  }

  const json = (await parseJson(response)) as TResponse | ApiErrorPayload | undefined

  if (!response.ok) {
    const payload = json as ApiErrorPayload | undefined
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`)
  }

  return json as TResponse
}

export async function authedPatchFormData<TResponse>(
  path: string,
  formData: FormData,
): Promise<TResponse> {
  let response = await requestOnce("PATCH", path, { formData })

  if (response.status === 401) {
    const { refreshToken } = loadTokens()
    if (refreshToken) {
      const refreshed = await refreshAccessToken(refreshToken)
      persistTokens(refreshed.accessToken, refreshed.refreshToken ?? refreshToken)
      response = await requestOnce("PATCH", path, { formData })
    }
  }

  const json = (await parseJson(response)) as TResponse | ApiErrorPayload | undefined

  if (!response.ok) {
    const payload = json as ApiErrorPayload | undefined
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`)
  }

  return json as TResponse
}

