"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getFileUrl } from "@/lib/utils"

type UserAvatarProps = {
  name: string
  email?: string
  avatarUrl?: string | null
  className?: string
}

const getInitials = (name: string, email?: string) => {
  const normalizedName = name.trim()

  if (!normalizedName) {
    return (email ?? "??").slice(0, 2).toUpperCase()
  }

  return normalizedName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function UserAvatar({
  name,
  email,
  avatarUrl,
  className,
}: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={getFileUrl(avatarUrl)} alt={email ?? name} />
      <AvatarFallback>{getInitials(name, email)}</AvatarFallback>
    </Avatar>
  )
}
