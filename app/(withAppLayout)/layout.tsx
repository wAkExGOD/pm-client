import { AppLayout } from "@/components/layouts"

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AppLayout>{children}</AppLayout>
}
