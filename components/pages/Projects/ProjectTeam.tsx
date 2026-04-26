"use client"

import { projectsApi } from "@/api"
import { UserAvatar } from "@/components/common"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProjects } from "@/hooks/useProjects"
import { ProjectRole } from "@/types/Project"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type ProjectTeamProps = {
  projectId: number
}

type AddMemberFormValues = {
  email: string
  role: ProjectRole
}

const PROJECT_ROLE_OPTIONS: ProjectRole[] = ["ADMIN", "MEMBER"]

export function ProjectTeam({ projectId }: ProjectTeamProps) {
  const queryClient = useQueryClient()
  const { setSelectedProjectId } = useProjects()

  useEffect(() => {
    setSelectedProjectId(projectId)
  }, [projectId, setSelectedProjectId])

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getById(projectId),
  })

  const membersQuery = useQuery({
    queryKey: ["project-members", projectId],
    queryFn: () => projectsApi.listMembers(projectId),
  })

  const form = useForm<AddMemberFormValues>({
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: (values: AddMemberFormValues) =>
      projectsApi.addMemberByEmail(projectId, {
        email: values.email.trim().toLowerCase(),
        role: values.role,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["project-members", projectId],
      })
      await queryClient.invalidateQueries({ queryKey: ["projects"] })
      form.reset({
        email: "",
        role: "MEMBER",
      })
      toast.success("Project member added")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const project = projectQuery.data
  const members = membersQuery.data ?? []
  const canManageMembers =
    project?.currentUserRole === "OWNER" || project?.currentUserRole === "ADMIN"

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>
            {project?.name || "Project team"}{" "}
            {project ? `(${project.key})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground">
          <p>{project?.description || "No description yet."}</p>
          {project?.owner ? (
            <p>
              Owner: {project.owner.name} ({project.owner.email})
            </p>
          ) : null}
          {project ? <p>Your role: {project.currentUserRole}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Add Member</CardTitle>
          </CardHeader>
          <CardContent>
            {!canManageMembers ? (
              <p className="text-sm text-muted-foreground">
                Only project owners and admins can add members.
              </p>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) =>
                    addMemberMutation.mutate(values),
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: "Email is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="teammate@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROJECT_ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={addMemberMutation.isPending}
                  >
                    Add member
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {membersQuery.isLoading ? <p>Loading team...</p> : null}
            {!membersQuery.isLoading && !members.length ? (
              <p className="text-sm text-muted-foreground">No members yet.</p>
            ) : null}
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl border border-border/60 p-4"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={member.user.name}
                    email={member.user.email}
                    avatarUrl={member.user.avatarUrl}
                  />
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>{member.role}</p>
                  <p>
                    {member.user.verified ? "Verified" : "Pending verification"}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
