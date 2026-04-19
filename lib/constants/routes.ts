export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  SETTINGS: "/settings",
  projectTeam: (projectId: number) => `/projects/${projectId}/team`,
  projectSprints: (projectId: number) => `/projects/${projectId}/sprints`,
}
