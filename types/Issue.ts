export type IssueType = "BUG" | "TASK" | "STORY"
export type IssuePriority = "LOW" | "MEDIUM" | "HIGH"
export type IssueStatus = "TODO" | "IN_PROGRESS" | "DONE"

export type IssueUser = {
  id: number
  name: string
  email: string
}

export type IssueSprint = {
  id: number
  name: string
  isActive: boolean
}

export type Issue = {
  id: number
  projectId: number
  title: string
  description: string | null
  type: IssueType
  priority: IssuePriority
  status: IssueStatus
  assigneeId: number | null
  reporterId: number
  sprintId: number | null
  createdAt: string
  updatedAt: string
  assignee: IssueUser | null
  reporter: IssueUser
  sprint: IssueSprint | null
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
  assigneeId?: number
  sprintId?: number
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
  search?: string
}
