"use client"

import { Suspense, useState } from "react"
import { LoginForm } from "./common/LoginForm"
import { SignUpForm } from "./common/SignUpForm"
import { AuthFormLayout } from "./common/AuthFormLayout"
import { ForgotPasswordForm } from "./common/ForgotPasswordForm"
import { useSearchParams } from "next/navigation"
import { ChangePasswordForm } from "./common/ChangePasswordForm"

export type AuthProcess =
  | "login"
  | "signup"
  | "forgotPassword"
  | "changePassword"

function AuthComponent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [activeProcess, setActiveProcess] = useState<AuthProcess>(
    token ? "changePassword" : "login"
  )

  const handleSetSignUp = () => setActiveProcess("signup")
  const handleSetLogIn = () => setActiveProcess("login")
  const handleSetForgot = () => setActiveProcess("forgotPassword")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <AuthFormLayout process={activeProcess}>
          {activeProcess === "changePassword" && token && (
            <ChangePasswordForm
              token={token}
              onPasswordChange={handleSetLogIn}
            />
          )}
          {activeProcess === "login" && (
            <LoginForm
              onToggleClick={handleSetSignUp}
              onForgotClick={handleSetForgot}
            />
          )}
          {activeProcess === "signup" && (
            <SignUpForm onToggleClick={handleSetLogIn} />
          )}
          {activeProcess === "forgotPassword" && (
            <ForgotPasswordForm onToggleClick={handleSetLogIn} />
          )}
        </AuthFormLayout>
      </div>
    </div>
  )
}

export function Auth() {
  return (
    <Suspense fallback={<></>}>
      <AuthComponent />
    </Suspense>
  )
}
