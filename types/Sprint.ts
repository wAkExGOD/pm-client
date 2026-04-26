import type { Issue, IssueStatus } from "./Issue"

export type Sprint = {
  id: number
  projectId: number
  name: string
  startDate: string
  endDate: string
  goal: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateSprintDto = {
  name: string
  startDate: string
  endDate: string
  goal?: string
  isActive?: boolean
}

export type UpdateSprintDto = Partial<CreateSprintDto>

export type SprintDetails = Sprint & {
  issues: Issue[]
}

export type SprintIssueFilters = {
  status?: IssueStatus
  assigneeId?: number
  sortBy?: "date" | "status"
  order?: "asc" | "desc"
  search?: string
}
