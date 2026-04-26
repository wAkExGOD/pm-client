"use client"

import { AppNavBar } from "@/components/common"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { PAGE_NAMES } from "@/lib/constants/pageNames"
import { ROUTES } from "@/lib/constants/routes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PropsWithChildren } from "react"

export function AppLayout({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const pageName =
    pathname.startsWith("/projects/") && pathname.endsWith("/team")
      ? "Project Team"
      : pathname.startsWith("/projects/") && pathname.endsWith("/backlog")
        ? "Backlog"
        : pathname.startsWith("/projects/") && pathname.endsWith("/board")
          ? "Board"
          : pathname.startsWith("/projects/") && pathname.includes("/releases/")
            ? "Release Details"
            : pathname.startsWith("/projects/") &&
                pathname.endsWith("/releases")
              ? "Releases"
              : pathname.startsWith("/projects/") &&
                  pathname.includes("/issues/")
                ? "Issue Details"
                : pathname.startsWith("/projects/") &&
                    pathname.endsWith("/issues")
                  ? "Issues"
                  : pathname.startsWith("/projects/") &&
                      pathname.endsWith("/sprints")
                    ? "Sprints"
                    : pathname.startsWith("/projects/") &&
                        pathname.endsWith("/summary")
                      ? "Summary"
                      : PAGE_NAMES[pathname] || "..."

  return (
    <SidebarProvider>
      <AppNavBar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href={ROUTES.HOME}>PM App</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{pageName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
