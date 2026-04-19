"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { changePasswordSchema, ChangePasswordSchema } from "../schemas"
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

type ChangePasswordFormProps = {
  token: string
  onPasswordChange: () => void
}

export function ChangePasswordForm({
  token,
  onPasswordChange,
}: ChangePasswordFormProps) {
  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      token,
    },
  })

  const { mutate: changePassword } = useMutation({
    mutationFn: async (changePasswordData: ChangePasswordSchema) =>
      authApi.changePassword(changePasswordData),
    onSuccess: () => {
      toast.success("Success!", {
        description: "Password has been changed",
      })
      onPasswordChange()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  function onSubmit(values: ChangePasswordSchema) {
    changePassword(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Change
          </Button>
        </div>
      </form>
    </Form>
  )
}
