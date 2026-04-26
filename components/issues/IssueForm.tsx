"use client"

import { RichTextEditor, UserAvatar } from "@/components/common"
import { Button } from "@/components/ui/button"
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
import {
  ISSUE_STATUS_LABELS,
  ISSUE_STATUSES,
  type IssuePriority,
  type IssueStatus,
  type IssueType,
} from "@/types/Issue"
import type { ReleaseSummary } from "@/types/Release"
import type { Sprint } from "@/types/Sprint"
import type { ProjectMember } from "@/types/Project"
import type { UseFormReturn } from "react-hook-form"
import { ISSUE_PRIORITIES } from "@/lib/constants/priorities"

export type IssueFormValues = {
  title: string
  description: string
  type: IssueType
  priority: IssuePriority
  status: IssueStatus
  storyPoints: number | null
  assigneeId: number | null
  sprintId: number | null
  releaseId: number | null
}

type IssueFormProps = {
  form: UseFormReturn<IssueFormValues>
  members: ProjectMember[]
  sprints: Sprint[]
  releases: ReleaseSummary[]
  onSubmit: (values: IssueFormValues) => void
  submitLabel: string
  isSubmitting?: boolean
  submitClassName?: string
  footer?: React.ReactNode
}

const ISSUE_TYPES: IssueType[] = ["TASK", "BUG", "STORY"]

export function IssueForm({
  form,
  members,
  sprints,
  releases,
  onSubmit,
  submitLabel,
  isSubmitting,
  submitClassName,
  footer,
}: IssueFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          rules={{ required: "Title is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Fix sprint activation edge case"
                  {...field}
                />
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
                <RichTextEditor
                  value={field.value ?? "<p></p>"}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 flex-wrap">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  key={field.value}
                  onValueChange={(value) => field.onChange(value as IssueType)}
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
                  key={field.value}
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
                  key={field.value}
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
                        {ISSUE_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="storyPoints"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Story points</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value ? Number(event.target.value) : null,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 flex-wrap">
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
                      value === "unassigned" ? null : Number(value),
                    )
                  }
                  value={
                    field.value !== null && field.value !== undefined
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
                    {members.map((member) => (
                      <SelectItem
                        key={member.user.id}
                        value={String(member.user.id)}
                      >
                        <span className="inline-flex items-center gap-2">
                          <UserAvatar
                            name={member.user.name}
                            email={member.user.email}
                            avatarUrl={member.user.avatarUrl}
                            className="size-5"
                          />
                          <span>{member.user.name}</span>
                        </span>
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
                    field.onChange(value === "backlog" ? null : Number(value))
                  }
                  value={
                    field.value !== null && field.value !== undefined
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
                    {sprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={String(sprint.id)}>
                        {sprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="releaseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Release</FormLabel>
                <Select
                  key={field.value}
                  onValueChange={(value) =>
                    field.onChange(
                      value === "no-release" ? null : Number(value),
                    )
                  }
                  value={
                    field.value !== null && field.value !== undefined
                      ? String(field.value)
                      : "no-release"
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select release" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no-release">No release</SelectItem>
                    {releases.map((release) => (
                      <SelectItem key={release.id} value={String(release.id)}>
                        {release.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={submitClassName}
          >
            {submitLabel}
          </Button>
          {footer}
        </div>
      </form>
    </Form>
  )
}
