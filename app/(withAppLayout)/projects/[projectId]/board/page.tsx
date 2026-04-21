import { Metadata } from "next"
import { BoardPage } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App - Board",
}

export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const resolvedParams = await params

  return <BoardPage projectId={Number(resolvedParams.projectId)} />
}
