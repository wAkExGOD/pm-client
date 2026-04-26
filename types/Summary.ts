import type { User } from "./User"

export type SummaryChartItem = {
  label: string
  value: number
}

export type SummaryWorkloadItem = {
  user: User
  value: number
}

export type ProjectSummaryStats = {
  completedLast7Days: number
  createdLast7Days: number
  issuesByStatus: SummaryChartItem[]
  issuesByType: SummaryChartItem[]
  issuesByPriority: SummaryChartItem[]
  teamWorkload: SummaryWorkloadItem[]
}
