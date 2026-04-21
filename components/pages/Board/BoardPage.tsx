"use client"

import { issuesApi, projectsApi } from "@/api"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useProjects } from "@/hooks/useProjects"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import {
  type BoardColumn,
  type Issue,
  ISSUE_STATUS_LABELS,
  ISSUE_STATUSES,
  type IssueStatus,
} from "@/types/Issue"
import {
  DragOverlay,
  DragDropProvider,
  type DragDropEventHandlers,
  useDroppable,
} from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

type BoardPageProps = {
  projectId: number
}

const EMPTY_BOARD_COLUMNS: BoardColumn[] = ISSUE_STATUSES.map((status) => ({
  status,
  items: [],
}))

type SortableMeta = {
  id: string | number
  group?: string | number
  index?: number
}

function findIssue(columns: BoardColumn[], issueId: number) {
  return (
    columns
      .flatMap((column) => column.items)
      .find((item) => item.id === issueId) ?? null
  )
}

function findColumnStatusByIssueId(columns: BoardColumn[], issueId: number) {
  return (
    columns.find((column) => column.items.some((item) => item.id === issueId))
      ?.status ?? null
  )
}

function moveIssueWithSortableEvent(
  columns: BoardColumn[],
  source: SortableMeta,
  target: SortableMeta,
) {
  const sourceIssueId = Number(source.id)

  if (Number.isNaN(sourceIssueId)) {
    return columns
  }

  const sourceStatus =
    (source.group as IssueStatus | undefined) ??
    findColumnStatusByIssueId(columns, sourceIssueId)

  if (!sourceStatus) {
    return columns
  }

  const targetStatus =
    (target.group as IssueStatus | undefined) ??
    (ISSUE_STATUSES.includes(target.id as IssueStatus)
      ? (target.id as IssueStatus)
      : undefined)

  if (!targetStatus) {
    return columns
  }

  const sourceColumn = columns.find((column) => column.status === sourceStatus)
  const targetColumn = columns.find((column) => column.status === targetStatus)

  if (!sourceColumn || !targetColumn) {
    return columns
  }

  const sourceIndex =
    typeof source.index === "number"
      ? source.index
      : sourceColumn.items.findIndex((item) => item.id === sourceIssueId)

  if (sourceIndex < 0) {
    return columns
  }

  const nextColumns = columns.map((column) => ({
    ...column,
    items: [...column.items],
  }))

  const fromColumn = nextColumns.find(
    (column) => column.status === sourceStatus,
  )
  const toColumn = nextColumns.find((column) => column.status === targetStatus)

  if (!fromColumn || !toColumn) {
    return columns
  }

  const [movedIssue] = fromColumn.items.splice(sourceIndex, 1)

  if (!movedIssue) {
    return columns
  }

  const rawTargetIndex =
    typeof target.index === "number" ? target.index : toColumn.items.length

  const targetIndex =
    sourceStatus === targetStatus && rawTargetIndex > sourceIndex
      ? rawTargetIndex - 1
      : rawTargetIndex

  toColumn.items.splice(
    Math.max(0, Math.min(targetIndex, toColumn.items.length)),
    0,
    {
      ...movedIssue,
      status: targetStatus,
    },
  )

  return nextColumns
}

function IssueCardView({
  issue,
  projectId,
  className,
}: {
  issue: Issue
  projectId: number
  className?: string
}) {
  return (
    <Card className={cn("border-border/60 gap-0 p-0 shadow-sm", className)}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="text-sm leading-tight">
              <Link
                href={ROUTES.projectIssue(projectId, issue.id)}
                className="hover:underline"
              >
                {issue.title}
              </Link>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {issue.type} · {issue.priority}
            </p>
          </div>
          <Badge variant="outline">#{issue.id}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground">
          {issue.assignee ? issue.assignee.name : "Unassigned"}
        </p>
      </CardContent>
    </Card>
  )
}

function SortableIssueCard({
  issue,
  projectId,
  columnStatus,
  index,
}: {
  issue: Issue
  projectId: number
  columnStatus: IssueStatus
  index: number
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
        className={cn(
          "cursor-grab transition-all active:cursor-grabbing",
          isDragging ? "opacity-50 rotate-1 scale-[1.02] shadow-lg" : "hover:shadow-md",
        )}
      />
    </div>
  )
}

function BoardColumnCard({
  column,
  projectId,
}: {
  column: BoardColumn
  projectId: number
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
          <h2 className="font-semibold">{ISSUE_STATUS_LABELS[column.status]}</h2>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {column.items.length}
          </span>
        </div>
      </div>
      <div
        ref={ref}
        className={cn(
          "flex flex-1 flex-col gap-3 p-4 transition-colors",
          isDropTarget && "rounded-b-2xl bg-primary/10 ring-2 ring-primary ring-inset",
        )}
      >
        {column.items.map((issue, index) => (
          <SortableIssueCard
            key={issue.id}
            issue={issue}
            index={index}
            columnStatus={column.status}
            projectId={projectId}
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

  const moveIssueMutation = useMutation({
    mutationFn: ({ issueId, status }: { issueId: number; status: IssueStatus }) =>
      issuesApi.update(projectId, issueId, { status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["board", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["issues", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["issue", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["backlog", projectId] }),
      ])
      toast.success("Issue status updated")
    },
    onError: async (error) => {
      setColumns(previousColumnsRef.current)
      await queryClient.invalidateQueries({ queryKey: ["board", projectId] })
      toast.error(error.message)
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

    previousColumnsRef.current = columns
    moveIssueMutation.mutate({
      issueId,
      status: nextStatus,
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>
            {projectQuery.data?.name || "Project"}{" "}
            {projectQuery.data ? `(${projectQuery.data.key})` : ""} Board
          </CardTitle>
          <CardDescription>
            Drag issues between status columns to update their workflow state.
          </CardDescription>
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
            {columns.map((column) => (
              <BoardColumnCard
                key={column.status}
                column={column}
                projectId={projectId}
              />
            ))}
          </div>
          <DragOverlay>
            {activeIssue ? (
              <IssueCardView
                issue={activeIssue}
                projectId={projectId}
                className="w-[280px] cursor-grabbing shadow-lg"
              />
            ) : null}
          </DragOverlay>
        </DragDropProvider>
      ) : null}
    </div>
  )
}
