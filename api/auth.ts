import { apiInstance } from "./instance"
import {
  LoggedInUser,
  AuthDto,
  User,
  ForgotPasswordDto,
  ChangePasswordDto,
} from "@/types/User"

export const authApi = {
  getMe: () => apiInstance<User>("/auth/profile"),
  logIn: (logInData: AuthDto) =>
    apiInstance<LoggedInUser>("/auth/login", {
      method: "POST",
      json: logInData,
    }),
  forgotPassword: (forgotPasswordData: ForgotPasswordDto) =>
    apiInstance("/auth/forgot-password", {
      method: "POST",
      json: forgotPasswordData,
    }),
  changePassword: (changePasswordData: ChangePasswordDto) =>
    apiInstance("/auth/change-password", {
      method: "POST",
      json: changePasswordData,
    }),
  signUp: (signUpData: AuthDto) =>
    apiInstance("/auth/register", {
      method: "POST",
      json: signUpData,
    }),
}
