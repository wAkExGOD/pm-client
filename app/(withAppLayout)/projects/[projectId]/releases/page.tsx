import { Metadata } from "next"
import { ReleasesPage } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App - Releases",
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = await params

  return <ReleasesPage projectId={Number(resolvedParams.projectId)} />
}
