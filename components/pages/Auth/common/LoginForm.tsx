"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { LogInSchema, logInSchema } from "../schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useMutation } from "@tanstack/react-query"
import { authApi } from "@/api"
import { toast } from "sonner"
import { ROUTES } from "@/lib/constants/routes"
import { useAuth } from "@/hooks/useAuth"

type LogInFormProps = {
  onToggleClick: () => void
  onForgotClick: () => void
}

export function LoginForm({ onToggleClick, onForgotClick }: LogInFormProps) {
  const router = useRouter()
  const auth = useAuth()

  const form = useForm<LogInSchema>({
    resolver: zodResolver(logInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { mutate: logIn } = useMutation({
    mutationFn: async (logInData: LogInSchema) => authApi.logIn(logInData),
    onSuccess: (data) => {
      auth.login(data)
      toast.success("Success!", {
        description: "Logged in!",
      })
      router.push(ROUTES.HOME)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  function onSubmit(values: LogInSchema) {
    logIn(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="mail@example.com"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" autoComplete="off" />
                </FormControl>
                <a
                  href="#"
                  className="underline text-sm underline-offset-4"
                  onClick={(e) => {
                    e.preventDefault()
                    onForgotClick()
                  }}
                >
                  Forgot the password?
                </a>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <a
            href="#"
            className="underline underline-offset-4"
            onClick={(e) => {
              e.preventDefault()
              onToggleClick()
            }}
          >
            Sign up
          </a>
        </div>
      </form>
    </Form>
  )
}
