import { Skeleton } from "@/components/ui/skeleton"

export function AppLoadingScreen() {
  return (
    <div className="flex h-screen p-4 gap-4">
      <div className="w-64">
        <Skeleton className="h-full w-full rounded-md" />
      </div>

      <div className="flex-1">
        <Skeleton className="h-6 w-[300px]" />

        <Skeleton className="h-8 w-full mt-4" />

        <div className="grid grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-25 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
