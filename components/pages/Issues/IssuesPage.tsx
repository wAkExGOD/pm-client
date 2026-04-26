"use client"

import { issuesApi, projectsApi } from "@/api"
import { CreateIssueDialog } from "@/components/issues/CreateIssueDialog"
import { IssuesList } from "@/components/issues/IssuesList"
import { Button } from "@/components/ui/button"
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
import { ISSUE_PRIORITIES } from "@/lib/constants/priorities"
import {
  ISSUE_STATUS_LABELS,
  ISSUE_STATUSES,
  type IssueFilters,
  type IssuePriority,
  type IssueStatus,
  type IssueType,
} from "@/types/Issue"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

type IssuesPageProps = {
  projectId: number
}

export function IssuesPage({ projectId }: IssuesPageProps) {
  const { setSelectedProjectId } = useProjects()
  const [filters, setFilters] = useState<IssueFilters>({
    page: 1,
    pageSize: 10,
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

  const issuesQuery = useQuery({
    queryKey: ["issues", projectId, filters],
    queryFn: () => issuesApi.list(projectId, filters),
  })

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>
              {projectQuery.data?.name || "Project"}{" "}
              {projectQuery.data ? `(${projectQuery.data.key})` : ""} Issues
            </CardTitle>
            <CreateIssueDialog
              projectId={projectId}
              trigger={<Button>Create issue</Button>}
            />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            {projectQuery.data?.description ||
              "Track tickets and delivery work here."}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Issue Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search title or description"
            value={filters.search ?? ""}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                page: 1,
                search: event.target.value || undefined,
              }))
            }
          />
          <div className="flex gap-4">
            <Select
              value={filters.status ?? "all-statuses"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  page: 1,
                  status:
                    value === "all-statuses"
                      ? undefined
                      : (value as IssueStatus),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
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
              value={filters.priority ?? "all-priorities"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  page: 1,
                  priority:
                    value === "all-priorities"
                      ? undefined
                      : (value as IssuePriority),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-priorities">All priorities</SelectItem>
                {ISSUE_PRIORITIES.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type ?? "all-types"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  page: 1,
                  type:
                    value === "all-types" ? undefined : (value as IssueType),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All types</SelectItem>
                {["TASK", "BUG", "STORY"].map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {issuesQuery.isLoading ? <p>Loading issues...</p> : null}

          {!issuesQuery.isLoading ? (
            <IssuesList
              issues={issuesQuery.data?.items ?? []}
              projectId={projectId}
              projectKey={projectQuery.data?.key ?? "PRJ"}
              members={membersQuery.data ?? []}
              emptyMessage="No issues found."
            />
          ) : null}

          {issuesQuery.data?.totalPages && issuesQuery.data.totalPages > 1 ? (
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                disabled={(filters.page ?? 1) <= 1}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page ?? 1) - 1,
                  }))
                }
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {issuesQuery.data.page} of {issuesQuery.data.totalPages}
              </span>
              <Button
                variant="outline"
                disabled={(filters.page ?? 1) >= issuesQuery.data.totalPages}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    page: (prev.page ?? 1) + 1,
                  }))
                }
              >
                Next
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
