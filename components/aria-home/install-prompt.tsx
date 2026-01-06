"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, X } from "lucide-react"

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log("[v0] Install prompt outcome:", outcome)
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("installPromptDismissed", "true")
  }

  if (!showPrompt || localStorage.getItem("installPromptDismissed") === "true") {
    return null
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 mx-auto max-w-md shadow-lg animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Download className="h-5 w-5 text-primary-foreground" />
        </div>

        <div className="flex-1 space-y-2">
          <h3 className="font-semibold">Install Discover</h3>
          <p className="text-sm text-muted-foreground">Add to your home screen for quick access and offline support</p>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleInstall} size="sm" className="flex-1">
              Install
            </Button>
            <Button onClick={handleDismiss} size="sm" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
