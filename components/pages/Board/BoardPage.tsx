"use client"

import { issuesApi, projectsApi } from "@/api"
import { UserAvatar } from "@/components/common/UserAvatar"
import { CreateIssueDialog } from "@/components/issues/CreateIssueDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useProjects } from "@/hooks/useProjects"
import { ISSUE_PRIORITIES } from "@/lib/constants/priorities"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import {
  type BoardColumn,
  type Issue,
  type IssuePriority,
  ISSUE_STATUS_LABELS,
  ISSUE_STATUSES,
  type IssueStatus,
  type UpdateIssueDto,
} from "@/types/Issue"
import { type ProjectMember } from "@/types/Project"
import {
  DragOverlay,
  DragDropProvider,
  type DragDropEventHandlers,
  useDroppable,
} from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Pencil, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  findColumnStatusByIssueId,
  findIssue,
  moveIssueWithSortableEvent,
  replaceIssue,
  SortableMeta,
  updateIssueLocally,
} from "./Board.utils"
import { PriorityValue } from "@/components/issues/PriorityValue"

type BoardPageProps = {
  projectId: number
}

const EMPTY_BOARD_COLUMNS: BoardColumn[] = ISSUE_STATUSES.map((status) => ({
  status,
  items: [],
}))

function IssueCardView({
  issue,
  projectId,
  members,
  onUpdate,
  className,
  editable = true,
}: {
  issue: Issue
  projectId: number
  members: ProjectMember[]
  onUpdate?: (patch: UpdateIssueDto) => void
  className?: string
  editable?: boolean
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(issue.title)
  const [isEditingStoryPoints, setIsEditingStoryPoints] = useState(false)
  const [storyPointsDraft, setStoryPointsDraft] = useState(
    issue.storyPoints?.toString() ?? "",
  )

  useEffect(() => {
    setTitleDraft(issue.title)
    setStoryPointsDraft(issue.storyPoints?.toString() ?? "")
  }, [issue.storyPoints, issue.title])

  return (
    <Card className={cn("border-border/60 gap-0 p-0 shadow-sm", className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            {editable && isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  className="h-8"
                  autoFocus
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setIsEditingTitle(false)
                    const nextTitle = titleDraft.trim()
                    if (!nextTitle || nextTitle === issue.title) {
                      return
                    }
                    onUpdate?.({ title: nextTitle })
                  }}
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
              <div className="group flex items-start gap-2">
                <CardTitle className="min-w-0 text-sm leading-tight">
                  <Link
                    href={ROUTES.projectIssue(projectId, issue.id)}
                    className="line-clamp-2 hover:underline"
                  >
                    {issue.title}
                  </Link>
                </CardTitle>
                {editable ? (
                  <button
                    type="button"
                    className="opacity-0 transition group-hover:opacity-100"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <Pencil className="size-3.5" />
                  </button>
                ) : null}
              </div>
            )}
            <span className="text-xs text-muted-foreground">{issue.type}</span>
          </div>
          <Badge variant="outline">#{issue.id}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="flex justify-end gap-2 text-sm">
          <Select
            value={issue.priority}
            onValueChange={(value) => {
              if (value === issue.priority) {
                return
              }

              onUpdate?.({ priority: value as IssuePriority })
            }}
          >
            <SelectTrigger size="sm" className="h-8">
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
          {editable && isEditingStoryPoints ? (
            <Input
              value={storyPointsDraft}
              onChange={(event) => setStoryPointsDraft(event.target.value)}
              className="h-8 w-12"
              autoFocus
              onBlur={() => {
                setIsEditingStoryPoints(false)
                const nextStoryPoints = storyPointsDraft.trim()
                  ? Number(storyPointsDraft)
                  : null
                if (nextStoryPoints === issue.storyPoints) {
                  return
                }
                onUpdate?.({
                  storyPoints: nextStoryPoints,
                })
              }}
            />
          ) : (
            <button
              type="button"
              className="rounded-md px-2 py-1 bg-muted"
              onClick={() => editable && setIsEditingStoryPoints(true)}
            >
              {issue.storyPoints ?? "-"}
            </button>
          )}
        </div>

        <div className="flex justify-end">
          {editable ? (
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
                        className="size-7"
                      />
                      <span className="max-w-[90px] truncate text-sm">
                        {issue.assignee.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Unassigned
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    if (issue.assigneeId === null) {
                      return
                    }
                    onUpdate?.({ assigneeId: null })
                  }}
                >
                  Unassigned
                </DropdownMenuItem>
                {members.map((member) => (
                  <DropdownMenuItem
                    key={member.user.id}
                    onClick={() => {
                      if (member.user.id === issue.assigneeId) {
                        return
                      }
                      onUpdate?.({ assigneeId: member.user.id })
                    }}
                  >
                    <UserAvatar
                      name={member.user.name}
                      email={member.user.email}
                      avatarUrl={member.user.avatarUrl}
                      className="size-7"
                    />
                    <span className="truncate">{member.user.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : issue.assignee ? (
            <div className="inline-flex items-center gap-2">
              <UserAvatar
                name={issue.assignee.name}
                email={issue.assignee.email}
                avatarUrl={issue.assignee.avatarUrl}
                className="size-7"
              />
              <span className="text-sm">{issue.assignee.name}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Unassigned</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SortableIssueCard({
  issue,
  projectId,
  columnStatus,
  index,
  members,
  onUpdate,
}: {
  issue: Issue
  projectId: number
  columnStatus: IssueStatus
  index: number
  members: ProjectMember[]
  onUpdate: (issueId: number, patch: UpdateIssueDto) => void
}) {
  const { ref, isDragging } = useSortable({
    id: issue.id,
    index,
    group: columnStatus,
    type: "issue",
    accept: ["issue"],
  })

  return (
    <div ref={ref}>
      <IssueCardView
        issue={issue}
        projectId={projectId}
        members={members}
        onUpdate={(patch) => onUpdate(issue.id, patch)}
        className={cn(
          "cursor-grab transition-all active:cursor-grabbing",
          isDragging
            ? "rotate-1 scale-[1.02] opacity-50 shadow-lg"
            : "hover:shadow-md",
        )}
      />
    </div>
  )
}

function BoardColumnCard({
  column,
  projectId,
  members,
  onUpdateIssue,
}: {
  column: BoardColumn
  projectId: number
  members: ProjectMember[]
  onUpdateIssue: (issueId: number, patch: UpdateIssueDto) => void
}) {
  const { ref, isDropTarget } = useDroppable({
    id: column.status,
    type: "column",
    accept: ["issue"],
  })

  return (
    <div className="flex min-h-[420px] flex-col rounded-2xl border border-border/60 bg-muted/20">
      <div className="border-b border-border/60 px-4 py-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">
            {ISSUE_STATUS_LABELS[column.status]}
          </h2>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {column.items.length}
          </span>
        </div>
      </div>
      <div
        ref={ref}
        className={cn(
          "flex flex-1 flex-col gap-3 p-4 transition-colors",
          isDropTarget &&
            "rounded-b-2xl bg-primary/10 ring-2 ring-primary ring-inset",
        )}
      >
        {column.items.map((issue, index) => (
          <SortableIssueCard
            key={issue.id}
            issue={issue}
            index={index}
            columnStatus={column.status}
            projectId={projectId}
            members={members}
            onUpdate={onUpdateIssue}
          />
        ))}
        {column.items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
            No issues
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function BoardPage({ projectId }: BoardPageProps) {
  const queryClient = useQueryClient()
  const { setSelectedProjectId } = useProjects()
  const [columns, setColumns] = useState<BoardColumn[]>(EMPTY_BOARD_COLUMNS)
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null)
  const previousColumnsRef = useRef<BoardColumn[]>(EMPTY_BOARD_COLUMNS)

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

  const boardQuery = useQuery({
    queryKey: ["board", projectId],
    queryFn: () => issuesApi.getBoard(projectId),
  })

  useEffect(() => {
    if (!boardQuery.data) {
      return
    }

    setColumns(boardQuery.data.columns)
    previousColumnsRef.current = boardQuery.data.columns
  }, [boardQuery.data])

  const updateIssueMutation = useMutation({
    mutationFn: ({
      issueId,
      patch,
    }: {
      issueId: number
      patch: UpdateIssueDto
    }) => issuesApi.update(projectId, issueId, patch),
    onMutate: ({ issueId, patch }) => {
      previousColumnsRef.current = columns
      setColumns((currentColumns) =>
        updateIssueLocally(
          currentColumns,
          issueId,
          patch,
          membersQuery.data ?? [],
        ),
      )
    },
    onSuccess: (updatedIssue) => {
      setColumns((currentColumns) => replaceIssue(currentColumns, updatedIssue))
    },
    onError: (error) => {
      setColumns(previousColumnsRef.current)
      toast.error(error.message)
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["issues", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["issue", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["summary", projectId] }),
      ])
    },
  })

  const handleDragStart: DragDropEventHandlers["onDragStart"] = (event) => {
    previousColumnsRef.current = columns
    const issueId = Number(event.operation.source?.id)

    if (Number.isNaN(issueId)) {
      setActiveIssue(null)
      return
    }

    setActiveIssue(findIssue(columns, issueId))
  }

  const handleDragOver: DragDropEventHandlers["onDragOver"] = (event) => {
    const { source, target } = event.operation

    if (!source || !target) {
      return
    }

    setColumns((currentColumns) =>
      moveIssueWithSortableEvent(
        currentColumns,
        source as SortableMeta,
        target as SortableMeta,
      ),
    )
  }

  const handleDragEnd: DragDropEventHandlers["onDragEnd"] = (event) => {
    const { source } = event.operation
    const issueId = Number(source?.id)

    setActiveIssue(null)

    if (event.canceled) {
      setColumns(previousColumnsRef.current)
      return
    }

    if (Number.isNaN(issueId)) {
      return
    }

    const previousStatus = findColumnStatusByIssueId(
      previousColumnsRef.current,
      issueId,
    )
    const nextStatus = findColumnStatusByIssueId(columns, issueId)

    if (!previousStatus || !nextStatus || previousStatus === nextStatus) {
      return
    }

    updateIssueMutation.mutate({
      issueId,
      patch: { status: nextStatus },
    })
  }

  const boardColumns = useMemo(() => columns, [columns])

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>
              {projectQuery.data?.name || "Project"}{" "}
              {projectQuery.data ? `(${projectQuery.data.key})` : ""} Board
            </CardTitle>
            <CreateIssueDialog
              projectId={projectId}
              trigger={<Button>Create</Button>}
              title="Create issue"
            />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            {projectQuery.data?.description ||
              "Track delivery flow visually across the project."}
          </p>
        </CardContent>
      </Card>

      {boardQuery.isLoading ? <p>Loading board...</p> : null}

      {!boardQuery.isLoading ? (
        <DragDropProvider
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-4 xl:grid-cols-4">
            {boardColumns.map((column) => (
              <BoardColumnCard
                key={column.status}
                column={column}
                projectId={projectId}
                members={membersQuery.data ?? []}
                onUpdateIssue={(issueId, patch) =>
                  updateIssueMutation.mutate({ issueId, patch })
                }
              />
            ))}
          </div>
          <DragOverlay>
            {activeIssue ? (
              <IssueCardView
                issue={activeIssue}
                projectId={projectId}
                members={membersQuery.data ?? []}
                editable={false}
                className="w-[280px] cursor-grabbing shadow-lg"
              />
            ) : null}
          </DragOverlay>
        </DragDropProvider>
      ) : null}
    </div>
  )
}
