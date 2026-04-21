"use client"

import { projectsApi, releasesApi } from "@/api"
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
import { ROUTES } from "@/lib/constants/routes"
import {
  ISSUE_STATUS_LABELS,
  ISSUE_STATUSES,
  type IssueStatus,
} from "@/types/Issue"
import type { ReleaseIssueFilters } from "@/types/Release"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useEffect, useState } from "react"

type ReleaseDetailsPageProps = {
  projectId: number
  releaseId: number
}

export function ReleaseDetailsPage({
  projectId,
  releaseId,
}: ReleaseDetailsPageProps) {
  const { setSelectedProjectId } = useProjects()
  const [filters, setFilters] = useState<ReleaseIssueFilters>({
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

  const releaseInfoQuery = useQuery({
    queryKey: ["release", projectId, releaseId, "info"],
    queryFn: () => releasesApi.getById(projectId, releaseId),
  })

  const releaseIssuesQuery = useQuery({
    queryKey: ["release", projectId, releaseId, "issues", filters],
    queryFn: () => releasesApi.getById(projectId, releaseId, filters),
  })

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>
            {releaseInfoQuery.data?.name || `Release #${releaseId}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Project: {projectQuery.data?.name || "Project"}{" "}
            {projectQuery.data ? `(${projectQuery.data.key})` : ""}
          </p>
          <p>Status: {releaseInfoQuery.data?.status || "UNRELEASED"}</p>
          <p>
            Start: {releaseInfoQuery.data?.startDate.slice(0, 10) || "—"} · Release:{" "}
            {releaseInfoQuery.data?.releaseDate.slice(0, 10) || "—"}
          </p>
          <p>Initiator: {releaseInfoQuery.data?.initiator.name || "—"}</p>
          <p>{releaseInfoQuery.data?.description || "No description yet."}</p>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Main Section</CardTitle>
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
                  sortBy: value as ReleaseIssueFilters["sortBy"],
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
                  <SelectItem
                    key={member.user.id}
                    value={String(member.user.id)}
                  >
                    {member.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {releaseIssuesQuery.isLoading ? <p>Loading release issues...</p> : null}
            {!releaseIssuesQuery.isLoading &&
            !releaseIssuesQuery.data?.issues.length ? (
              <p className="text-sm text-muted-foreground">
                No issues in this release yet.
              </p>
            ) : null}
            {releaseIssuesQuery.data?.issues.map((issue) => (
              <Link
                key={issue.id}
                href={ROUTES.projectIssue(projectId, issue.id)}
                className="block rounded-xl border border-border/60 p-4 transition hover:border-foreground/20 hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{issue.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {issue.type} · {issue.priority} ·{" "}
                      {ISSUE_STATUS_LABELS[issue.status]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {issue.assignee ? issue.assignee.name : "Unassigned"}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>#{issue.id}</p>
                    <p>{issue.updatedAt.slice(0, 10)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
