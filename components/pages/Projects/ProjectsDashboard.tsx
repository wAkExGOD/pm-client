"use client"

import { projectsApi } from "@/api"
import { useProjects } from "@/hooks/useProjects"
import { ROUTES } from "@/lib/constants/routes"
import { CreateProjectDto } from "@/types/Project"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type ProjectFormValues = CreateProjectDto

export function ProjectsDashboard() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { projects, isLoading, setSelectedProjectId } = useProjects()

  const form = useForm<ProjectFormValues>({
    defaultValues: {
      name: "",
      key: "",
      description: "",
    },
  })

  const createProjectMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] })
      setSelectedProjectId(project.id)
      form.reset()
      toast.success("Project created")
      router.push(ROUTES.projectTeam(project.id))
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onSubmit = (values: ProjectFormValues) => {
    createProjectMutation.mutate({
      ...values,
      key: values.key.trim().toUpperCase(),
      description: values.description?.trim() || undefined,
      name: values.name.trim(),
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? <p>Loading projects...</p> : null}
          {!isLoading && !projects.length ? (
            <p className="text-sm text-muted-foreground">
              Create your first project to start building your workspace.
            </p>
          ) : null}
          <div className="grid gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={ROUTES.projectTeam(project.id)}
                onClick={() => setSelectedProjectId(project.id)}
                className="rounded-xl border border-border/60 p-4 transition hover:border-foreground/20 hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {project.key} · {project.currentUserRole}
                    </p>
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {project.description || "No description yet."}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{project.memberCount} members</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Create Project</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Project name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Platform Revamp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="key"
                rules={{
                  required: "Project key is required",
                  minLength: { value: 2, message: "Key is too short" },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input placeholder="PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Short summary of the project" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={createProjectMutation.isPending}
              >
                Create project
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
