import { apiInstance } from "./instance"
import {
  type CreateReleaseDto,
  type ReleaseDetails,
  type ReleaseFilters,
  type ReleaseIssueFilters,
  type ReleaseSummary,
} from "@/types/Release"

const buildReleaseQuery = (
  filters?: ReleaseFilters | ReleaseIssueFilters,
) => {
  if (!filters) {
    return ""
  }

  const searchParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

export const releasesApi = {
  list: (projectId: number, filters?: ReleaseFilters) =>
    apiInstance<ReleaseSummary[]>(
      `/projects/${projectId}/releases${buildReleaseQuery(filters)}`,
    ),
  getById: (
    projectId: number,
    releaseId: number,
    filters?: ReleaseIssueFilters,
  ) =>
    apiInstance<ReleaseDetails>(
      `/projects/${projectId}/releases/${releaseId}${buildReleaseQuery(filters)}`,
    ),
  create: (projectId: number, releaseData: CreateReleaseDto) =>
    apiInstance<ReleaseSummary>(`/projects/${projectId}/releases`, {
      method: "POST",
      json: releaseData,
    }),
}
