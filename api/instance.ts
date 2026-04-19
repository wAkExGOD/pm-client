import { AUTH_TOKEN_KEY } from "@/hooks/useAuth"

const API_URL = process.env.NEXT_PUBLIC_API_URL as string

export class ApiError extends Error {
  constructor(message: string) {
    super("Api error: " + message)
  }
}

export const apiInstance = async <T>(
  url: string,
  init?: RequestInit & { json?: unknown }
) => {
  let headers = init?.headers ?? {}

  const token = localStorage?.getItem(AUTH_TOKEN_KEY) ?? ""
  if (token) {
    headers = { ...headers, Authorization: `Bearer ${token}` }
  }

  if (init?.json) {
    headers = {
      ...headers,
      "Content-type": "application/json",
    }

    init.body = JSON.stringify(init.json)
  }

  const result = await fetch(`${API_URL}${url}`, {
    ...init,
    headers,
    credentials: "include",
  })

  if (!result.ok) {
    return await result.json().then((response) => {
      // response = message, error, statusCode
      const errorMessage = response?.message || "Unexpected error"
      throw new ApiError(errorMessage)
    })
  }

  const data = (await result.json()) as Promise<T>

  return data
}
