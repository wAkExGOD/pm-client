export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  SETTINGS: "/settings",
  projectBacklog: (projectId: number) => `/projects/${projectId}/backlog`,
  projectBoard: (projectId: number) => `/projects/${projectId}/board`,
  projectSummary: (projectId: number) => `/projects/${projectId}/summary`,
  projectReleases: (projectId: number) => `/projects/${projectId}/releases`,
  projectRelease: (projectId: number, releaseId: number) =>
    `/projects/${projectId}/releases/${releaseId}`,
  projectTeam: (projectId: number) => `/projects/${projectId}/team`,
  projectIssues: (projectId: number) => `/projects/${projectId}/issues`,
  projectIssue: (projectId: number, issueId: number) =>
    `/projects/${projectId}/issues/${issueId}`,
  projectSprints: (projectId: number) => `/projects/${projectId}/sprints`,
  projectSprint: (projectId: number, sprintId: number) =>
    `/projects/${projectId}/sprints/${sprintId}`,
}
