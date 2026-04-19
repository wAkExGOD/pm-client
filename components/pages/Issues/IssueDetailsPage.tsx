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
  type IssuePriority,
  type IssueStatus,
  type IssueType,
  type UpdateIssueDto,
} from "@/types/Issue"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type IssueDetailsPageProps = {
  projectId: number
  issueId: number
}

const ISSUE_TYPES: IssueType[] = ["TASK", "BUG", "STORY"]
const ISSUE_PRIORITIES: IssuePriority[] = ["LOW", "MEDIUM", "HIGH"]
const ISSUE_STATUSES: IssueStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

export function IssueDetailsPage({
  projectId,
  issueId,
}: IssueDetailsPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setSelectedProjectId } = useProjects()

  useEffect(() => {
    setSelectedProjectId(projectId)
  }, [projectId, setSelectedProjectId])

  const issueQuery = useQuery({
    queryKey: ["issue", projectId, issueId],
    queryFn: () => issuesApi.getById(projectId, issueId),
  })

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

  const form = useForm<UpdateIssueDto>({
    defaultValues: {
      title: "",
      description: "",
      type: "TASK",
      priority: "MEDIUM",
      status: "TODO",
      assigneeId: undefined,
      sprintId: undefined,
    },
  })

  useEffect(() => {
    if (!issueQuery.data) {
      return
    }

    console.log(
      issueQuery.data,
      issueQuery.data.assigneeId ?? undefined,
      issueQuery.data.sprintId ?? undefined,
    )
    form.reset({
      title: issueQuery.data.title,
      description: issueQuery.data.description || "",
      type: issueQuery.data.type,
      priority: issueQuery.data.priority,
      status: issueQuery.data.status,
      assigneeId: issueQuery.data.assigneeId ?? undefined,
      sprintId: issueQuery.data.sprintId ?? undefined,
    })
  }, [form, issueQuery.data])

  const updateIssueMutation = useMutation({
    mutationFn: (values: UpdateIssueDto) =>
      issuesApi.update(projectId, issueId, {
        ...values,
        title: values.title?.trim(),
        description: values.description?.trim() || undefined,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["issue", projectId, issueId],
        }),
        queryClient.invalidateQueries({ queryKey: ["issues", projectId] }),
      ])
      toast.success("Issue updated")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteIssueMutation = useMutation({
    mutationFn: () => issuesApi.remove(projectId, issueId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["issues", projectId] })
      toast.success("Issue deleted")
      router.push(ROUTES.projectIssues(projectId))
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>
          {projectQuery.data
            ? `${projectQuery.data.key}-${issueId}`
            : `Issue #${issueId}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {issueQuery.isLoading ? (
          <p>Loading issue...</p>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) =>
                updateIssueMutation.mutate(values),
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
                      <Input {...field} />
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
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value as IssueType)
                        }
                        value={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
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
                        value={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
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
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value as IssueStatus)
                        }
                        value={field.value ?? undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
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
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="assigneeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>
                      <Select
                        key={field.value}
                        onValueChange={(value) =>
                          field.onChange(
                            value === "unassigned" ? undefined : Number(value),
                          )
                        }
                        value={
                          field.value !== undefined
                            ? String(field.value)
                            : "unassigned"
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
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
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sprintId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sprint</FormLabel>
                      <Select
                        key={field.value}
                        onValueChange={(value) =>
                          field.onChange(
                            value === "backlog" ? undefined : Number(value),
                          )
                        }
                        value={
                          field.value !== undefined
                            ? String(field.value)
                            : "backlog"
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sprint" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="backlog">No sprint</SelectItem>
                          {sprintsQuery.data?.map((sprint) => (
                            <SelectItem
                              key={sprint.id}
                              value={String(sprint.id)}
                            >
                              {sprint.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={updateIssueMutation.isPending}>
                  Save changes
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => deleteIssueMutation.mutate()}
                  disabled={deleteIssueMutation.isPending}
                >
                  Delete issue
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}
