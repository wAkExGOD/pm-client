import { Metadata } from "next"
import { SprintDetailsPage } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App - Sprint Details",
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string; sprintId: string }>
}) {
  const resolvedParams = await params

  return (
    <SprintDetailsPage
      projectId={Number(resolvedParams.projectId)}
      sprintId={Number(resolvedParams.sprintId)}
    />
  )
}
