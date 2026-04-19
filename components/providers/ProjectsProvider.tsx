"use client"

import { PropsWithChildren } from "react"
import { ProjectsProvider as ProjectsContextProvider } from "@/hooks/useProjects"

export function ProjectsProvider({ children }: PropsWithChildren) {
  return <ProjectsContextProvider>{children}</ProjectsContextProvider>
}
