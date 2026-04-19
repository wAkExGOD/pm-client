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
