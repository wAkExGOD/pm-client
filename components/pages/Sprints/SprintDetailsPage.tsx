"use client"

import { projectsApi, sprintsApi } from "@/api"
import { IssuesList } from "@/components/issues/IssuesList"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProjects } from "@/hooks/useProjects"
import {
  ISSUE_STATUS_LABELS,
  ISSUE_STATUSES,
  type IssueStatus,
} from "@/types/Issue"
import type { SprintIssueFilters } from "@/types/Sprint"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

type SprintDetailsPageProps = {
  projectId: number
  sprintId: number
}

export function SprintDetailsPage({
  projectId,
  sprintId,
}: SprintDetailsPageProps) {
  const { setSelectedProjectId } = useProjects()
  const [filters, setFilters] = useState<SprintIssueFilters>({
    sortBy: "date",
    order: "desc",
  })

  useEffect(() => {
    setSelectedProjectId(projectId)
  }, [projectId, setSelectedProjectId])

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getById(projectId),
  })

  const membersQuery = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => projectsApi.listMembers(projectId),
  })

  const sprintInfoQuery = useQuery({
    queryKey: ["sprint", projectId, sprintId, "info"],
    queryFn: () => sprintsApi.getById(projectId, sprintId),
  })

  const sprintIssuesQuery = useQuery({
    queryKey: ["sprint", projectId, sprintId, "issues", filters],
    queryFn: () => sprintsApi.getById(projectId, sprintId, filters),
  })

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>{sprintInfoQuery.data?.name || `Sprint #${sprintId}`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Project: {projectQuery.data?.name || "Project"}{" "}
            {projectQuery.data ? `(${projectQuery.data.key})` : ""}
          </p>
          <p>Status: {sprintInfoQuery.data?.isActive ? "Active" : "Inactive"}</p>
          <p>
            Start: {sprintInfoQuery.data?.startDate.slice(0, 10) || "—"} · End:{" "}
            {sprintInfoQuery.data?.endDate.slice(0, 10) || "—"}
          </p>
          <p>{sprintInfoQuery.data?.goal || "No sprint goal yet."}</p>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Sprint Issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Search issues"
              value={filters.search ?? ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  search: event.target.value || undefined,
                }))
              }
            />
            <Select
              value={filters.sortBy ?? "date"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: value as SprintIssueFilters["sortBy"],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.status ?? "all-statuses"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status:
                    value === "all-statuses"
                      ? undefined
                      : (value as IssueStatus),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Issue status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All statuses</SelectItem>
                {ISSUE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {ISSUE_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={
                filters.assigneeId !== undefined
                  ? String(filters.assigneeId)
                  : "all-assignees"
              }
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  assigneeId:
                    value === "all-assignees" ? undefined : Number(value),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Task performer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-assignees">All performers</SelectItem>
                {membersQuery.data?.map((member) => (
                  <SelectItem key={member.user.id} value={String(member.user.id)}>
                    {member.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sprintIssuesQuery.isLoading ? <p>Loading sprint issues...</p> : null}
          {!sprintIssuesQuery.isLoading ? (
            <IssuesList
              issues={sprintIssuesQuery.data?.issues ?? []}
              projectId={projectId}
              projectKey={projectQuery.data?.key ?? "PRJ"}
              members={membersQuery.data ?? []}
              emptyMessage="No issues in this sprint yet."
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
