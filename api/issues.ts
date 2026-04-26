import { apiInstance } from "./instance"
import {
  BacklogFilters,
  BacklogResponse,
  BoardResponse,
  CreateIssueDto,
  IssueComment,
  Issue,
  IssueFilters,
  IssueListResponse,
  UpdateIssueDto,
} from "@/types/Issue"
import { ProjectSummaryStats } from "@/types/Summary"

const buildIssueQuery = (filters?: IssueFilters) => {
  if (!filters) {
    return ""
  }

  const searchParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }

    if (value === null) {
      searchParams.set(key, "null")
      return
    }

    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

export const issuesApi = {
  list: (projectId: number, filters?: IssueFilters) =>
    apiInstance<IssueListResponse>(
      `/projects/${projectId}/issues${buildIssueQuery(filters)}`,
    ),
  getById: (projectId: number, issueId: number) =>
    apiInstance<Issue>(`/projects/${projectId}/issues/${issueId}`),
  create: (projectId: number, issueData: CreateIssueDto) =>
    apiInstance<Issue>(`/projects/${projectId}/issues`, {
      method: "POST",
      json: issueData,
    }),
  update: (projectId: number, issueId: number, issueData: UpdateIssueDto) =>
    apiInstance<Issue>(`/projects/${projectId}/issues/${issueId}`, {
      method: "PATCH",
      json: issueData,
    }),
  remove: (projectId: number, issueId: number) =>
    apiInstance<{ success: boolean }>(`/projects/${projectId}/issues/${issueId}`, {
      method: "DELETE",
    }),
  getBacklog: (projectId: number, filters?: BacklogFilters) =>
    apiInstance<BacklogResponse>(
      `/projects/${projectId}/backlog${buildIssueQuery(filters)}`,
    ),
  getBoard: (projectId: number) =>
    apiInstance<BoardResponse>(`/projects/${projectId}/board`),
  moveToSprint: (projectId: number, issueId: number, sprintId?: number) =>
    apiInstance<Issue>(`/projects/${projectId}/issues/${issueId}/move-to-sprint`, {
      method: "POST",
      json: {
        sprintId,
      },
    }),
  listComments: (projectId: number, issueId: number) =>
    apiInstance<IssueComment[]>(`/projects/${projectId}/issues/${issueId}/comments`),
  createComment: (projectId: number, issueId: number, content: string) =>
    apiInstance<IssueComment>(`/projects/${projectId}/issues/${issueId}/comments`, {
      method: "POST",
      json: { content },
    }),
  deleteComment: (projectId: number, issueId: number, commentId: number) =>
    apiInstance<{ success: boolean }>(
      `/projects/${projectId}/issues/${issueId}/comments/${commentId}`,
      {
        method: "DELETE",
      },
    ),
  getSummary: (projectId: number) =>
    apiInstance<ProjectSummaryStats>(`/projects/${projectId}/summary`),
}
