"use client"

import { issuesApi, releasesApi, sprintsApi, projectsApi } from "@/api"
import { IssueForm, type IssueFormValues } from "@/components/issues/IssueForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type CreateIssueDialogProps = {
  projectId: number
  trigger: ReactNode
  title?: string
}

const DEFAULT_VALUES: IssueFormValues = {
  title: "",
  description: "<p></p>",
  type: "TASK",
  priority: "MEDIUM",
  status: "TODO",
  storyPoints: null,
  assigneeId: null,
  sprintId: null,
  releaseId: null,
}

export function CreateIssueDialog({
  projectId,
  trigger,
  title = "Create issue",
}: CreateIssueDialogProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const form = useForm<IssueFormValues>({
    defaultValues: DEFAULT_VALUES,
  })

  const membersQuery = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => projectsApi.listMembers(projectId),
    enabled: open,
  })

  const sprintsQuery = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => sprintsApi.list(projectId),
    enabled: open,
  })

  const releasesQuery = useQuery({
    queryKey: ["releases", projectId, "issue-form"],
    queryFn: () => releasesApi.list(projectId),
    enabled: open,
  })

  const createIssueMutation = useMutation({
    mutationFn: (values: IssueFormValues) =>
      issuesApi.create(projectId, {
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        type: values.type,
        priority: values.priority,
        status: values.status,
        storyPoints: values.storyPoints,
        assigneeId: values.assigneeId,
        sprintId: values.sprintId,
        releaseId: values.releaseId,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["issues", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["issue", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["backlog", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["releases", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["sprints", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["summary", projectId] }),
      ])
      form.reset(DEFAULT_VALUES)
      setOpen(false)
      toast.success("Issue created")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92vh] sm:max-w-[50vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <IssueForm
          form={form}
          members={membersQuery.data ?? []}
          sprints={sprintsQuery.data ?? []}
          releases={releasesQuery.data ?? []}
          onSubmit={(values) => createIssueMutation.mutate(values)}
          submitLabel="Create issue"
          isSubmitting={createIssueMutation.isPending}
          submitClassName="w-full sm:w-auto"
          footer={
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          }
        />
      </DialogContent>
    </Dialog>
  )
}
