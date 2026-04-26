import { apiInstance } from "./instance"
import {
  CreateSprintDto,
  Sprint,
  SprintDetails,
  SprintIssueFilters,
  UpdateSprintDto,
} from "@/types/Sprint"

const buildSprintQuery = (filters?: SprintIssueFilters) => {
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

export const sprintsApi = {
  list: (projectId: number) =>
    apiInstance<Sprint[]>(`/projects/${projectId}/sprints`),
  getActive: (projectId: number) =>
    apiInstance<Sprint | null>(`/projects/${projectId}/sprints/active`),
  getById: (projectId: number, sprintId: number, filters?: SprintIssueFilters) =>
    apiInstance<SprintDetails>(
      `/projects/${projectId}/sprints/${sprintId}${buildSprintQuery(filters)}`,
    ),
  create: (projectId: number, sprintData: CreateSprintDto) =>
    apiInstance<Sprint>(`/projects/${projectId}/sprints`, {
      method: "POST",
      json: sprintData,
    }),
  update: (projectId: number, sprintId: number, sprintData: UpdateSprintDto) =>
    apiInstance<Sprint>(`/projects/${projectId}/sprints/${sprintId}`, {
      method: "PATCH",
      json: sprintData,
    }),
}
