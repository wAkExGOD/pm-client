"use client"

import { projectsApi } from "@/api"
import { ProjectSummary } from "@/types/Project"
import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query"
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useAuth } from "./useAuth"

const PROJECTS_QUERY_KEY = ["projects"]
const PROJECT_STORAGE_KEY = "project-management-active-project-id"

type ProjectsContextValue = {
  projects: ProjectSummary[]
  selectedProjectId?: number
  selectedProject?: ProjectSummary
  isLoading: boolean
  error: UseQueryResult<ProjectSummary[]>["error"]
  setSelectedProjectId: (projectId: number) => void
  refetchProjects: () => Promise<unknown>
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null)

export function ProjectsProvider({ children }: PropsWithChildren) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedProjectId, setSelectedProjectIdState] = useState<
    number | undefined
  >()

  const projectsQuery = useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: projectsApi.list,
    enabled: Boolean(user),
  })

  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const storedValue = window.localStorage.getItem(PROJECT_STORAGE_KEY)
    if (!storedValue) {
      return
    }

    const parsedValue = Number(storedValue)
    if (Number.isInteger(parsedValue)) {
      setSelectedProjectIdState(parsedValue)
    }
  }, [])

  useEffect(() => {
    if (!projects.length) {
      setSelectedProjectIdState(undefined)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(PROJECT_STORAGE_KEY)
      }
      return
    }

    const selectedExists = projects.some(
      (project) => project.id === selectedProjectId,
    )

    if (!selectedExists) {
      const fallbackProjectId = projects[0]?.id
      setSelectedProjectIdState(fallbackProjectId)

      if (typeof window !== "undefined" && fallbackProjectId) {
        window.localStorage.setItem(
          PROJECT_STORAGE_KEY,
          String(fallbackProjectId),
        )
      }
    }
  }, [projects, selectedProjectId])

  const setSelectedProjectId = (projectId: number) => {
    setSelectedProjectIdState(projectId)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROJECT_STORAGE_KEY, String(projectId))
    }
  }

  const value = useMemo(
    () => ({
      projects,
      selectedProjectId,
      selectedProject: projects.find(
        (project) => project.id === selectedProjectId,
      ),
      isLoading: projectsQuery.isLoading,
      error: projectsQuery.error,
      setSelectedProjectId,
      refetchProjects: async () => {
        await queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
      },
    }),
    [
      projects,
      selectedProjectId,
      projectsQuery.isLoading,
      projectsQuery.error,
      queryClient,
    ],
  )

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)

  if (!context) {
    throw new Error("useProjects must be used within ProjectsProvider")
  }

  return context
}
