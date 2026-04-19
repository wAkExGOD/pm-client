"use client"

import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function Settings() {
  const { theme: activeTheme, themes, setTheme } = useTheme()

  return (
    <div className="p-4 rounded-xl border">
      <h3 className="text-lg font-medium mb-6">Appearance</h3>
      <div className="flex flex-col gap-4">
        <Label>Light Mode</Label>
        <div className="flex flex-wrap gap-4">
          {themes.map((theme) => {
            return (
              <Button
                key={theme}
                onClick={() => setTheme(theme)}
                variant={theme === activeTheme ? "default" : "outline"}
              >
                {theme}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
