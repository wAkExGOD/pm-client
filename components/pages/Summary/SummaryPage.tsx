"use client"

import { issuesApi, projectsApi } from "@/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useProjects } from "@/hooks/useProjects"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

type SummaryPageProps = {
  projectId: number
}

const statusChartConfig = {
  TODO: { label: "To do", color: "hsl(213 94% 68%)" },
  IN_PROGRESS: { label: "In progress", color: "hsl(174 72% 36%)" },
  CODE_REVIEW: { label: "Code review", color: "hsl(38 92% 50%)" },
  DONE: { label: "Done", color: "hsl(352 83% 55%)" },
} satisfies ChartConfig

const typeChartConfig = {
  BUG: { label: "Bug", color: "hsl(352 83% 55%)" },
  TASK: { label: "Task", color: "hsl(213 94% 68%)" },
  STORY: { label: "Story", color: "hsl(174 72% 36%)" },
} satisfies ChartConfig

const priorityChartConfig = {
  LOW: { label: "Low", color: "hsl(199 89% 48%)" },
  MEDIUM: { label: "Medium", color: "hsl(38 92% 50%)" },
  HIGH: { label: "High", color: "hsl(352 83% 55%)" },
} satisfies ChartConfig

const workloadChartConfig = {
  workload: { label: "Assigned issues", color: "hsl(174 72% 36%)" },
} satisfies ChartConfig

export function SummaryPage({ projectId }: SummaryPageProps) {
  const { setSelectedProjectId } = useProjects()

  useEffect(() => {
    setSelectedProjectId(projectId)
  }, [projectId, setSelectedProjectId])

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsApi.getById(projectId),
  })

  const summaryQuery = useQuery({
    queryKey: ["summary", projectId],
    queryFn: () => issuesApi.getSummary(projectId),
  })

  const summary = summaryQuery.data

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>
            {projectQuery.data?.name || "Project"}{" "}
            {projectQuery.data ? `(${projectQuery.data.key})` : ""} Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            {projectQuery.data?.description ||
              "Overview of delivery progress and team workload."}
          </p>
        </CardContent>
      </Card>

      {summaryQuery.isLoading ? <p>Loading summary...</p> : null}

      {summary ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Completed Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold">{summary.completedLast7Days}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Created Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-semibold">{summary.createdLast7Days}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Issues by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={statusChartConfig} className="mx-auto h-[320px]">
                  <PieChart>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="label" />}
                      verticalAlign="top"
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Pie
                      data={summary.issuesByStatus}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={64}
                      outerRadius={110}
                      strokeWidth={4}
                      label={({ payload, percent }) =>
                        `${statusChartConfig[payload.label as keyof typeof statusChartConfig]?.label ?? payload.label} ${Math.round(percent * 100)}%`
                      }
                    >
                      {summary.issuesByStatus.map((entry) => (
                        <Cell
                          key={entry.label}
                          fill={`var(--color-${entry.label})`}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Issues by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={typeChartConfig} className="h-[320px]">
                  <BarChart accessibilityLayer data={summary.issuesByType}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="label" />}
                    />
                    <Bar dataKey="value" radius={8}>
                      {summary.issuesByType.map((entry) => (
                        <Cell
                          key={entry.label}
                          fill={`var(--color-${entry.label})`}
                        />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        offset={10}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Issues by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={priorityChartConfig} className="h-[320px]">
                  <BarChart accessibilityLayer data={summary.issuesByPriority}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="label" />}
                    />
                    <Bar dataKey="value" radius={8}>
                      {summary.issuesByPriority.map((entry) => (
                        <Cell
                          key={entry.label}
                          fill={`var(--color-${entry.label})`}
                        />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="top"
                        offset={10}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Team Workload</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={workloadChartConfig} className="h-[320px]">
                  <BarChart
                    accessibilityLayer
                    data={summary.teamWorkload.map((item) => ({
                      label: item.user.name,
                      workload: item.value,
                    }))}
                    layout="vertical"
                    margin={{ left: 24 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={110}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="workload"
                      radius={8}
                      fill="var(--color-workload)"
                    >
                      <LabelList
                        dataKey="workload"
                        position="right"
                        offset={8}
                        className="fill-foreground"
                        fontSize={12}
                      />
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}
