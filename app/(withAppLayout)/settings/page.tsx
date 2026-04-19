import { Metadata } from "next"
import { Settings } from "@/components/pages"

export const metadata: Metadata = {
  title: "Finances App - Settings",
  description: "Customize your Finance App",
}

export default function Page() {
  return <Settings />
}
