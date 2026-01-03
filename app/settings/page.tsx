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
import { ThemeToggle } from "@/components/theme-toggle"

// Theme definitions - 4 carefully curated themes with high contrast and visibility
const themes = [
  {
    id: "ocean",
    name: "Ocean Blue",
    description: "Professional blue with excellent readability",
    colors: {
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
  },
  {
    id: "emerald",
    name: "Emerald Green",
    description: "Fresh green with high contrast",
    colors: {
      light: {
        accent: "#059669",
        userMessage: "#047857",
        background: "#f0fdf4",
        surface: "#ffffff",
        text: "#065f46",
        muted: "#475569"
      },
      dark: {
        accent: "#34d399",
        userMessage: "#10b981",
        background: "#0a1810",
        surface: "#1e293b",
        text: "#d1fae5",
        muted: "#94a3b8"
      }
    }
  },
  {
    id: "violet",
    name: "Violet Purple",
    description: "Rich purple with great visibility",
    colors: {
      light: {
        accent: "#7c3aed",
        userMessage: "#6d28d9",
        background: "#faf5ff",
        surface: "#ffffff",
        text: "#5b21b6",
        muted: "#475569"
      },
      dark: {
        accent: "#a78bfa",
        userMessage: "#8b5cf6",
        background: "#1a0f2e",
        surface: "#1e293b",
        text: "#ede9fe",
        muted: "#94a3b8"
      }
    }
  },
  {
    id: "slate",
    name: "Neutral Slate",
    description: "Elegant gray with perfect balance",
    colors: {
      light: {
        accent: "#0f172a",
        userMessage: "#1e293b",
        background: "#f8fafc",
        surface: "#ffffff",
        text: "#334155",
        muted: "#64748b"
      },
      dark: {
        accent: "#cbd5e1",
        userMessage: "#94a3b8",
        background: "#0f172a",
        surface: "#1e293b",
        text: "#f1f5f9",
        muted: "#94a3b8"
      }
    }
  }
]

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
  const [selectedTheme, setSelectedTheme] = useState("ocean")
  const [currentTheme, setCurrentTheme] = useState(themes[0])
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

  // Helper function to get theme colors based on current mode
  const getThemeColors = (theme: typeof themes[0]) => {
    // Default to light mode if systemTheme is undefined (during hydration)
    return (systemTheme === 'dark' && theme.colors.dark) ? theme.colors.dark : theme.colors.light
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

    // Load theme settings
    const savedTheme = localStorage.getItem("aria_theme") || "ocean"
    setSelectedTheme(savedTheme)
    const theme = themes.find(t => t.id === savedTheme) || themes[0]
    setCurrentTheme(theme)

    // Load font settings for current theme
    const themePrefix = `aria_theme_${savedTheme}_`
    const themeColors = getThemeColors(theme)
    setMenuFontFamily(localStorage.getItem(`${themePrefix}menu_font_family`) || "Inter, sans-serif")
    setMenuFontSize(Number(localStorage.getItem(`${themePrefix}menu_font_size`)) || 14)
    setMenuFontColor(localStorage.getItem(`${themePrefix}menu_font_color`) || themeColors.text)
    setChatFontFamily(localStorage.getItem(`${themePrefix}chat_font_family`) || "Inter, sans-serif")
    setChatFontSize(Number(localStorage.getItem(`${themePrefix}chat_font_size`)) || 14)
    setChatFontColor(localStorage.getItem(`${themePrefix}chat_font_color`) || themeColors.text)
    setSystemFontFamily(localStorage.getItem(`${themePrefix}system_font_family`) || "Inter, sans-serif")
    setSystemFontSize(Number(localStorage.getItem(`${themePrefix}system_font_size`)) || 14)
    setSystemFontColor(localStorage.getItem(`${themePrefix}system_font_color`) || themeColors.muted)

    setManualLocation(localStorage.getItem("aria_manual_location") || "")
  }, [mounted, systemTheme])

  // Apply CSS variables in real-time
  useEffect(() => {
    applyCSSVariables()
  }, [chatBoxWidth, lightModeBrightness, darkModeBrightness, currentTheme, menuFontFamily, menuFontSize, menuFontColor, chatFontFamily, chatFontSize, chatFontColor, systemFontFamily, systemFontSize, systemFontColor])

  const applyCSSVariables = () => {
    const root = document.documentElement
    root.style.setProperty("--chat-width", `${chatBoxWidth}px`)
    root.style.setProperty("--light-brightness", `${lightModeBrightness}%`)
    root.style.setProperty("--dark-brightness", `${darkModeBrightness}%`)

    // Apply theme colors based on current mode
    const themeColors = getThemeColors(currentTheme)
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

  const handleThemeChange = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    if (theme) {
      setSelectedTheme(themeId)
      setCurrentTheme(theme)

      // Load or set default font settings for the new theme
      const themePrefix = `aria_theme_${themeId}_`
      const savedMenuFamily = localStorage.getItem(`${themePrefix}menu_font_family`)
      const savedChatFamily = localStorage.getItem(`${themePrefix}chat_font_family`)
      const savedSystemFamily = localStorage.getItem(`${themePrefix}system_font_family`)
      
      const themeColors = getThemeColors(theme)

      setMenuFontFamily(savedMenuFamily || "Inter, sans-serif")
      setMenuFontSize(Number(localStorage.getItem(`${themePrefix}menu_font_size`)) || 14)
      setMenuFontColor(localStorage.getItem(`${themePrefix}menu_font_color`) || themeColors.text)

      setChatFontFamily(savedChatFamily || "Inter, sans-serif")
      setChatFontSize(Number(localStorage.getItem(`${themePrefix}chat_font_size`)) || 14)
      setChatFontColor(localStorage.getItem(`${themePrefix}chat_font_color`) || themeColors.text)

      setSystemFontFamily(savedSystemFamily || "Inter, sans-serif")
      setSystemFontSize(Number(localStorage.getItem(`${themePrefix}system_font_size`)) || 14)
      setSystemFontColor(localStorage.getItem(`${themePrefix}system_font_color`) || themeColors.muted)
    }
  }

  const handleSave = () => {
    // Save UI settings
    localStorage.setItem("aria_chat_width", chatBoxWidth.toString())
    localStorage.setItem("aria_light_brightness", lightModeBrightness.toString())
    localStorage.setItem("aria_dark_brightness", darkModeBrightness.toString())

    // Save theme
    localStorage.setItem("aria_theme", selectedTheme)

    // Save font settings for current theme
    const themePrefix = `aria_theme_${selectedTheme}_`
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

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
      localStorage.removeItem("aria_chats")
      alert("Chat history cleared successfully!")
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
      {/* Floating Buttons */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => router.push("/chat")} 
        className="floating-button top-left h-10 w-10 sm:h-11 sm:w-11 p-0 shadow-lg"
        title="Back to Chat"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      
      <Button 
        onClick={handleSave} 
        className="floating-button top-right-2 px-4 h-10 sm:h-11 text-sm shadow-lg [&:not(:disabled):hover]:opacity-80" 
        style={{ backgroundColor: 'var(--accent-color)' }}
        title="Save Changes"
      >
        <Save className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Save</span>
      </Button>
      
      <div className="floating-button top-right">
        <ThemeToggle />
      </div>

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
                    <p className="text-muted-foreground">Customize themes, fonts, and visual elements</p>
                  </div>

                  {/* Theme Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Theme Selection
                      </CardTitle>
                      <CardDescription>
                        Choose from popular color combinations. Font and color customizations below apply only to the selected theme.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {themes.map((theme) => {
                          const themeColors = getThemeColors(theme)
                          return (
                            <div
                              key={theme.id}
                              onClick={() => handleThemeChange(theme.id)}
                              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedTheme === theme.id
                                  ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30'
                                  : 'border-border hover:border-primary/50 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-foreground">{theme.name}</h3>
                                {selectedTheme === theme.id && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-primary">Active</span>
                                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                                  </div>
                                )}
                              </div>
                              <div
                                className="h-20 rounded-lg mb-3 flex items-center justify-center text-white text-base font-semibold shadow-md overflow-hidden relative"
                                style={{ background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.userMessage})` }}
                              >
                                <span className="relative z-10 drop-shadow-md">Color Preview</span>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                              </div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {theme.description}
                              </p>
                              <div className="mt-3 flex gap-2">
                                <div 
                                  className="flex-1 h-8 rounded-md"
                                  style={{ backgroundColor: themeColors.accent }}
                                  title="Accent color"
                                />
                                <div 
                                  className="flex-1 h-8 rounded-md"
                                  style={{ backgroundColor: themeColors.text }}
                                  title="Text color"
                                />
                                <div 
                                  className="flex-1 h-8 rounded-md"
                                  style={{ backgroundColor: themeColors.muted }}
                                  title="Muted color"
                                />
                              </div>
                            </div>
                          )
                        })}
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
