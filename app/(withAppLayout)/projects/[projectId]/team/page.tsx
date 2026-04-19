import { Metadata } from "next"
import { ProjectTeam } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App - Project Team",
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = await params
  const projectId = Number(resolvedParams.projectId)

  return <ProjectTeam projectId={projectId} />
}
