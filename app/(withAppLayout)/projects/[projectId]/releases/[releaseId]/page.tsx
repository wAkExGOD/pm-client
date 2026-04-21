import { Metadata } from "next"
import { ReleaseDetailsPage } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App - Release Details",
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string; releaseId: string }>
}) {
  const resolvedParams = await params

  return (
    <ReleaseDetailsPage
      projectId={Number(resolvedParams.projectId)}
      releaseId={Number(resolvedParams.releaseId)}
    />
  )
}
