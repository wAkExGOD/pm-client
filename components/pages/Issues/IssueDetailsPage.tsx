"use client"

import { issuesApi, projectsApi, releasesApi, sprintsApi } from "@/api"
import { IssueForm, type IssueFormValues } from "@/components/issues/IssueForm"
import { UserAvatar } from "@/components/common"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useProjects } from "@/hooks/useProjects"
import { useAuth } from "@/hooks/useAuth"
import { ROUTES } from "@/lib/constants/routes"
import { type UpdateIssueDto } from "@/types/Issue"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type IssueDetailsPageProps = {
  projectId: number
  issueId: number
}

const normalizeDescription = (value?: string | null) => {
  const normalized = value?.trim() || "<p></p>"
  return normalized === "<p></p>" || normalized === "<p></p><p></p>"
    ? "<p></p>"
    : normalized
}

type CommentFormValues = {
  content: string
}

export function IssueDetailsPage({
  projectId,
  issueId,
}: IssueDetailsPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { setSelectedProjectId } = useProjects()
  const { user } = useAuth()

  useEffect(() => {
    setSelectedProjectId(projectId)
  }, [projectId, setSelectedProjectId])

  const issueQuery = useQuery({
    queryKey: ["issue", projectId, issueId],
    queryFn: () => issuesApi.getById(projectId, issueId),
  })

  const commentsQuery = useQuery({
    queryKey: ["issue-comments", projectId, issueId],
    queryFn: () => issuesApi.listComments(projectId, issueId),
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

  const releasesQuery = useQuery({
    queryKey: ["releases", projectId, "issue-form"],
    queryFn: () => releasesApi.list(projectId),
  })

  const form = useForm<IssueFormValues>({
    defaultValues: {
      title: "",
      description: "<p></p>",
      type: "TASK",
      priority: "MEDIUM",
      status: "TODO",
      storyPoints: null,
      assigneeId: null,
      sprintId: null,
      releaseId: null,
    },
  })

  const commentForm = useForm<CommentFormValues>({
    defaultValues: {
      content: "",
    },
  })

  useEffect(() => {
    if (!issueQuery.data) {
      return
    }

    form.reset({
      title: issueQuery.data.title,
      description: issueQuery.data.description || "<p></p>",
      type: issueQuery.data.type,
      priority: issueQuery.data.priority,
      status: issueQuery.data.status,
      storyPoints: issueQuery.data.storyPoints,
      assigneeId: issueQuery.data.assigneeId,
      sprintId: issueQuery.data.sprintId,
      releaseId: issueQuery.data.releaseId,
    })
  }, [form, issueQuery.data])

  const updateIssueMutation = useMutation({
    mutationFn: (values: UpdateIssueDto) =>
      issuesApi.update(projectId, issueId, values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["issue", projectId, issueId],
        }),
        queryClient.invalidateQueries({ queryKey: ["issues", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["releases", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["release", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["sprint", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["summary", projectId] }),
      ])
      toast.success("Issue updated")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const createCommentMutation = useMutation({
    mutationFn: (values: CommentFormValues) =>
      issuesApi.createComment(projectId, issueId, values.content.trim()),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["issue-comments", projectId, issueId],
      })
      commentForm.reset({ content: "" })
      toast.success("Comment added")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      issuesApi.deleteComment(projectId, issueId, commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["issue-comments", projectId, issueId],
      })
      toast.success("Comment deleted")
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
    <div className="space-y-6">
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
            <IssueForm
              form={form}
              members={membersQuery.data ?? []}
              sprints={sprintsQuery.data ?? []}
              releases={releasesQuery.data ?? []}
              onSubmit={(values) => {
                const currentIssue = issueQuery.data

                if (!currentIssue) {
                  return
                }

                const nextValues: UpdateIssueDto = {
                  title: values.title?.trim(),
                  description: normalizeDescription(values.description),
                  type: values.type,
                  priority: values.priority,
                  status: values.status,
                  storyPoints: values.storyPoints ?? null,
                  assigneeId: values.assigneeId ?? null,
                  sprintId: values.sprintId ?? null,
                  releaseId: values.releaseId ?? null,
                }

                const patch: UpdateIssueDto = {}

                if (nextValues.title !== currentIssue.title) {
                  patch.title = nextValues.title
                }
                if (
                  nextValues.description !==
                  normalizeDescription(currentIssue.description)
                ) {
                  patch.description = nextValues.description
                }
                if (nextValues.type !== currentIssue.type) {
                  patch.type = nextValues.type
                }
                if (nextValues.priority !== currentIssue.priority) {
                  patch.priority = nextValues.priority
                }
                if (nextValues.status !== currentIssue.status) {
                  patch.status = nextValues.status
                }
                if (nextValues.storyPoints !== currentIssue.storyPoints) {
                  patch.storyPoints = nextValues.storyPoints
                }
                if (nextValues.assigneeId !== currentIssue.assigneeId) {
                  patch.assigneeId = nextValues.assigneeId
                }
                if (nextValues.sprintId !== currentIssue.sprintId) {
                  patch.sprintId = nextValues.sprintId
                }
                if (nextValues.releaseId !== currentIssue.releaseId) {
                  patch.releaseId = nextValues.releaseId
                }

                if (!Object.keys(patch).length) {
                  toast.info("No changes to save")
                  return
                }

                updateIssueMutation.mutate(patch)
              }}
              submitLabel="Save changes"
              isSubmitting={updateIssueMutation.isPending}
              footer={
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => deleteIssueMutation.mutate()}
                  disabled={deleteIssueMutation.isPending}
                >
                  Delete issue
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...commentForm}>
            <form
              onSubmit={commentForm.handleSubmit((values) =>
                createCommentMutation.mutate(values),
              )}
              className="space-y-3"
            >
              <FormField
                control={commentForm.control}
                name="content"
                rules={{ required: "Comment text is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Leave a comment..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createCommentMutation.isPending}>
                Add comment
              </Button>
            </form>
          </Form>

          {commentsQuery.isLoading ? <p>Loading comments...</p> : null}
          {!commentsQuery.isLoading && !commentsQuery.data?.length ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : null}
          <div className="space-y-3">
            {commentsQuery.data?.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-border/60 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={comment.author.name}
                      email={comment.author.email}
                      avatarUrl={comment.author.avatarUrl}
                    />
                    <div>
                      <p className="font-medium">{comment.author.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {comment.createdAt.slice(0, 16).replace("T", " ")}
                      </p>
                    </div>
                  </div>
                  {projectQuery.data &&
                  user &&
                  (projectQuery.data.currentUserRole === "OWNER" ||
                    projectQuery.data.currentUserRole === "ADMIN" ||
                    comment.author.id === user.id) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                      disabled={deleteCommentMutation.isPending}
                    >
                      Delete
                    </Button>
                  ) : null}
                </div>
                <p className="text-sm leading-6 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
