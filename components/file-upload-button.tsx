"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip } from "lucide-react"

interface FileUploadButtonProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function FileUploadButton({ onFileSelect, disabled }: FileUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }

      // Check file type (text, images, documents)
      const allowedTypes = [
        "text/plain",
        "text/markdown",
        "text/csv",
        "application/json",
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ]

      if (!allowedTypes.includes(file.type)) {
        alert("Unsupported file type. Please upload text, images, or documents.")
        return
      }

      onFileSelect(file)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.csv,.json,.pdf,.jpg,.jpeg,.png,.gif,.webp"
      />
      <Button
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="h-11 w-11 sm:h-12 sm:w-12 p-0 bg-background hover:bg-muted border-2 border-input flex-shrink-0 rounded-xl touch-manipulation text-foreground"
        title="Upload file"
      >
        <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
      </Button>
    </>
  )
}
