"use client"

import { usersApi } from "@/api"
import { UserAvatar } from "@/components/common"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { toast } from "sonner"

export function Settings() {
  const { theme: activeTheme, themes, setTheme, resolvedTheme } = useTheme()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(user!.id, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user"] })
      await queryClient.invalidateQueries({ queryKey: ["project-members"] })
      await queryClient.invalidateQueries({ queryKey: ["issues"] })
      toast.success("Avatar updated")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <div className="flex items-center gap-4">
                <UserAvatar
                  name={user.name}
                  email={user.email}
                  avatarUrl={user.avatarUrl}
                  className="size-16"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar-upload">Avatar</Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) {
                      uploadAvatarMutation.mutate(file)
                    }
                    event.target.value = ""
                  }}
                />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Current theme: {resolvedTheme || activeTheme || "system"}
          </p>
          <div className="flex flex-wrap gap-4">
            {themes.map((theme) => (
              <Button
                key={theme}
                onClick={() => setTheme(theme)}
                variant={theme === activeTheme ? "default" : "outline"}
              >
                {theme}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
