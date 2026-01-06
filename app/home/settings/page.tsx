"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function HomeSettingsPage() {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [newsCategory, setNewsCategory] = useState("general")
  const [enableOfflineMode, setEnableOfflineMode] = useState(false)
  const [useGeolocation, setUseGeolocation] = useState(false)

  useEffect(() => {
    // Load home page preferences from localStorage
    const preferences = localStorage.getItem("userPreferences")
    if (preferences) {
      const parsed = JSON.parse(preferences)
      setLocation(parsed.location || "")
      setNewsCategory(parsed.newsCategory || "general")
      setEnableOfflineMode(parsed.enableOfflineMode || false)
      setUseGeolocation(parsed.useGeolocation || false)
    }
  }, [])

  const handleSave = () => {
    const preferences = {
      location,
      newsCategory,
      enableOfflineMode,
      useGeolocation,
    }
    
    localStorage.setItem("userPreferences", JSON.stringify(preferences))
    
    // Trigger location update event so components refresh
    window.dispatchEvent(new Event("locationUpdated"))
    
    router.push("/")
  }

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          try {
            const response = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`)
            const data = await response.json()
            
            if (data.city) {
              setLocation(data.fullName || data.city)
              setUseGeolocation(true)
            }
          } catch (error) {
            console.error("Failed to reverse geocode:", error)
            alert("Failed to get location. Please try again.")
          }
        },
        (error) => {
          console.error("Location permission denied:", error)
          alert("Location permission denied. Please enter your location manually.")
        }
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  return (
    <div className="h-[100dvh] bg-background dark:bg-gradient-to-r dark:from-slate-500 dark:to-slate-800 flex flex-col overflow-hidden">
      <header className="flex-shrink-0 border-b border-border bg-card">
        <div className="mx-auto max-w-2xl flex h-14 items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Home Settings</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
          <div className="space-y-4 bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">Location Settings</h2>
            
            <div className="space-y-2">
              <Label htmlFor="location">Your Location</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter your city or location"
                  className="flex-1"
                />
                <Button onClick={handleGetCurrentLocation} variant="outline">
                  Detect
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Used for weather and localized news
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Use Geolocation</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically detect your location
                </p>
              </div>
              <Switch
                checked={useGeolocation}
                onCheckedChange={setUseGeolocation}
              />
            </div>
          </div>

          <div className="space-y-4 bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">News Preferences</h2>
            
            <div className="space-y-2">
              <Label htmlFor="newsCategory">News Category</Label>
              <Select value={newsCategory} onValueChange={setNewsCategory}>
                <SelectTrigger id="newsCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 bg-card rounded-lg p-6 border border-border">
            <h2 className="text-xl font-semibold mb-4">Advanced</h2>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Offline Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Cache news articles for offline viewing
                </p>
              </div>
              <Switch
                checked={enableOfflineMode}
                onCheckedChange={setEnableOfflineMode}
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </main>
    </div>
  )
}
