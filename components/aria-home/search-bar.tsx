"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2, Mic } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchResult } from "@/components/aria-home/search-result"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [isListening, setIsListening] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    try {
      // Get user location from preferences
      const preferences = localStorage.getItem("userPreferences")
      const location = preferences ? JSON.parse(preferences).location : null

      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("[v0] Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleVoiceSearch = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
      }

      recognition.start()
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          type="text"
          placeholder="Search anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-28 h-12 text-base rounded-full bg-card relative z-0"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleVoiceSearch}
          className={`absolute right-20 top-1/2 -translate-y-1/2 rounded-full z-10 ${isListening ? "text-red-500" : ""}`}
          aria-label="Voice search"
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={isSearching || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full z-10"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {result && <SearchResult result={result} onClose={() => setResult(null)} />}
    </div>
  )
}
