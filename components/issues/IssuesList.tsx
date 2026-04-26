"use client"

import { issuesApi } from "@/api"
import { UserAvatar } from "@/components/common"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ISSUE_PRIORITIES } from "@/lib/constants/priorities"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import {
  type Issue,
  type IssuePriority,
  ISSUE_STATUS_LABELS,
  ISSUE_STATUSES,
  type IssueStatus,
  type UpdateIssueDto,
} from "@/types/Issue"
import { type ProjectMember } from "@/types/Project"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Loader2, Pencil, X } from "lucide-react"
import Link from "next/link"
import { memo, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { PriorityValue } from "./PriorityValue"

type IssuesListProps = {
  issues: Issue[]
  projectId: number
  projectKey: string
  members: ProjectMember[]
  emptyMessage?: string
  className?: string
  renderActions?: (issue: Issue) => React.ReactNode
}

type MemberOption = {
  id: number
  name: string
  email: string
  avatarUrl?: string | null
}

function applyIssuePatch(
  issue: Issue,
  patch: UpdateIssueDto,
  memberOptions: MemberOption[],
) {
  return {
    ...issue,
    ...patch,
    assignee:
      patch.assigneeId === undefined
        ? issue.assignee
        : patch.assigneeId === null
          ? null
          : (memberOptions.find((member) => member.id === patch.assigneeId) ??
            issue.assignee),
  }
}

const IssueListRow = memo(function IssueListRow({
  issue,
  projectId,
  projectKey,
  memberOptions,
  onPatch,
  renderActions,
}: {
  issue: Issue
  projectId: number
  projectKey: string
  memberOptions: MemberOption[]
  onPatch: (issueId: number, patch: UpdateIssueDto) => void
  renderActions?: (issue: Issue) => React.ReactNode
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(issue.title)
  const [isEditingStoryPoints, setIsEditingStoryPoints] = useState(false)
  const [storyPointsDraft, setStoryPointsDraft] = useState(
    issue.storyPoints?.toString() ?? "",
  )

  useEffect(() => {
    setTitleDraft(issue.title)
  }, [issue.title])

  useEffect(() => {
    setStoryPointsDraft(issue.storyPoints?.toString() ?? "")
  }, [issue.storyPoints])

  const saveTitle = () => {
    const nextTitle = titleDraft.trim()

    if (!nextTitle) {
      toast.error("Title cannot be empty")
      return
    }

    setIsEditingTitle(false)

    if (nextTitle === issue.title) {
      return
    }

    onPatch(issue.id, { title: nextTitle })
  }

  const saveStoryPoints = () => {
    const trimmed = storyPointsDraft.trim()
    const nextStoryPoints = trimmed ? Number(trimmed) : null

    if (
      trimmed &&
      (!Number.isInteger(nextStoryPoints) || Number(nextStoryPoints) < 0)
    ) {
      toast.error("Story points must be a non-negative integer")
      return
    }

    setIsEditingStoryPoints(false)

    if (nextStoryPoints === issue.storyPoints) {
      return
    }

    onPatch(issue.id, { storyPoints: nextStoryPoints })
  }

  return (
    <div
      className={cn(
        "grid gap-3 border-b border-border/50 px-4 py-3 text-sm last:border-b-0",
        renderActions
          ? "grid-cols-[110px_minmax(260px,1.8fr)_150px_110px_140px_140px_200px]"
          : "grid-cols-[110px_minmax(260px,1.8fr)_150px_110px_140px_140px]",
      )}
    >
      <div className="flex items-center">
        <Link
          href={ROUTES.projectIssue(projectId, issue.id)}
          className="font-medium text-primary hover:underline"
        >
          {projectKey}-{issue.id}
        </Link>
      </div>

      <div className="group flex min-w-0 items-center gap-2">
        {isEditingTitle ? (
          <div className="flex w-full items-center gap-2">
            <Input
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  saveTitle()
                }
                if (event.key === "Escape") {
                  setTitleDraft(issue.title)
                  setIsEditingTitle(false)
                }
              }}
              autoFocus
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={saveTitle}
            >
              <Check className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => {
                setTitleDraft(issue.title)
                setIsEditingTitle(false)
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <>
            <Link
              href={ROUTES.projectIssue(projectId, issue.id)}
              className="truncate font-medium hover:underline"
            >
              {issue.title}
            </Link>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-7 shrink-0 opacity-0 transition group-hover:opacity-100"
              onClick={() => setIsEditingTitle(true)}
            >
              <Pencil className="size-3.5" />
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center">
        <Select
          value={issue.status}
          onValueChange={(value) => {
            if (value === issue.status) {
              return
            }

            onPatch(issue.id, { status: value as IssueStatus })
          }}
        >
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ISSUE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {ISSUE_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center">
        {isEditingStoryPoints ? (
          <Input
            value={storyPointsDraft}
            onChange={(event) => setStoryPointsDraft(event.target.value)}
            onBlur={saveStoryPoints}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                saveStoryPoints()
              }
              if (event.key === "Escape") {
                setStoryPointsDraft(issue.storyPoints?.toString() ?? "")
                setIsEditingStoryPoints(false)
              }
            }}
            autoFocus
            className="h-8"
          />
        ) : (
          <button
            type="button"
            className="rounded-md px-2 py-1 text-left transition hover:bg-muted"
            onClick={() => setIsEditingStoryPoints(true)}
          >
            {issue.storyPoints ?? "—"}
          </button>
        )}
      </div>

      <div className="flex items-center">
        <Select
          value={issue.priority}
          onValueChange={(value) => {
            if (value === issue.priority) {
              return
            }

            onPatch(issue.id, { priority: value as IssuePriority })
          }}
        >
          <SelectTrigger size="sm" className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ISSUE_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                <PriorityValue priority={priority} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-muted"
            >
              {issue.assignee ? (
                <>
                  <UserAvatar
                    name={issue.assignee.name}
                    email={issue.assignee.email}
                    avatarUrl={issue.assignee.avatarUrl}
                    className="size-8"
                  />
                  <span className="inline-block max-w-[84px] truncate text-sm">
                    {issue.assignee.name}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-60">
            <DropdownMenuItem
              onClick={() => {
                if (issue.assigneeId === null) {
                  return
                }
                onPatch(issue.id, { assigneeId: null })
              }}
            >
              Unassigned
            </DropdownMenuItem>
            {memberOptions.map((member) => (
              <DropdownMenuItem
                key={member.id}
                onClick={() => {
                  if (member.id === issue.assigneeId) {
                    return
                  }
                  onPatch(issue.id, { assigneeId: member.id })
                }}
              >
                <UserAvatar
                  name={member.name}
                  email={member.email}
                  avatarUrl={member.avatarUrl}
                  className="size-7"
                />
                <span className="truncate">{member.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {renderActions ? (
        <div className="flex items-center">{renderActions(issue)}</div>
      ) : null}
    </div>
  )
})

export function IssuesList({
  issues,
  projectId,
  projectKey,
  members,
  emptyMessage = "No issues found.",
  className,
  renderActions,
}: IssuesListProps) {
  const queryClient = useQueryClient()
  const [localIssues, setLocalIssues] = useState<Issue[]>(issues)

  useEffect(() => {
    setLocalIssues(issues)
  }, [issues])

  const memberOptions = useMemo(
    () =>
      members.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatarUrl: member.user.avatarUrl,
      })),
    [members],
  )

  const updateIssueMutation = useMutation({
    mutationFn: ({
      issueId,
      patch,
    }: {
      issueId: number
      patch: UpdateIssueDto
    }) => issuesApi.update(projectId, issueId, patch),
    onMutate: ({ issueId, patch }) => {
      const previousIssues = localIssues

      setLocalIssues((currentIssues) =>
        currentIssues.map((issue) =>
          issue.id === issueId
            ? applyIssuePatch(issue, patch, memberOptions)
            : issue,
        ),
      )

      return { previousIssues }
    },
    onError: (error, _variables, context) => {
      if (context?.previousIssues) {
        setLocalIssues(context.previousIssues)
      }

      toast.error(error.message)
    },
    onSuccess: (updatedIssue) => {
      setLocalIssues((currentIssues) =>
        currentIssues.map((issue) =>
          issue.id === updatedIssue.id ? updatedIssue : issue,
        ),
      )
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["issues", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["issue", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["release", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["releases", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["sprint", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["sprints", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["backlog", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["summary", projectId] }),
      ])
    },
  })

  if (!localIssues.length) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground",
          className,
        )}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-border/60",
        className,
      )}
    >
      <div className="min-w-[920px]">
        <div
          className={cn(
            "grid gap-3 border-b border-border/60 bg-muted/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground",
            renderActions
              ? "grid-cols-[110px_minmax(260px,1.8fr)_150px_110px_140px_140px_200px]"
              : "grid-cols-[110px_minmax(260px,1.8fr)_150px_110px_140px_140px]",
          )}
        >
          <div>ID</div>
          <div>Title</div>
          <div>Status</div>
          <div>Story points</div>
          <div>Priority</div>
          <div>Assignee</div>
          {renderActions ? <div>Actions</div> : null}
        </div>
        <div>
          {localIssues.map((issue) => (
            <IssueListRow
              key={issue.id}
              issue={issue}
              projectId={projectId}
              projectKey={projectKey}
              memberOptions={memberOptions}
              onPatch={(issueId, patch) =>
                updateIssueMutation.mutate({ issueId, patch })
              }
              renderActions={renderActions}
            />
          ))}
        </div>
      </div>

      {updateIssueMutation.isPending ? (
        <div className="flex items-center gap-2 border-t border-border/60 px-4 py-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Saving issue changes...
        </div>
      ) : null}
    </div>
  )
}
