"use client"

import { getQueryClient } from "@/app/get-query-client"
import { QueryClientProvider } from "@tanstack/react-query"
import { PropsWithChildren } from "react"

export function QueryProvider({ children }: PropsWithChildren) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
