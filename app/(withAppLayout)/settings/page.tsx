import { Metadata } from "next"
import { Settings } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App - Settings",
  description: "Customize your PM App",
}

export default function Page() {
  return <Settings />
}
