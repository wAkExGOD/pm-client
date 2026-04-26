import { apiInstance } from "./instance"
import type { User } from "@/types/User"

export const usersApi = {
  uploadAvatar: async (userId: number, file: File) => {
    const formData = new FormData()
    formData.append("avatar", file)

    return await apiInstance<User>(`/users/${userId}/avatar`, {
      method: "POST",
      body: formData,
    })
  },
}
