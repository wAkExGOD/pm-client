import { Metadata } from "next"
import { SprintsPage } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App - Sprints",
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = await params
  const projectId = Number(resolvedParams.projectId)

  return <SprintsPage projectId={projectId} />
}
