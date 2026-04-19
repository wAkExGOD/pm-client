import { Metadata } from "next"
import { Statistics } from "@/components/pages"

export const metadata: Metadata = {
  title: "Finances App - Statistics",
  description: "Get spending statistics in Finance App",
}

export default function Page() {
  return <Statistics />
}
