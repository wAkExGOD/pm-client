import { cn } from "@/lib/utils"
import { IssuePriority } from "@/types/Issue"
import { ChevronDown, ChevronUp, Minus } from "lucide-react"

const PRIORITY_META: Record<
  IssuePriority,
  { label: string; icon: typeof ChevronUp; className: string }
> = {
  HIGH: {
    label: "High",
    icon: ChevronUp,
    className: "text-rose-600",
  },
  MEDIUM: {
    label: "Medium",
    icon: Minus,
    className: "text-amber-600",
  },
  LOW: {
    label: "Low",
    icon: ChevronDown,
    className: "text-sky-600",
  },
}

export function PriorityValue({ priority }: { priority: IssuePriority }) {
  const meta = PRIORITY_META[priority]
  const Icon = meta.icon

  return (
    <span className={cn("inline-flex items-center gap-2", meta.className)}>
      <Icon className="size-3.5" />
      <span>{meta.label}</span>
    </span>
  )
}
