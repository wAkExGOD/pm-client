import type { Issue, IssueStatus } from "./Issue"

export type ReleaseStatus = "UNRELEASED" | "RELEASED"

export type ReleaseInitiator = {
  id: number
  name: string
  email: string
}

export type ReleaseSummary = {
  id: number
  projectId: number
  initiatorId: number
  name: string
  description: string
  startDate: string
  releaseDate: string
  status: ReleaseStatus
  createdAt: string
  updatedAt: string
  initiator: ReleaseInitiator
  issueCount: number
}

export type ReleaseDetails = ReleaseSummary & {
  issues: Issue[]
}

export type ReleaseFilters = {
  status?: ReleaseStatus
  search?: string
}

export type ReleaseIssueFilters = {
  status?: IssueStatus
  assigneeId?: number
  sortBy?: "date" | "status"
  order?: "asc" | "desc"
  search?: string
}

export type CreateReleaseDto = {
  name: string
  description?: string
  startDate: string
  releaseDate: string
  status?: ReleaseStatus
}
