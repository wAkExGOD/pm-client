"use client"

import { issuesApi, projectsApi } from "@/api"
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
import { ROUTES } from "@/lib/constants/routes"
import { type BacklogFilters } from "@/types/Issue"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type BacklogPageProps = {
  projectId: number
}

export function BacklogPage({ projectId }: BacklogPageProps) {
  const queryClient = useQueryClient()
  const { setSelectedProjectId } = useProjects()
  const [filters, setFilters] = useState<BacklogFilters>({
    sortBy: "priority",
    order: "desc",
  })

  useEffect(() => {
    setSelectedProjectId(projectId)
  }, [projectId, setSelectedProjectId])

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getById(projectId),
  })

  const backlogQuery = useQuery({
    queryKey: ["backlog", projectId, filters],
    queryFn: () => issuesApi.getBacklog(projectId, filters),
  })

  const refreshProjectData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["backlog", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["issues", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["issue", projectId] }),
    ])
  }

  const moveToActiveSprintMutation = useMutation({
    mutationFn: (issueId: number) => {
      const activeSprintId = backlogQuery.data?.activeSprint?.id

      if (!activeSprintId) {
        throw new Error("No active sprint available")
      }

      return issuesApi.moveToSprint(projectId, issueId, activeSprintId)
    },
    onSuccess: async () => {
      await refreshProjectData()
      toast.success("Issue moved to active sprint")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const moveToBacklogMutation = useMutation({
    mutationFn: (issueId: number) => issuesApi.moveToSprint(projectId, issueId),
    onSuccess: async () => {
      await refreshProjectData()
      toast.success("Issue moved to backlog")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>
            {projectQuery.data?.name || "Project"}{" "}
            {projectQuery.data ? `(${projectQuery.data.key})` : ""} Backlog
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            {backlogQuery.data?.activeSprint
              ? `Active sprint: ${backlogQuery.data.activeSprint.name}`
              : "There is no active sprint yet. Backlog still shows issues outside any active sprint."}
          </p>
          <p>{projectQuery.data?.description || "Plan work before it enters the sprint."}</p>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Backlog Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <Input
            placeholder="Search backlog"
            value={filters.search ?? ""}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                search: event.target.value || undefined,
              }))
            }
          />
          <Select
            value={filters.sortBy ?? "priority"}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: value as BacklogFilters["sortBy"],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="createdAt">Created date</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.order ?? "desc"}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                order: value as BacklogFilters["order"],
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Backlog Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {backlogQuery.isLoading ? <p>Loading backlog...</p> : null}
          {!backlogQuery.isLoading && !backlogQuery.data?.items.length ? (
            <p className="text-sm text-muted-foreground">No backlog items found.</p>
          ) : null}
          {backlogQuery.data?.items.map((issue) => (
            <div
              key={issue.id}
              className="rounded-xl border border-border/60 p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {issue.type} · {issue.priority} · {issue.status}
                  </p>
                  <Link
                    href={ROUTES.projectIssue(projectId, issue.id)}
                    className="font-semibold hover:underline"
                  >
                    {issue.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {issue.assignee
                      ? `Assigned to ${issue.assignee.name}`
                      : "Unassigned"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {issue.sprint?.name
                      ? `Current sprint: ${issue.sprint.name}`
                      : "Currently in backlog"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {backlogQuery.data.activeSprint ? (
                    <Button
                      size="sm"
                      onClick={() => moveToActiveSprintMutation.mutate(issue.id)}
                      disabled={moveToActiveSprintMutation.isPending}
                    >
                      Move to active sprint
                    </Button>
                  ) : null}
                  {issue.sprintId ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveToBacklogMutation.mutate(issue.id)}
                      disabled={moveToBacklogMutation.isPending}
                    >
                      Move to backlog
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
