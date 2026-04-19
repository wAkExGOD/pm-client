import { Command } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PropsWithChildren } from "react"
import { AuthProcess } from "../Auth"

type AuthFormLayoutProps = PropsWithChildren<{ process: AuthProcess }>

const texts: Record<AuthProcess, { title: string; description: string }> = {
  login: {
    title: "Login",
    description: "Enter your email below to login to your account",
  },
  signup: {
    title: "Sign up",
    description: "Enter your email below to sign up for your account",
  },
  forgotPassword: {
    title: "Password recovery",
    description: "Enter your email below to recover your password",
  },
  changePassword: {
    title: "Change password",
    description: "Enter your new password",
  },
}

export function AuthFormLayout({ process, children }: AuthFormLayoutProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center items-center gap-2 font-medium">
        <div className="flex h-8 w-8 items-center justify-center rounded-md">
          <Command className="size-6" />
        </div>
        <span>Finances App</span>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{texts[process].title}</CardTitle>
            <CardDescription>{texts[process].description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
