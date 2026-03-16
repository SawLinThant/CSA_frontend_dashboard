export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiErrorPayload {
  error: string
  details?: unknown
}

