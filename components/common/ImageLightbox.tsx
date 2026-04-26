"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import Image from "next/image"
import { useEffect, useState } from "react"

type ImageLightboxProps = {
  src?: string | null
  alt?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageLightbox({
  src,
  alt = "Preview image",
  open,
  onOpenChange,
}: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    if (open) {
      setZoom(1)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[92vh] max-w-[96vw] grid-rows-[1fr_auto] bg-black/95 p-3 sm:max-w-[96vw]"
        showCloseButton
      >
        <DialogTitle className="sr-only">Image preview</DialogTitle>
        <div className="flex min-h-0 items-center justify-center overflow-auto rounded-lg">
          {src ? (
            <div
              className="relative transition-transform duration-150 ease-out"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
              }}
            >
              <Image
                src={src}
                alt={alt}
                width={1600}
                height={1200}
                unoptimized
                className="h-auto max-h-[76vh] w-auto max-w-[84vw] object-contain"
              />
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => setZoom((current) => Math.max(0.5, current - 0.25))}
          >
            <Minus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => setZoom((current) => Math.min(3, current + 0.25))}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
