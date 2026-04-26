"use client"

import { Button } from "@/components/ui/button"
import { ImageLightbox } from "@/components/common"
import { cn } from "@/lib/utils"
import Image from "@tiptap/extension-image"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Heading1,
  Heading2,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Quote,
  Underline as UnderlineIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  className,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const lastSyncedValueRef = useRef(value || "<p></p>")
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] rounded-b-xl border border-t-0 border-border/60 px-4 py-3 outline-none prose prose-sm max-w-none",
      },
      handleClickOn: (_view, _pos, node) => {
        if (node.type.name === "image") {
          const src = node.attrs.src as string | undefined
          if (src) {
            setPreviewImageSrc(src)
            return true
          }
        }

        return false
      },
    },
    onUpdate: ({ editor }) => {
      const nextHtml = editor.getHTML()
      lastSyncedValueRef.current = nextHtml
      onChange(nextHtml)
    },
  })

  useEffect(() => {
    if (!editor) {
      return
    }

    const currentHtml = editor.getHTML()
    if (value !== currentHtml && value !== lastSyncedValueRef.current) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false })
      lastSyncedValueRef.current = value || "<p></p>"
    }
  }, [editor, value])

  if (!editor) {
    return null
  }

  return (
    <div className={cn("overflow-hidden rounded-xl", className)}>
      <div className="flex flex-wrap gap-2 rounded-t-xl border border-border/60 bg-muted/30 p-2">
        <Button
          type="button"
          size="sm"
          variant={
            editor.isActive("heading", { level: 1 }) ? "default" : "outline"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={
            editor.isActive("heading", { level: 2 }) ? "default" : "outline"
          }
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bold") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("italic") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("underline") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bulletList") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("orderedList") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("blockquote") ? "default" : "outline"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]

            if (!file) {
              return
            }

            const reader = new FileReader()
            reader.onload = () => {
              const result = reader.result
              if (typeof result === "string") {
                editor.chain().focus().setImage({ src: result }).run()
              }
            }
            reader.readAsDataURL(file)
            event.target.value = ""
          }}
        />
      </div>
      <EditorContent editor={editor} />
      <ImageLightbox
        src={previewImageSrc}
        open={Boolean(previewImageSrc)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewImageSrc(null)
          }
        }}
      />
    </div>
  )
}
