export type ProjectRole = "OWNER" | "ADMIN" | "MEMBER"

export type ProjectSummary = {
  id: number
  key: string
  name: string
  description: string
  ownerId: number
  createdAt: string
  updatedAt: string
  currentUserRole: ProjectRole
  memberCount: number
}

export type ProjectDetails = ProjectSummary & {
  owner: {
    id: number
    email: string
    name: string
    avatarUrl?: string | null
  }
}

export type CreateProjectDto = {
  name: string
  key: string
  description?: string
}

export type UpdateProjectDto = Partial<CreateProjectDto>

export type ProjectMember = {
  id: number
  role: ProjectRole
  createdAt: string
  user: {
    id: number
    email: string
    name: string
    avatarUrl?: string | null
    verified: boolean
  }
}

export type AddProjectMemberDto = {
  email: string
  role: ProjectRole
}
