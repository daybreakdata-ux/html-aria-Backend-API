"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ArrowLeft, Save, Settings, Shield, Bell, Eye, Download, Upload, RotateCcw, Globe, Palette, Zap, Volume2, MessageSquare } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState("general")

  // General Settings
  const [language, setLanguage] = useState("en")
  const [autoSave, setAutoSave] = useState(true)
  const [compactMode, setCompactMode] = useState(false)

  // Privacy & Data
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [dataRetention, setDataRetention] = useState("30")
  const [shareUsageData, setShareUsageData] = useState(false)

  // Accessibility
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [fontSize, setFontSize] = useState("medium")
  const [dyslexicFont, setDyslexicFont] = useState(false)

  // Notifications
  const [messageNotifications, setMessageNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [desktopNotifications, setDesktopNotifications] = useState(false)

  // Advanced
  const [developerMode, setDeveloperMode] = useState(false)
  const [debugLogging, setDebugLogging] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Load settings from localStorage
    setLanguage(localStorage.getItem("aria_language") || "en")
    setAutoSave(localStorage.getItem("aria_auto_save") !== "false")
    setCompactMode(localStorage.getItem("aria_compact_mode") === "true")

    setAnalyticsEnabled(localStorage.getItem("aria_analytics") === "true")
    setDataRetention(localStorage.getItem("aria_data_retention") || "30")
    setShareUsageData(localStorage.getItem("aria_share_usage") === "true")

    setHighContrast(localStorage.getItem("aria_high_contrast") === "true")
    setReducedMotion(localStorage.getItem("aria_reduced_motion") === "true")
    setFontSize(localStorage.getItem("aria_font_size") || "medium")
    setDyslexicFont(localStorage.getItem("aria_dyslexic_font") === "true")

    setMessageNotifications(localStorage.getItem("aria_msg_notifications") !== "false")
    setSoundEnabled(localStorage.getItem("aria_sound_enabled") !== "false")
    setDesktopNotifications(localStorage.getItem("aria_desktop_notifications") === "true")

    setDeveloperMode(localStorage.getItem("aria_developer_mode") === "true")
    setDebugLogging(localStorage.getItem("aria_debug_logging") === "true")
  }, [mounted])

  const handleSave = () => {
    // Save all settings to localStorage
    localStorage.setItem("aria_language", language)
    localStorage.setItem("aria_auto_save", autoSave.toString())
    localStorage.setItem("aria_compact_mode", compactMode.toString())

    localStorage.setItem("aria_analytics", analyticsEnabled.toString())
    localStorage.setItem("aria_data_retention", dataRetention)
    localStorage.setItem("aria_share_usage", shareUsageData.toString())

    localStorage.setItem("aria_high_contrast", highContrast.toString())
    localStorage.setItem("aria_reduced_motion", reducedMotion.toString())
    localStorage.setItem("aria_font_size", fontSize)
    localStorage.setItem("aria_dyslexic_font", dyslexicFont.toString())

    localStorage.setItem("aria_msg_notifications", messageNotifications.toString())
    localStorage.setItem("aria_sound_enabled", soundEnabled.toString())
    localStorage.setItem("aria_desktop_notifications", desktopNotifications.toString())

    localStorage.setItem("aria_developer_mode", developerMode.toString())
    localStorage.setItem("aria_debug_logging", debugLogging.toString())

    // Apply theme changes immediately
    if (theme) {
      setTheme(theme)
    }

    router.push("/chat")
  }

  const handleExportSettings = () => {
    const settings = {
      language,
      autoSave,
      compactMode,
      analyticsEnabled,
      dataRetention,
      shareUsageData,
      highContrast,
      reducedMotion,
      fontSize,
      dyslexicFont,
      messageNotifications,
      soundEnabled,
      desktopNotifications,
      developerMode,
      debugLogging,
      theme
    }

    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'aria-settings.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string)

          // Apply imported settings
          if (settings.language) setLanguage(settings.language)
          if (typeof settings.autoSave === 'boolean') setAutoSave(settings.autoSave)
          if (typeof settings.compactMode === 'boolean') setCompactMode(settings.compactMode)
          if (typeof settings.analyticsEnabled === 'boolean') setAnalyticsEnabled(settings.analyticsEnabled)
          if (settings.dataRetention) setDataRetention(settings.dataRetention)
          if (typeof settings.shareUsageData === 'boolean') setShareUsageData(settings.shareUsageData)
          if (typeof settings.highContrast === 'boolean') setHighContrast(settings.highContrast)
          if (typeof settings.reducedMotion === 'boolean') setReducedMotion(settings.reducedMotion)
          if (settings.fontSize) setFontSize(settings.fontSize)
          if (typeof settings.dyslexicFont === 'boolean') setDyslexicFont(settings.dyslexicFont)
          if (typeof settings.messageNotifications === 'boolean') setMessageNotifications(settings.messageNotifications)
          if (typeof settings.soundEnabled === 'boolean') setSoundEnabled(settings.soundEnabled)
          if (typeof settings.desktopNotifications === 'boolean') setDesktopNotifications(settings.desktopNotifications)
          if (typeof settings.developerMode === 'boolean') setDeveloperMode(settings.developerMode)
          if (typeof settings.debugLogging === 'boolean') setDebugLogging(settings.debugLogging)

          alert("Settings imported successfully!")
        } catch (error) {
          alert("Error importing settings. Please check the file format.")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleResetSettings = () => {
    // Reset to defaults
    setLanguage("en")
    setAutoSave(true)
    setCompactMode(false)
    setAnalyticsEnabled(false)
    setDataRetention("30")
    setShareUsageData(false)
    setHighContrast(false)
    setReducedMotion(false)
    setFontSize("medium")
    setDyslexicFont(false)
    setMessageNotifications(true)
    setSoundEnabled(true)
    setDesktopNotifications(false)
    setDeveloperMode(false)
    setDebugLogging(false)

    alert("Settings reset to defaults!")
  }

  const handleClearData = async () => {
    try {
      // Clear local chat-related localStorage items
      localStorage.removeItem("aria_chats")
      localStorage.removeItem("aria_anonymous_messages")

      // Clear any other app-related localStorage items
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('aria_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Clear server-side chats (only attempt if we think user might be authenticated)
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

      alert("All data cleared successfully!")

      // Force a hard refresh to clear all client-side state
      window.location.href = window.location.href

    } catch (error) {
      console.error('Error clearing data:', error)
      alert("An error occurred while clearing data. Some data may remain.")
    }
  }

  const categories = [
    { id: "general", label: "General", icon: Settings, description: "App preferences and behavior" },
    { id: "privacy", label: "Privacy & Data", icon: Shield, description: "Data management and privacy settings" },
    { id: "accessibility", label: "Accessibility", icon: Eye, description: "Accessibility and display options" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Notification preferences" },
    { id: "advanced", label: "Advanced", icon: Zap, description: "Developer options and tools" }
  ]

  return (
    <div className="h-[100dvh] bg-background flex overflow-hidden">
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

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="h-full flex flex-col md:flex-row w-full">
        {/* Top Tabs on Mobile, Left Sidebar on Desktop */}
        <div className="md:w-64 md:border-r md:border-border md:bg-muted/30 md:flex md:flex-col border-b border-border md:border-b-0 bg-muted/30">
          <div className="p-4 md:border-b md:border-border border-b-0">
            <h1 className="text-lg font-semibold md:block hidden">Settings</h1>
            <p className="text-sm text-muted-foreground md:block hidden">Configure your preferences</p>
          </div>

          {/* Mobile: Horizontal Tabs */}
          <div className="md:hidden border-b border-border bg-muted/30">
            <TabsList className="grid w-full grid-cols-5 p-1">
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

          {/* Desktop: Vertical Sidebar Tabs */}
          <TabsList className="hidden md:flex flex-col h-full p-2 gap-1 bg-transparent">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="w-full justify-start gap-3 px-3 py-3 text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                  <div className="text-left">
                    <div className="font-medium">{category.label}</div>
                    <div className="text-xs text-muted-foreground">{category.description}</div>
                  </div>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 md:p-6 pb-[env(safe-area-inset-bottom)]">

              {/* General Tab */}
              <TabsContent value="general" className="space-y-8 mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">General Settings</h2>
                    <p className="text-muted-foreground">Configure basic app preferences and behavior</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        App Preferences
                      </CardTitle>
                      <CardDescription>
                        General application settings and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Language</Label>
                          <p className="text-sm text-muted-foreground">Select your preferred language</p>
                        </div>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                            <SelectItem value="it">Italiano</SelectItem>
                            <SelectItem value="pt">Português</SelectItem>
                            <SelectItem value="ru">Русский</SelectItem>
                            <SelectItem value="ja">日本語</SelectItem>
                            <SelectItem value="ko">한국어</SelectItem>
                            <SelectItem value="zh">中文</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-save conversations</Label>
                          <p className="text-sm text-muted-foreground">Automatically save your chat history</p>
                        </div>
                        <Switch checked={autoSave} onCheckedChange={setAutoSave} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Compact mode</Label>
                          <p className="text-sm text-muted-foreground">Use a more compact interface</p>
                        </div>
                        <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Appearance
                      </CardTitle>
                      <CardDescription>
                        Customize the visual appearance of the application
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center p-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3 shadow-lg">
                            <Palette className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Theme controls are available in the top-right corner
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Privacy & Data Tab */}
              <TabsContent value="privacy" className="space-y-8 mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Privacy & Data</h2>
                    <p className="text-muted-foreground">Manage your data and privacy preferences</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Data Privacy
                      </CardTitle>
                      <CardDescription>
                        Control how your data is handled and stored
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Analytics</Label>
                          <p className="text-sm text-muted-foreground">Help improve the app with anonymous usage data</p>
                        </div>
                        <Switch checked={analyticsEnabled} onCheckedChange={setAnalyticsEnabled} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Share usage data</Label>
                          <p className="text-sm text-muted-foreground">Share anonymized conversation patterns</p>
                        </div>
                        <Switch checked={shareUsageData} onCheckedChange={setShareUsageData} />
                      </div>

                      <div className="space-y-2">
                        <Label>Data retention period</Label>
                        <Select value={dataRetention} onValueChange={setDataRetention}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                            <SelectItem value="365">1 year</SelectItem>
                            <SelectItem value="never">Never delete</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          How long to keep your chat history
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Data Management
                      </CardTitle>
                      <CardDescription>
                        Export, import, or clear your data
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <Button variant="outline" onClick={handleExportSettings}>
                          <Download className="w-4 h-4 mr-2" />
                          Export Settings
                        </Button>
                        <Button variant="outline" onClick={() => document.getElementById('import-settings')?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          Import Settings
                        </Button>
                        <input
                          id="import-settings"
                          type="file"
                          accept=".json"
                          onChange={handleImportSettings}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Export your settings as a JSON file or import settings from a previously exported file.
                      </p>

                      <div className="pt-4 border-t">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full sm:w-auto">
                              Clear All Data
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete all your chat history, settings, and preferences.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Clear All Data
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <p className="text-xs text-muted-foreground mt-2">
                          Permanently delete all your data from this device.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Accessibility Tab */}
              <TabsContent value="accessibility" className="space-y-8 mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Accessibility</h2>
                    <p className="text-muted-foreground">Make the app more accessible and easier to use</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Visual Settings
                      </CardTitle>
                      <CardDescription>
                        Adjust visual elements for better accessibility
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>High contrast mode</Label>
                          <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                        </div>
                        <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Reduced motion</Label>
                          <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                        </div>
                        <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                      </div>

                      <div className="space-y-2">
                        <Label>Font size</Label>
                        <Select value={fontSize} onValueChange={setFontSize}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="extra-large">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Adjust the overall font size of the application
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Dyslexic-friendly font</Label>
                          <p className="text-sm text-muted-foreground">Use fonts designed for dyslexia</p>
                        </div>
                        <Switch checked={dyslexicFont} onCheckedChange={setDyslexicFont} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-8 mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Notifications</h2>
                    <p className="text-muted-foreground">Configure when and how you receive notifications</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notification Settings
                      </CardTitle>
                      <CardDescription>
                        Control notification preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Message notifications</Label>
                          <p className="text-sm text-muted-foreground">Get notified when new messages arrive</p>
                        </div>
                        <Switch checked={messageNotifications} onCheckedChange={setMessageNotifications} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Sound effects</Label>
                          <p className="text-sm text-muted-foreground">Play sounds for notifications and interactions</p>
                        </div>
                        <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Desktop notifications</Label>
                          <p className="text-sm text-muted-foreground">Show system notifications</p>
                        </div>
                        <Switch checked={desktopNotifications} onCheckedChange={setDesktopNotifications} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Volume2 className="w-5 h-5" />
                        Audio Settings
                      </CardTitle>
                      <CardDescription>
                        Configure audio preferences for voice interactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Volume2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Voice settings will be available when voice features are implemented
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Advanced Tab */}
              <TabsContent value="advanced" className="space-y-8 mt-0">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Advanced Settings</h2>
                    <p className="text-muted-foreground">Developer options and advanced configuration</p>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Developer Options
                      </CardTitle>
                      <CardDescription>
                        Advanced settings for developers and power users
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Developer mode</Label>
                          <p className="text-sm text-muted-foreground">Enable advanced debugging features</p>
                        </div>
                        <Switch checked={developerMode} onCheckedChange={setDeveloperMode} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Debug logging</Label>
                          <p className="text-sm text-muted-foreground">Log detailed information for troubleshooting</p>
                        </div>
                        <Switch checked={debugLogging} onCheckedChange={setDebugLogging} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RotateCcw className="w-5 h-5" />
                        Reset Options
                      </CardTitle>
                      <CardDescription>
                        Reset settings to their default values
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full sm:w-auto">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset All Settings
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset All Settings</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will reset all your settings to their default values. Your chat history will not be affected.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleResetSettings}>
                              Reset Settings
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <p className="text-xs text-muted-foreground">
                        This will reset all settings to their default values without affecting your chat history.
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
        </div>
      </Tabs>
    </div>
  )
}
