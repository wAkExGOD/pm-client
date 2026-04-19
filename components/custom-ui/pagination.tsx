import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Button } from "../ui/button"

type PaginationProps = {
  page: number
  totalPages: number
  onSetPage: (page: number) => void
  onSetPrevPage: () => void
  onSetNextPage: () => void
}

export const Pagination = ({
  page,
  totalPages,
  onSetPage,
  onSetPrevPage,
  onSetNextPage,
}: PaginationProps) => {
  return (
    <div className={"flex gap-2 items-center justify-center duration-200"}>
      <Button
        variant="ghost"
        className="cursor-pointer"
        disabled={page === 1}
        onClick={onSetPrevPage}
      >
        <ChevronLeftIcon />
      </Button>

      <div className="flex gap-1.5 items-center">
        {}
        {Array.from({ length: totalPages || 1 }, (_, i) => {
          const currentPage = i + 1
          return (
            <Button
              key={currentPage}
              variant={currentPage === page ? "outline" : "ghost"}
              className="cursor-pointer border border-transparent"
              onClick={() => onSetPage(currentPage)}
            >
              {currentPage}
            </Button>
          )
        })}
      </div>

      <Button
        variant="ghost"
        className="cursor-pointer"
        disabled={page === totalPages}
        onClick={onSetNextPage}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  )
}
