import { Metadata } from "next"
import { Auth } from "@/components/pages"

export const metadata: Metadata = {
  title: "PM App Auth",
}

export default function Page() {
  return <Auth />
}
