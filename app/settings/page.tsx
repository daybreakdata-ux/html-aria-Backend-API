"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Save, Globe } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SettingsPage() {
  const router = useRouter()
  const [chatBoxWidth, setChatBoxWidth] = useState(768)
  const [lightModeBrightness, setLightModeBrightness] = useState(100)
  const [darkModeBrightness, setDarkModeBrightness] = useState(100)
  const [fontSize, setFontSize] = useState(16)
  const [accentColor, setAccentColor] = useState("#208299")
  const [userMessageColor, setUserMessageColor] = useState("#208299")
  const [manualLocation, setManualLocation] = useState("")
  const [holdProgress, setHoldProgress] = useState(0)
  const logoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const logoIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Load UI settings from localStorage
    setChatBoxWidth(Number(localStorage.getItem("aria_chat_width")) || 768)
    setLightModeBrightness(Number(localStorage.getItem("aria_light_brightness")) || 100)
    setDarkModeBrightness(Number(localStorage.getItem("aria_dark_brightness")) || 100)
    setFontSize(Number(localStorage.getItem("aria_font_size")) || 16)
    setAccentColor(localStorage.getItem("aria_accent_color") || "#208299")
    setUserMessageColor(localStorage.getItem("aria_user_message_color") || "#208299")
    setManualLocation(localStorage.getItem("aria_manual_location") || "")
  }, [])

  // Apply CSS variables in real-time
  useEffect(() => {
    applyCSSVariables()
  }, [chatBoxWidth, lightModeBrightness, darkModeBrightness, fontSize, accentColor, userMessageColor])

  const applyCSSVariables = () => {
    const root = document.documentElement
    root.style.setProperty("--chat-width", `${chatBoxWidth}px`)
    root.style.setProperty("--light-brightness", `${lightModeBrightness}%`)
    root.style.setProperty("--dark-brightness", `${darkModeBrightness}%`)
    root.style.setProperty("--base-font-size", `${fontSize}px`)
    root.style.setProperty("--accent-color", accentColor)
    root.style.setProperty("--user-message-color", userMessageColor)
  }

  const handleSave = () => {
    localStorage.setItem("aria_chat_width", chatBoxWidth.toString())
    localStorage.setItem("aria_light_brightness", lightModeBrightness.toString())
    localStorage.setItem("aria_dark_brightness", darkModeBrightness.toString())
    localStorage.setItem("aria_font_size", fontSize.toString())
    localStorage.setItem("aria_accent_color", accentColor)
    localStorage.setItem("aria_user_message_color", userMessageColor)
    localStorage.setItem("aria_manual_location", manualLocation)

    applyCSSVariables()
    router.push("/chat")
  }

  const handleLogoPress = () => {
    // Start progress bar animation
    let progress = 0
    logoIntervalRef.current = setInterval(() => {
      progress += 1
      setHoldProgress(progress)
    }, 100)

    // Set timeout for 10 seconds
    logoTimeoutRef.current = setTimeout(() => {
      // Grant access to admin page
      sessionStorage.setItem("aria_admin_token", "daybreak_admin_access")
      router.push("/settings/admin")

      // Clean up
      if (logoIntervalRef.current) clearInterval(logoIntervalRef.current)
      setHoldProgress(0)
    }, 10000)
  }

  const handleLogoRelease = () => {
    // Cancel the timeout and reset progress
    if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current)
    if (logoIntervalRef.current) clearInterval(logoIntervalRef.current)
    setHoldProgress(0)
  }

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
      localStorage.removeItem("aria_chats")
      alert("Chat history cleared successfully!")
    }
  }

  return (
    <div className="h-[100dvh] bg-background dark:bg-gradient-to-br dark:from-zinc-700 dark:to-indigo-600 flex flex-col overflow-hidden">
      <header className="flex-shrink-0 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto p-3 sm:p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/chat")} className="px-2 sm:px-3">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black))` }}>
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold">Settings</h1>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button onClick={handleSave} className="px-2 sm:px-3 text-xs sm:text-sm [&:not(:disabled):hover]:opacity-80" style={{ backgroundColor: 'var(--accent-color)' }}>
              <Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 pb-[env(safe-area-inset-bottom)]">
          {/* UI Customization */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">UI Customization</h2>

            <div className="space-y-2">
              <Label htmlFor="chat-width">Chat Box Max Width: {chatBoxWidth}px</Label>
              <Slider
                id="chat-width"
                value={[chatBoxWidth]}
                onValueChange={(value) => setChatBoxWidth(value[0])}
                min={400}
                max={1200}
                step={50}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Maximum width of the chat messages container
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="light-brightness">Light Mode Brightness: {lightModeBrightness}%</Label>
              <Slider
                id="light-brightness"
                value={[lightModeBrightness]}
                onValueChange={(value) => setLightModeBrightness(value[0])}
                min={50}
                max={150}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust brightness for light mode (100% is default)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dark-brightness">Dark Mode Brightness: {darkModeBrightness}%</Label>
              <Slider
                id="dark-brightness"
                value={[darkModeBrightness]}
                onValueChange={(value) => setDarkModeBrightness(value[0])}
                min={50}
                max={150}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust brightness for dark mode (100% is default)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-size">Base Font Size: {fontSize}px</Label>
              <Slider
                id="font-size"
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust the base font size for the entire app
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="accent-color"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#208299"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Primary accent color for buttons and highlights
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-message-color">User Message Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="user-message-color"
                  type="color"
                  value={userMessageColor}
                  onChange={(e) => setUserMessageColor(e.target.value)}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={userMessageColor}
                  onChange={(e) => setUserMessageColor(e.target.value)}
                  placeholder="#208299"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Color for user message indicators and avatar
              </p>
            </div>
          </section>

          {/* Location */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Location</h2>

            <div className="space-y-2">
              <Label htmlFor="manual-location">Manual Location Override</Label>
              <Input
                id="manual-location"
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="e.g., San Francisco, CA or leave empty for auto-detect"
              />
              <p className="text-xs text-muted-foreground">
                Override automatic location detection with a custom location
              </p>
            </div>
          </section>

          {/* Data Management */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Data Management</h2>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleClearHistory}
                className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
              >
                Clear Chat History
              </Button>
            </div>
          </section>

          {/* About */}
          <section className="space-y-4 border-t border-border pt-6">
            <h2 className="text-lg font-semibold">About Daybreak Data</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Version:</strong> 2.0.0
              </p>
              <p>
                <strong className="text-foreground">Description:</strong> ARIA is a private AI assistant, powered by advanced language models and real time data. Created by
                Daybreak Data to provide accurate, contextual, and up-to-date information.
              </p>
              <p>
                <strong className="text-foreground">Privacy:</strong> All data is stored locally in your browser. No
                information is sent to external servers except your conversations to the AI model and web
                searches when real-time information is requested.
              </p>
            </div>

            {/* Secret Admin Access Logo */}
            <div className="flex justify-center pt-4">
              <div
                className="relative cursor-pointer select-none"
                onMouseDown={handleLogoPress}
                onMouseUp={handleLogoRelease}
                onMouseLeave={handleLogoRelease}
                onTouchStart={handleLogoPress}
                onTouchEnd={handleLogoRelease}
                onTouchCancel={handleLogoRelease}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden" style={{ background: `linear-gradient(to bottom right, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black))` }}>
                  <Globe className="w-8 h-8 text-white" />
                  {holdProgress > 0 && (
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-white/30 transition-all"
                      style={{ height: `${holdProgress}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}