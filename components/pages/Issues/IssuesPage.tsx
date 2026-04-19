"use client"

import { issuesApi, projectsApi, sprintsApi } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
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
  type CreateIssueDto,
  type IssueFilters,
  type IssuePriority,
  type IssueStatus,
  type IssueType,
} from "@/types/Issue"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type IssuesPageProps = {
  projectId: number
}

const ISSUE_TYPES: IssueType[] = ["TASK", "BUG", "STORY"]
const ISSUE_PRIORITIES: IssuePriority[] = ["LOW", "MEDIUM", "HIGH"]
const ISSUE_STATUSES: IssueStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

export function IssuesPage({ projectId }: IssuesPageProps) {
  const queryClient = useQueryClient()
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

  const sprintsQuery = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => sprintsApi.list(projectId),
  })

  const issuesQuery = useQuery({
    queryKey: ["issues", projectId, filters],
    queryFn: () => issuesApi.list(projectId, filters),
  })

  const form = useForm<CreateIssueDto>({
    defaultValues: {
      title: "",
      description: "",
      type: "TASK",
      priority: "MEDIUM",
      status: "TODO",
    },
  })

  const refreshIssues = async () => {
    await queryClient.invalidateQueries({ queryKey: ["issues", projectId] })
  }

  const createIssueMutation = useMutation({
    mutationFn: (values: CreateIssueDto) =>
      issuesApi.create(projectId, {
        ...values,
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
      }),
    onSuccess: async () => {
      await refreshIssues()
      form.reset({
        title: "",
        description: "",
        type: "TASK",
        priority: "MEDIUM",
        status: "TODO",
      })
      toast.success("Issue created")
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
            {projectQuery.data ? `(${projectQuery.data.key})` : ""} Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{projectQuery.data?.description || "Track tickets and delivery work here."}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Create Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) =>
                  createIssueMutation.mutate(values),
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Fix sprint activation edge case" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Short issue summary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value as IssueType)}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ISSUE_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value as IssuePriority)
                          }
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ISSUE_PRIORITIES.map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {priority}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(value as IssueStatus)}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ISSUE_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assigneeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignee</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === "unassigned" ? undefined : Number(value))
                          }
                          defaultValue={
                            field.value !== undefined ? String(field.value) : "unassigned"
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {membersQuery.data?.map((member) => (
                              <SelectItem key={member.user.id} value={String(member.user.id)}>
                                {member.user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="sprintId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sprint</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value === "backlog" ? undefined : Number(value))
                        }
                        defaultValue={
                          field.value !== undefined ? String(field.value) : "backlog"
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="backlog">No sprint</SelectItem>
                          {sprintsQuery.data?.map((sprint) => (
                            <SelectItem key={sprint.id} value={String(sprint.id)}>
                              {sprint.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createIssueMutation.isPending}
                >
                  Create issue
                </Button>
              </form>
            </Form>
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
            <div className="grid gap-4 sm:grid-cols-3">
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
                      {status}
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
                    type: value === "all-types" ? undefined : (value as IssueType),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All types</SelectItem>
                  {ISSUE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {issuesQuery.isLoading ? <p>Loading issues...</p> : null}
              {!issuesQuery.isLoading && !issuesQuery.data?.items.length ? (
                <p className="text-sm text-muted-foreground">No issues found.</p>
              ) : null}
              {issuesQuery.data?.items.map((issue) => (
                <Link
                  key={issue.id}
                  href={ROUTES.projectIssue(projectId, issue.id)}
                  className="block rounded-xl border border-border/60 p-4 transition hover:border-foreground/20 hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {issue.type} · {issue.priority} · {issue.status}
                      </p>
                      <h3 className="font-semibold">{issue.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {issue.assignee ? `Assigned to ${issue.assignee.name}` : "Unassigned"}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>#{issue.id}</p>
                      <p>{issue.sprint?.name || "Backlog"}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

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
    </div>
  )
}
