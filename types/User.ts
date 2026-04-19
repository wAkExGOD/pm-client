export type User = {
  id: number
  name: string
  email: string
  createdAt: string
  verified: boolean
}

export type LoggedInUser = {
  user: User
  access_token: string
}

export type AuthDto = {
  name?: string
  email: string
  password: string
}

export type ForgotPasswordDto = {
  email: string
}

export type ChangePasswordDto = {
  token: string
  password: string
}
