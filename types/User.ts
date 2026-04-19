export type User = {
  id: number
  email: string
}

export type LoggedInUser = {
  user: User
  access_token: string
}

export type AuthDto = {
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
