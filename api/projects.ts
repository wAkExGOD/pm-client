import { apiInstance } from "./instance"
import {
  AddProjectMemberDto,
  CreateProjectDto,
  ProjectDetails,
  ProjectMember,
  ProjectSummary,
  UpdateProjectDto,
} from "@/types/Project"

export const projectsApi = {
  list: () => apiInstance<ProjectSummary[]>("/projects"),
  getById: (projectId: number) =>
    apiInstance<ProjectDetails>(`/projects/${projectId}`),
  create: (projectData: CreateProjectDto) =>
    apiInstance<ProjectSummary>("/projects", {
      method: "POST",
      json: projectData,
    }),
  update: (projectId: number, projectData: UpdateProjectDto) =>
    apiInstance<ProjectSummary>(`/projects/${projectId}`, {
      method: "PATCH",
      json: projectData,
    }),
  listMembers: (projectId: number) =>
    apiInstance<ProjectMember[]>(`/projects/${projectId}/members`),
  addMemberByEmail: (projectId: number, memberData: AddProjectMemberDto) =>
    apiInstance<ProjectMember>(`/projects/${projectId}/members/add-by-email`, {
      method: "POST",
      json: memberData,
    }),
}
