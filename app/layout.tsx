import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/common"
import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/components/providers"
import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"
import { Suspense } from "react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Finances App",
  description: "Keep track of your spending with Finance App",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div>Loading...</div>}>
            <QueryProvider>
              <AuthProvider>
                {children}
                <Toaster
                  toastOptions={{
                    classNames: {
                      toast: "toast",
                      title: "title",
                      description: "description",
                      actionButton: "action-button",
                      cancelButton: "cancel-button",
                      closeButton: "close-button",
                    },
                  }}
                />
              </AuthProvider>
            </QueryProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
