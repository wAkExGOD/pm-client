import {
  BoardColumn,
  Issue,
  ISSUE_STATUSES,
  IssueStatus,
  UpdateIssueDto,
} from "@/types/Issue"
import { ProjectMember } from "@/types/Project"

export function findIssue(columns: BoardColumn[], issueId: number) {
  return (
    columns
      .flatMap((column) => column.items)
      .find((item) => item.id === issueId) ?? null
  )
}

export function findColumnStatusByIssueId(
  columns: BoardColumn[],
  issueId: number,
) {
  return (
    columns.find((column) => column.items.some((item) => item.id === issueId))
      ?.status ?? null
  )
}

export function replaceIssue(columns: BoardColumn[], updatedIssue: Issue) {
  return columns.map((column) => ({
    ...column,
    items:
      column.status === updatedIssue.status
        ? [
            ...column.items.filter((issue) => issue.id !== updatedIssue.id),
            updatedIssue,
          ]
        : column.items.filter((issue) => issue.id !== updatedIssue.id),
  }))
}

export function updateIssueLocally(
  columns: BoardColumn[],
  issueId: number,
  patch: UpdateIssueDto,
  members: ProjectMember[],
) {
  return columns.map((column) => ({
    ...column,
    items: column.items.map((issue) =>
      issue.id === issueId
        ? {
            ...issue,
            ...patch,
            assignee:
              patch.assigneeId === undefined
                ? issue.assignee
                : patch.assigneeId === null
                  ? null
                  : (members.find(
                      (member) => member.user.id === patch.assigneeId,
                    )?.user ?? issue.assignee),
          }
        : issue,
    ),
  }))
}

export type SortableMeta = {
  id: string | number
  group?: string | number
  index?: number
}

export function moveIssueWithSortableEvent(
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
