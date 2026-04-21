export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  SETTINGS: "/settings",
  projectBacklog: (projectId: number) => `/projects/${projectId}/backlog`,
  projectTeam: (projectId: number) => `/projects/${projectId}/team`,
  projectIssues: (projectId: number) => `/projects/${projectId}/issues`,
  projectIssue: (projectId: number, issueId: number) =>
    `/projects/${projectId}/issues/${issueId}`,
  projectSprints: (projectId: number) => `/projects/${projectId}/sprints`,
}
