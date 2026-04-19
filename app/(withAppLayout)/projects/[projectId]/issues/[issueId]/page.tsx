import { Metadata } from "next"
import { IssueDetailsPage } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App - Issue Details",
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string; issueId: string }>
}) {
  const resolvedParams = await params

  return (
    <IssueDetailsPage
      projectId={Number(resolvedParams.projectId)}
      issueId={Number(resolvedParams.issueId)}
    />
  )
}
