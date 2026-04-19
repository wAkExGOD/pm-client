"use client"

import { ComponentProps } from "react"
import {
  FolderKanban,
  Settings2,
  Command,
  Users,
  Timer,
  Ticket,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROUTES } from "@/lib/constants/routes"
import { useProjects } from "@/hooks/useProjects"
import { NavMain } from "./common/NavMain"
import { NavUser } from "./common/NavUser"

export function AppNavBar({ ...props }: ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const { projects, selectedProjectId, setSelectedProjectId, selectedProject } =
    useProjects()

  const navMain = [
    {
      title: "Projects",
      url: ROUTES.HOME,
      icon: FolderKanban,
    },
    ...(selectedProject
      ? [
          {
            title: "Issues",
            url: ROUTES.projectIssues(selectedProject.id),
            icon: Ticket,
          },
          {
            title: "Team",
            url: ROUTES.projectTeam(selectedProject.id),
            icon: Users,
          },
          {
            title: "Sprints",
            url: ROUTES.projectSprints(selectedProject.id),
            icon: Timer,
          },
        ]
      : []),
    {
      title: "Settings",
      url: ROUTES.SETTINGS,
      icon: Settings2,
    },
  ]

  const navigateProjectRoute = (projectId: number) => {
    if (pathname.endsWith("/sprints")) {
      router.push(ROUTES.projectSprints(projectId))
      return
    }

    if (pathname.includes("/issues/")) {
      router.push(ROUTES.projectIssues(projectId))
      return
    }

    if (pathname.endsWith("/issues")) {
      router.push(ROUTES.projectIssues(projectId))
      return
    }

    router.push(ROUTES.projectTeam(projectId))
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ROUTES.HOME}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 pb-2">
          <Select
            value={selectedProjectId ? String(selectedProjectId) : undefined}
            onValueChange={(value) => {
              const projectId = Number(value)
              setSelectedProjectId(projectId)

              if (pathname.startsWith("/projects/")) {
                navigateProjectRoute(projectId)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={String(project.id)}>
                  {project.key} · {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
