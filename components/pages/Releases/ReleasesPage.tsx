"use client"

import { projectsApi, releasesApi } from "@/api"
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
import { ROUTES } from "@/lib/constants/routes"
import type {
  CreateReleaseDto,
  ReleaseFilters,
  ReleaseStatus,
} from "@/types/Release"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type ReleasesPageProps = {
  projectId: number
}

const RELEASE_STATUS_LABELS: Record<ReleaseStatus, string> = {
  UNRELEASED: "Unreleased",
  RELEASED: "Released",
}

export function ReleasesPage({ projectId }: ReleasesPageProps) {
  const queryClient = useQueryClient()
  const { setSelectedProjectId } = useProjects()
  const [filters, setFilters] = useState<ReleaseFilters>({
    status: "UNRELEASED",
  })

  useEffect(() => {
    setSelectedProjectId(projectId)
  }, [projectId, setSelectedProjectId])

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getById(projectId),
  })

  const releasesQuery = useQuery({
    queryKey: ["releases", projectId, filters],
    queryFn: () => releasesApi.list(projectId, filters),
  })

  const form = useForm<CreateReleaseDto>({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      releaseDate: "",
      status: "UNRELEASED",
    },
  })

  const canManageReleases =
    projectQuery.data?.currentUserRole === "OWNER" ||
    projectQuery.data?.currentUserRole === "ADMIN"

  const refreshReleases = async () => {
    await queryClient.invalidateQueries({ queryKey: ["releases", projectId] })
  }

  const createReleaseMutation = useMutation({
    mutationFn: (values: CreateReleaseDto) =>
      releasesApi.create(projectId, {
        ...values,
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      }),
    onSuccess: async () => {
      await refreshReleases()
      form.reset({
        name: "",
        description: "",
        startDate: "",
        releaseDate: "",
        status: "UNRELEASED",
      })
      toast.success("Release created")
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
            {projectQuery.data ? `(${projectQuery.data.key})` : ""} Releases
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            {projectQuery.data?.description ||
              "Track scope and shipment milestones through releases."}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Create Release</CardTitle>
          </CardHeader>
          <CardContent>
            {!canManageReleases ? (
              <p className="text-sm text-muted-foreground">
                Only project owners and admins can create releases.
              </p>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) =>
                    createReleaseMutation.mutate(values),
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Release name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="April platform release" {...field} />
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
                          <Input placeholder="Scope for the next shipment" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
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
                      name="releaseDate"
                      rules={{ required: "Release date is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Release Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value as ReleaseStatus)
                          }
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UNRELEASED">Unreleased</SelectItem>
                            <SelectItem value="RELEASED">Released</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createReleaseMutation.isPending}
                  >
                    Create release
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Release Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search releases by title"
              value={filters.search ?? ""}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  search: event.target.value || undefined,
                }))
              }
            />
            <Select
              value={filters.status ?? "all-releases"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status:
                    value === "all-releases"
                      ? undefined
                      : (value as ReleaseStatus),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Release status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-releases">All releases</SelectItem>
                <SelectItem value="UNRELEASED">Unreleased</SelectItem>
                <SelectItem value="RELEASED">Released</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-3">
              {releasesQuery.isLoading ? <p>Loading releases...</p> : null}
              {!releasesQuery.isLoading && !releasesQuery.data?.length ? (
                <p className="text-sm text-muted-foreground">
                  No releases found.
                </p>
              ) : null}
              {releasesQuery.data?.map((release) => (
                <Link
                  key={release.id}
                  href={ROUTES.projectRelease(projectId, release.id)}
                  className="block rounded-xl border border-border/60 p-4 transition hover:border-foreground/20 hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{release.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {RELEASE_STATUS_LABELS[release.status]} · {release.issueCount}{" "}
                        issues
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Start: {release.startDate.slice(0, 10)} · Release:{" "}
                        {release.releaseDate.slice(0, 10)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {release.description || "No description yet."}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>#{release.id}</p>
                      <p>{release.initiator.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
