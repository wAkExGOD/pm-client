import { Metadata } from "next"
import { IssuesPage } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App - Issues",
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = await params
  const projectId = Number(resolvedParams.projectId)

  return <IssuesPage projectId={projectId} />
}
