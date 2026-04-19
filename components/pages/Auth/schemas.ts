import { z } from "zod"

export const emailSchema = z
  .string()
  .min(3, "Email is required")
  .email("Invalid email")
export const passwordSchema = z
  .string()
  .min(6, "Password is too small")
  .max(50, "Password is too big")

export const logInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const signUpSchema = logInSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const changePasswordSchema = z.object({
  token: z.string().min(19, "Token is not valid").max(19, "Token is not valid"),
  password: passwordSchema,
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type LogInSchema = z.infer<typeof logInSchema>
export type SignUpSchema = z.infer<typeof signUpSchema>
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
