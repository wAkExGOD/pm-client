export * from "./cn"

const serverUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")

export const getFileUrl = (path?: string | null) => {
  if (!path) {
    return undefined
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path
  }

  return `${serverUrl}${path}`
}
