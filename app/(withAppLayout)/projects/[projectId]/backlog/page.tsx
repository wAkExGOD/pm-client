import { Metadata } from "next"
import { BacklogPage } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App - Backlog",
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = await params

  return <BacklogPage projectId={Number(resolvedParams.projectId)} />
}
