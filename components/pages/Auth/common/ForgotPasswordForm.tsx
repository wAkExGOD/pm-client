"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { forgotPasswordSchema, ForgotPasswordSchema } from "../schemas"
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

type ForgotPasswordFormProps = {
  onToggleClick: () => void
}

export function ForgotPasswordForm({ onToggleClick }: ForgotPasswordFormProps) {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const { mutate: forgotPassword } = useMutation({
    mutationFn: async (forgotPasswordData: ForgotPasswordSchema) =>
      authApi.forgotPassword(forgotPasswordData),
    onSuccess: () => {
      toast.success("Success!", {
        description:
          "A link to reset your password has been sent to your email",
      })
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  function onSubmit(values: ForgotPasswordSchema) {
    forgotPassword(values)
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
          <Button type="submit" className="w-full">
            Send recovery link
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Have you already remembered your password?{" "}
          <a
            href="#"
            className="underline underline-offset-4"
            onClick={(e) => {
              e.preventDefault()
              onToggleClick()
            }}
          >
            Log in
          </a>
        </div>
      </form>
    </Form>
  )
}
