import { apiInstance } from "./instance"
import { CreateSprintDto, Sprint, UpdateSprintDto } from "@/types/Sprint"

export const sprintsApi = {
  list: (projectId: number) =>
    apiInstance<Sprint[]>(`/projects/${projectId}/sprints`),
  getActive: (projectId: number) =>
    apiInstance<Sprint | null>(`/projects/${projectId}/sprints/active`),
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
