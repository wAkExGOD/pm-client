"use client"

import { projectsApi, sprintsApi } from "@/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useProjects } from "@/hooks/useProjects"
import { type CreateSprintDto } from "@/types/Sprint"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type SprintsPageProps = {
  projectId: number
}

export function SprintsPage({ projectId }: SprintsPageProps) {
  const queryClient = useQueryClient()
  const { setSelectedProjectId } = useProjects()

  useEffect(() => {
    setSelectedProjectId(projectId)
  }, [projectId, setSelectedProjectId])

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getById(projectId),
  })

  const sprintsQuery = useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => sprintsApi.list(projectId),
  })

  const activeSprintQuery = useQuery({
    queryKey: ["active-sprint", projectId],
    queryFn: () => sprintsApi.getActive(projectId),
  })

  const form = useForm<CreateSprintDto>({
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      goal: "",
      isActive: false,
    },
  })

  const canManageSprints =
    projectQuery.data?.currentUserRole === "OWNER" ||
    projectQuery.data?.currentUserRole === "ADMIN"

  const refreshSprints = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["sprints", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["active-sprint", projectId] }),
    ])
  }

  const createSprintMutation = useMutation({
    mutationFn: (values: CreateSprintDto) =>
      sprintsApi.create(projectId, {
        ...values,
        name: values.name.trim(),
        goal: values.goal?.trim() || undefined,
      }),
    onSuccess: async () => {
      await refreshSprints()
      form.reset({
        name: "",
        startDate: "",
        endDate: "",
        goal: "",
        isActive: false,
      })
      toast.success("Sprint created")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const activateSprintMutation = useMutation({
    mutationFn: (sprintId: number) =>
      sprintsApi.update(projectId, sprintId, { isActive: true }),
    onSuccess: async () => {
      await refreshSprints()
      toast.success("Active sprint updated")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const deactivateSprintMutation = useMutation({
    mutationFn: (sprintId: number) =>
      sprintsApi.update(projectId, sprintId, { isActive: false }),
    onSuccess: async () => {
      await refreshSprints()
      toast.success("Sprint deactivated")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>
            {projectQuery.data?.name || "Project"}{" "}
            {projectQuery.data ? `(${projectQuery.data.key})` : ""} Sprints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{projectQuery.data?.description || "No description yet."}</p>
          <p>
            Active sprint:{" "}
            <span className="font-medium text-foreground">
              {activeSprintQuery.data?.name || "None"}
            </span>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Create Sprint</CardTitle>
          </CardHeader>
          <CardContent>
            {!canManageSprints ? (
              <p className="text-sm text-muted-foreground">
                Only project owners and admins can create or activate sprints.
              </p>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) =>
                    createSprintMutation.mutate(values),
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Sprint name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Sprint 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startDate"
                    rules={{ required: "Start date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    rules={{ required: "End date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal</FormLabel>
                        <FormControl>
                          <Input placeholder="Ship first milestone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.watch("isActive") ?? false}
                      onChange={(event) =>
                        form.setValue("isActive", event.target.checked)
                      }
                    />
                    Start this sprint as active
                  </label>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createSprintMutation.isPending}
                  >
                    Create sprint
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>All Sprints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sprintsQuery.isLoading ? <p>Loading sprints...</p> : null}
            {!sprintsQuery.isLoading && !sprintsQuery.data?.length ? (
              <p className="text-sm text-muted-foreground">No sprints yet.</p>
            ) : null}
            {sprintsQuery.data?.map((sprint) => (
              <div
                key={sprint.id}
                className="rounded-xl border border-border/60 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{sprint.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {sprint.startDate.slice(0, 10)} to {sprint.endDate.slice(0, 10)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {sprint.goal || "No sprint goal yet."}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {sprint.isActive ? "Active" : "Inactive"}
                    </p>
                    {canManageSprints ? (
                      <div className="mt-2 flex gap-2">
                        {!sprint.isActive ? (
                          <Button
                            size="sm"
                            onClick={() => activateSprintMutation.mutate(sprint.id)}
                            disabled={activateSprintMutation.isPending}
                          >
                            Set active
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deactivateSprintMutation.mutate(sprint.id)}
                            disabled={deactivateSprintMutation.isPending}
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
