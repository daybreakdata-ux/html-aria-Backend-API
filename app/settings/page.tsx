"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Globe, Palette, Cpu, Settings, User, Monitor, Type, Droplet } from "lucide-react"

// Default theme colors (system preference based)
const defaultThemeColors = {
  light: {
    accent: "#0284c7",
    userMessage: "#0369a1",
    background: "#f0f9ff",
    surface: "#ffffff",
    text: "#0c4a6e",
    muted: "#475569"
  },
  dark: {
    accent: "#38bdf8",
    userMessage: "#0ea5e9",
    background: "#0c1821",
    surface: "#1e293b",
    text: "#e0f2fe",
    muted: "#94a3b8"
  }
}

// Font families
const fontFamilies = [
  { value: "Inter, sans-serif", label: "Inter (Modern)" },
  { value: "Roboto, sans-serif", label: "Roboto (Clean)" },
  { value: "Open Sans, sans-serif", label: "Open Sans (Friendly)" },
  { value: "Lato, sans-serif", label: "Lato (Rounded)" },
  { value: "Poppins, sans-serif", label: "Poppins (Bold)" },
  { value: "Nunito, sans-serif", label: "Nunito (Playful)" },
  { value: "Montserrat, sans-serif", label: "Montserrat (Geometric)" },
  { value: "Source Sans Pro, sans-serif", label: "Source Sans Pro (Professional)" },
  { value: "system-ui, sans-serif", label: "System (Default)" }
]

