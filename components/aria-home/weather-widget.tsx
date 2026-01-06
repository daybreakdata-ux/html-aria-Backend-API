"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Cloud, CloudRain, Sun, Wind, Droplets, Loader2 } from "lucide-react"

interface WeatherData {
  location: string
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  forecast: Array<{
    day: string
    high: number
    low: number
    condition: string
  }>
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWeather()
    
    // Listen for location updates
    const handleLocationUpdate = () => {
      fetchWeather()
    }
    
    window.addEventListener("locationUpdated", handleLocationUpdate)
    return () => window.removeEventListener("locationUpdated", handleLocationUpdate)
  }, [])

  const fetchWeather = async () => {
    try {
      const preferences = localStorage.getItem("userPreferences")
      const location = preferences ? JSON.parse(preferences).location : "San Francisco"

      const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`)
      const data = await response.json()
      setWeather(data)

      if (preferences && JSON.parse(preferences).enableOfflineMode) {
        localStorage.setItem("cachedWeather", JSON.stringify(data))
      }
    } catch (error) {
      console.error("[v0] Failed to fetch weather:", error)

      const cached = localStorage.getItem("cachedWeather")
      if (cached) {
        setWeather(JSON.parse(cached))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase()
    if (lower.includes("rain")) return <CloudRain className="h-8 w-8" />
    if (lower.includes("cloud")) return <Cloud className="h-8 w-8" />
    return <Sun className="h-8 w-8" />
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    )
  }

  if (!weather) return null

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="space-y-4">
        {/* Current Weather */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{weather.location}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-4xl font-bold">{Math.round(weather.temperature)}°</span>
              {getWeatherIcon(weather.condition)}
            </div>
            <p className="text-sm mt-1">{weather.condition}</p>
          </div>

          <div className="space-y-2 text-right text-sm">
            <div className="flex items-center gap-1 justify-end text-muted-foreground">
              <Droplets className="h-4 w-4" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1 justify-end text-muted-foreground">
              <Wind className="h-4 w-4" />
              <span>{weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-border">
          {weather.forecast.map((day, idx) => (
            <div key={idx} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{day.day}</p>
              <div className="flex justify-center mb-1">{getWeatherIcon(day.condition)}</div>
              <p className="text-sm font-medium">
                {Math.round(day.high)}° / {Math.round(day.low)}°
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
