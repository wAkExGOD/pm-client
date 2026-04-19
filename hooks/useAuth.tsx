"use client"

import { authApi } from "@/api"
import { AppLoadingScreen } from "@/components/common"
import { ROUTES } from "@/lib/constants/routes"
import { LoggedInUser, User } from "@/types/User"
import { useQuery } from "@tanstack/react-query"
import { ApiError } from "next/dist/server/api-utils"
import { usePathname, useRouter } from "next/navigation"
import { PropsWithChildren, createContext, useContext } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export type AuthContextType = {
  user?: User
  isLoading: boolean
  error: Error | null
  login: (data: LoggedInUser) => void
  logout: () => void
}

export const AUTH_TOKEN_KEY = "project-management-app-token"
export const AUTHED_GUARD_ROUTE_PREFIXES = [
  ROUTES.HOME,
  ROUTES.SETTINGS,
  "/projects/",
] as const

const AuthContext = createContext<AuthContextType | null>(null)

const AuthProvider = ({ children }: PropsWithChildren) => {
  const pathname = usePathname()
  const isAuthedGuardRoute =
    pathname === ROUTES.HOME ||
    pathname === ROUTES.SETTINGS ||
    pathname.startsWith("/projects/")
  const router = useRouter()
  const queryClient = useQueryClient()
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const user = await authApi.getMe()
        console.log(user)

        return user
      } catch (error) {
        toast.error((error as ApiError)?.message || "Unauthorized")

        router.push(ROUTES.AUTH)

        return undefined
      }
    },
    enabled: isAuthedGuardRoute,
  })

  const login = (data: LoggedInUser) => {
    localStorage.setItem(AUTH_TOKEN_KEY, data.access_token)
    queryClient.setQueryData(["user"], data.user)
  }
  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    queryClient.removeQueries({ queryKey: ["user"] })
    router.push(ROUTES.AUTH)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
      }}
    >
      {!isAuthedGuardRoute && children}
      {isAuthedGuardRoute && isLoading ? (
        <AppLoadingScreen />
      ) : (
        user && children
      )}
    </AuthContext.Provider>
  )
}

const useAuth = () => useContext(AuthContext) as AuthContextType

export { AuthProvider, useAuth }
