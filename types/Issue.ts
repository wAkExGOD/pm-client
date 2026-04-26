export type IssueType = "BUG" | "TASK" | "STORY"
export type IssuePriority = "LOW" | "MEDIUM" | "HIGH"
export type IssueStatus = "TODO" | "IN_PROGRESS" | "CODE_REVIEW" | "DONE"

export const ISSUE_STATUSES: IssueStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "CODE_REVIEW",
  "DONE",
]

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  CODE_REVIEW: "Code review",
  DONE: "Done",
}

export type IssueUser = {
  id: number
  name: string
  email: string
  avatarUrl?: string | null
}

export type IssueSprint = {
  id: number
  name: string
  isActive: boolean
}

export type IssueRelease = {
  id: number
  name: string
  status: "UNRELEASED" | "RELEASED"
  releaseDate: string
}

export type Issue = {
  id: number
  projectId: number
  title: string
  description: string | null
  type: IssueType
  priority: IssuePriority
  status: IssueStatus
  storyPoints: number | null
  assigneeId: number | null
  reporterId: number
  sprintId: number | null
  releaseId: number | null
  createdAt: string
  updatedAt: string
  assignee: IssueUser | null
  reporter: IssueUser
  sprint: IssueSprint | null
  release: IssueRelease | null
}

export type IssueListResponse = {
  items: Issue[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type CreateIssueDto = {
  title: string
  description?: string
  type: IssueType
  priority: IssuePriority
  status?: IssueStatus
  assigneeId?: number | null
  sprintId?: number | null
  releaseId?: number | null
  storyPoints?: number | null
}

export type UpdateIssueDto = Partial<CreateIssueDto>

export type IssueFilters = {
  page?: number
  pageSize?: number
  status?: IssueStatus
  priority?: IssuePriority
  type?: IssueType
  assigneeId?: number
  reporterId?: number
  sprintId?: number | null
  releaseId?: number | null
  search?: string
}

export type BacklogResponse = {
  activeSprint: {
    id: number
    name: string
    startDate: string
    endDate: string
  } | null
  items: Issue[]
}

export type BacklogFilters = {
  search?: string
  sortBy?: "priority" | "createdAt"
  order?: "asc" | "desc"
}

export type BoardColumn = {
  status: IssueStatus
  items: Issue[]
}

export type BoardResponse = {
  columns: BoardColumn[]
}

export type IssueComment = {
  id: number
  content: string
  createdAt: string
  updatedAt: string
  author: IssueUser
}