export default function SettingsPage() {
  const router = useRouter()
  const { theme: systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState("appearance")

  // UI Settings
  const [chatBoxWidth, setChatBoxWidth] = useState(768)
  const [lightModeBrightness, setLightModeBrightness] = useState(100)
  const [darkModeBrightness, setDarkModeBrightness] = useState(100)

  // Theme and Appearance
  const [menuFontFamily, setMenuFontFamily] = useState("Inter, sans-serif")
  const [menuFontSize, setMenuFontSize] = useState(14)
  const [menuFontColor, setMenuFontColor] = useState("#1e293b")
  const [chatFontFamily, setChatFontFamily] = useState("Inter, sans-serif")
  const [chatFontSize, setChatFontSize] = useState(14)
  const [chatFontColor, setChatFontColor] = useState("#1e293b")
  const [systemFontFamily, setSystemFontFamily] = useState("Inter, sans-serif")
  const [systemFontSize, setSystemFontSize] = useState(14)
  const [systemFontColor, setSystemFontColor] = useState("#64748b")

  // Location
  const [manualLocation, setManualLocation] = useState("")

  // Admin access
  const [holdProgress, setHoldProgress] = useState(0)
  const logoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const logoIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get the current mode (light or dark)
  const isDarkMode = systemTheme === 'dark'

  // Helper function to get default theme colors based on current mode
  const getThemeColors = () => {
    // Default to light mode if systemTheme is undefined (during hydration)
    return systemTheme === 'dark' ? defaultThemeColors.dark : defaultThemeColors.light
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Load UI settings from localStorage
    setChatBoxWidth(Number(localStorage.getItem("aria_chat_width")) || 768)
    setLightModeBrightness(Number(localStorage.getItem("aria_light_brightness")) || 100)
    setDarkModeBrightness(Number(localStorage.getItem("aria_dark_brightness")) || 100)

    // Load font settings (theme follows system preference)
    const themeColors = getThemeColors()
    const fontPrefix = `aria_font_`
    setMenuFontFamily(localStorage.getItem(`${fontPrefix}menu_font_family`) || "Inter, sans-serif")
    setMenuFontSize(Number(localStorage.getItem(`${fontPrefix}menu_font_size`)) || 14)
    setMenuFontColor(localStorage.getItem(`${fontPrefix}menu_font_color`) || themeColors.text)
    setChatFontFamily(localStorage.getItem(`${fontPrefix}chat_font_family`) || "Inter, sans-serif")
    setChatFontSize(Number(localStorage.getItem(`${fontPrefix}chat_font_size`)) || 14)
    setChatFontColor(localStorage.getItem(`${fontPrefix}chat_font_color`) || themeColors.text)
    setSystemFontFamily(localStorage.getItem(`${fontPrefix}system_font_family`) || "Inter, sans-serif")
    setSystemFontSize(Number(localStorage.getItem(`${fontPrefix}system_font_size`)) || 14)
    setSystemFontColor(localStorage.getItem(`${fontPrefix}system_font_color`) || themeColors.muted)

    setManualLocation(localStorage.getItem("aria_manual_location") || "")
  }, [mounted, systemTheme])

  // Apply CSS variables in real-time
  useEffect(() => {
    applyCSSVariables()
  }, [chatBoxWidth, lightModeBrightness, darkModeBrightness, menuFontFamily, menuFontSize, menuFontColor, chatFontFamily, chatFontSize, chatFontColor, systemFontFamily, systemFontSize, systemFontColor, systemTheme])

  const applyCSSVariables = () => {
    const root = document.documentElement
    root.style.setProperty("--chat-width", `${chatBoxWidth}px`)
    root.style.setProperty("--light-brightness", `${lightModeBrightness}%`)
    root.style.setProperty("--dark-brightness", `${darkModeBrightness}%`)

    // Apply theme colors based on current mode
    const themeColors = getThemeColors()
    root.style.setProperty("--accent-color", themeColors.accent)
    root.style.setProperty("--user-message-color", themeColors.userMessage)

    // Apply font settings
    root.style.setProperty("--menu-font-family", menuFontFamily)
    root.style.setProperty("--menu-font-size", `${menuFontSize}px`)
    root.style.setProperty("--menu-font-color", menuFontColor)
    root.style.setProperty("--chat-font-family", chatFontFamily)
    root.style.setProperty("--chat-font-size", `${chatFontSize}px`)
    root.style.setProperty("--chat-font-color", chatFontColor)
    root.style.setProperty("--system-font-family", systemFontFamily)
    root.style.setProperty("--system-font-size", `${systemFontSize}px`)
    root.style.setProperty("--system-font-color", systemFontColor)
  }


  const handleSave = () => {
    // Save UI settings
    localStorage.setItem("aria_chat_width", chatBoxWidth.toString())
    localStorage.setItem("aria_light_brightness", lightModeBrightness.toString())
    localStorage.setItem("aria_dark_brightness", darkModeBrightness.toString())

    // Save font settings (theme follows system preference)
    const themePrefix = `aria_font_`
    localStorage.setItem(`${themePrefix}menu_font_family`, menuFontFamily)
    localStorage.setItem(`${themePrefix}menu_font_size`, menuFontSize.toString())
    localStorage.setItem(`${themePrefix}menu_font_color`, menuFontColor)
    localStorage.setItem(`${themePrefix}chat_font_family`, chatFontFamily)
    localStorage.setItem(`${themePrefix}chat_font_size`, chatFontSize.toString())
    localStorage.setItem(`${themePrefix}chat_font_color`, chatFontColor)
    localStorage.setItem(`${themePrefix}system_font_family`, systemFontFamily)
    localStorage.setItem(`${themePrefix}system_font_size`, systemFontSize.toString())
    localStorage.setItem(`${themePrefix}system_font_color`, systemFontColor)

    // Save location
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

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
      try {
        // Show loading state
        alert("Clearing chat history...")

        // Clear local storage first
        localStorage.removeItem("aria_chats")

        // Clear any other chat-related localStorage items
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('aria_chat_') || key.startsWith('aria_font_'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))

        // Clear server-side chats (only attempt if we think user might be authenticated)
        // We'll try the API call, and if it fails with 401, we'll just clear local storage
        console.log('Attempting to clear server-side chat history...')
        try {
          const response = await fetch('/api/chat/clear', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          const responseData = await response.json()
          console.log('Clear API response:', response.status, responseData)

          if (!response.ok) {
            if (response.status === 401) {
              console.log('User not authenticated, skipping server-side clearing')
            } else {
              console.warn('Server-side clearing failed:', responseData.error)
            }
          } else {
            console.log('Server-side chats cleared successfully')
          }
        } catch (apiError) {
          console.warn('Server-side clearing failed with exception:', apiError)
        }

        alert("Chat history cleared successfully!")

        // Force a hard refresh to clear all client-side state
        window.location.href = window.location.href

      } catch (error) {
        console.error('Error clearing chat history:', error)
        // Even if there's an error, the local storage was cleared
        alert("Local chat history cleared. Server-side clearing may have failed.")
        // Still refresh the page
        window.location.href = window.location.href
      }
    }
  }

  const categories = [
    { id: "appearance", label: "Appearance", icon: Palette, description: "Themes, fonts, and visual customization" },
    { id: "ai", label: "AI Settings", icon: Cpu, description: "Model parameters and AI behavior" },
    { id: "system", label: "System", icon: Settings, description: "App settings and configuration" },
    { id: "account", label: "User Account", icon: User, description: "Account settings and data management" }
  ]

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <header className="flex-shrink-0 border-b border-border bg-card">
        <div className="max-w-6xl mx-auto p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/chat")} className="px-2 sm:px-3">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(to bottom right, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black))` }}>
                <Globe className="w-4.5 h-4.5 text-white" />
              </div>
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} className="px-3 text-sm [&:not(:disabled):hover]:opacity-80" style={{ backgroundColor: 'var(--accent-color)' }}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="h-full flex flex-col">
          {/* Category Tabs */}
          <div className="border-b border-border bg-muted/30">
            <div className="max-w-6xl mx-auto">
              <TabsList className="grid w-full grid-cols-4 p-1">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="flex flex-col items-center gap-1 py-3 px-2 text-xs data-[state=active]:bg-background"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{category.label}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto p-6 pb-[env(safe-area-inset-bottom)]">

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-8 mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Appearance Settings</h2>
                    <p className="text-muted-foreground">Customize fonts and visual elements. Theme automatically follows your system preference.</p>
                  </div>

                  {/* Theme Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Theme Settings
                      </CardTitle>
                      <CardDescription>
                        The app automatically follows your system theme preference (light/dark mode). Font and color customizations below apply to both themes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center p-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                            <Monitor className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            System theme: <span className="font-medium capitalize">{systemTheme || 'light'}</span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Font Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Type className="w-5 h-5" />
                        Font Customization
                      </CardTitle>
                      <CardDescription>
                        Customize fonts for different parts of the application. Changes apply only to the current theme.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Menu Fonts */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          Menu Fonts
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Font Family</Label>
                            <Select value={menuFontFamily} onValueChange={setMenuFontFamily}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fontFamilies.map((font) => (
                                  <SelectItem key={font.value} value={font.value}>
                                    {font.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Font Size: {menuFontSize}px</Label>
                            <Slider
                              value={[menuFontSize]}
                              onValueChange={(value) => setMenuFontSize(value[0])}
                              min={10}
                              max={20}
                              step={1}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Font Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={menuFontColor}
                                onChange={(e) => setMenuFontColor(e.target.value)}
                                className="w-12 h-10 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={menuFontColor}
                                onChange={(e) => setMenuFontColor(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-md border border-border">
                          <p className="text-sm font-medium mb-1" style={{ fontFamily: menuFontFamily, fontSize: `${menuFontSize}px`, color: menuFontColor }}>
                            Preview: Settings • History • Modes
                          </p>
                          <p className="text-xs opacity-60">Menu font preview</p>
                        </div>
                      </div>

                      {/* Chat/Message Fonts */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Type className="w-4 h-4" />
                          Chat & Message Fonts
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Font Family</Label>
                            <Select value={chatFontFamily} onValueChange={setChatFontFamily}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fontFamilies.map((font) => (
                                  <SelectItem key={font.value} value={font.value}>
                                    {font.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Font Size: {chatFontSize}px</Label>
                            <Slider
                              value={[chatFontSize]}
                              onValueChange={(value) => setChatFontSize(value[0])}
                              min={12}
                              max={18}
                              step={1}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Font Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={chatFontColor}
                                onChange={(e) => setChatFontColor(e.target.value)}
                                className="w-12 h-10 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={chatFontColor}
                                onChange={(e) => setChatFontColor(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-md border border-border">
                          <p className="text-sm font-medium mb-1" style={{ fontFamily: chatFontFamily, fontSize: `${chatFontSize}px`, color: chatFontColor }}>
                            Preview: This is how your chat messages will look with the selected font settings.
                          </p>
                          <p className="text-xs opacity-60">Chat message font preview</p>
                        </div>
                      </div>

                      {/* System Fonts */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          System Fonts
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Font Family</Label>
                            <Select value={systemFontFamily} onValueChange={setSystemFontFamily}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {fontFamilies.map((font) => (
                                  <SelectItem key={font.value} value={font.value}>
                                    {font.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Font Size: {systemFontSize}px</Label>
                            <Slider
                              value={[systemFontSize]}
                              onValueChange={(value) => setSystemFontSize(value[0])}
                              min={10}
                              max={16}
                              step={1}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Font Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={systemFontColor}
                                onChange={(e) => setSystemFontColor(e.target.value)}
                                className="w-12 h-10 cursor-pointer"
                              />
                              <Input
                                type="text"
                                value={systemFontColor}
                                onChange={(e) => setSystemFontColor(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-muted/30 rounded-md border border-border">
                          <p className="text-sm font-medium mb-1" style={{ fontFamily: systemFontFamily, fontSize: `${systemFontSize}px`, color: systemFontColor }}>
                            Preview: Buttons, labels, and other system text will use this styling.
                          </p>
                          <p className="text-xs opacity-60">System font preview</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Display Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="w-5 h-5" />
                        Display Settings
                      </CardTitle>
                      <CardDescription>
                        Adjust layout and brightness settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* AI Settings Tab */}
              <TabsContent value="ai" className="space-y-8 mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">AI Settings</h2>
                    <p className="text-muted-foreground">Configure AI model parameters and behavior</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>AI Configuration</CardTitle>
                      <CardDescription>
                        These settings control how the AI responds. For advanced configuration, hold the logo below for 10 seconds.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Advanced AI settings are available in Admin mode.
                      </p>
                      <div className="flex justify-center">
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
                      <p className="text-xs text-muted-foreground mt-2">
                        Hold for 10 seconds to access admin settings
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* System Tab */}
              <TabsContent value="system" className="space-y-8 mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">System Settings</h2>
                    <p className="text-muted-foreground">App configuration and system preferences</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Location Settings
                      </CardTitle>
                      <CardDescription>
                        Configure location detection for contextual responses
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* User Account Tab */}
              <TabsContent value="account" className="space-y-8 mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">User Account</h2>
                    <p className="text-muted-foreground">Account settings and data management</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Data Management
                      </CardTitle>
                      <CardDescription>
                        Manage your chat history and personal data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          onClick={handleClearHistory}
                          className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                        >
                          Clear Chat History
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This will permanently delete all your chat conversations.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>About ARIA</CardTitle>
                      <CardDescription>
                        Information about this application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
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
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
