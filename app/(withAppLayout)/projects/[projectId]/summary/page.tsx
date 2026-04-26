import { Metadata } from "next"
import { SummaryPage } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App - Summary",
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = await params

  return <SummaryPage projectId={Number(resolvedParams.projectId)} />
}
