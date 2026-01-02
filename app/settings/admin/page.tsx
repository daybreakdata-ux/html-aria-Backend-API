"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Save, Lock } from "lucide-react"

const defaultSettings = {
  model: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  secondaryModel: "gemma-2.5-flash",
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
  contextLength: 15,
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [model, setModel] = useState(defaultSettings.model)
  const [secondaryModel, setSecondaryModel] = useState(defaultSettings.secondaryModel)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2000)
  const [topP, setTopP] = useState(1)
  const [frequencyPenalty, setFrequencyPenalty] = useState(0)
  const [presencePenalty, setPresencePenalty] = useState(0)
  const [contextLength, setContextLength] = useState(15)

  useEffect(() => {
    // Check if user is authorized (came from settings page with correct token)
    const token = sessionStorage.getItem("aria_admin_token")
    if (token === "daybreak_admin_access") {
      setIsAuthorized(true)
      loadSettings()
    } else {
      router.push("/settings")
    }
  }, [router])

  const loadSettings = () => {
    // Load settings from localStorage
    setModel(localStorage.getItem("aria_model") || defaultSettings.model)
    setSecondaryModel(localStorage.getItem("aria_secondary_model") || defaultSettings.secondaryModel)
    setTemperature(Number(localStorage.getItem("aria_temperature")) || defaultSettings.temperature)
    setMaxTokens(Number(localStorage.getItem("aria_max_tokens")) || defaultSettings.maxTokens)
    setTopP(Number(localStorage.getItem("aria_top_p")) || defaultSettings.topP)
    setFrequencyPenalty(Number(localStorage.getItem("aria_frequency_penalty")) || defaultSettings.frequencyPenalty)
    setPresencePenalty(Number(localStorage.getItem("aria_presence_penalty")) || defaultSettings.presencePenalty)
    setContextLength(Number(localStorage.getItem("aria_context_length")) || defaultSettings.contextLength)
  }

  const handleSave = () => {
    localStorage.setItem("aria_model", model)
    localStorage.setItem("aria_secondary_model", secondaryModel)
    localStorage.setItem("aria_temperature", temperature.toString())
    localStorage.setItem("aria_max_tokens", maxTokens.toString())
    localStorage.setItem("aria_top_p", topP.toString())
    localStorage.setItem("aria_frequency_penalty", frequencyPenalty.toString())
    localStorage.setItem("aria_presence_penalty", presencePenalty.toString())
    localStorage.setItem("aria_context_length", contextLength.toString())

    // Clear admin token and return to settings
    sessionStorage.removeItem("aria_admin_token")
    router.push("/settings")
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all AI settings to defaults?")) {
      localStorage.removeItem("aria_model")
      localStorage.removeItem("aria_secondary_model")
      localStorage.removeItem("aria_temperature")
      localStorage.removeItem("aria_max_tokens")
      localStorage.removeItem("aria_top_p")
      localStorage.removeItem("aria_frequency_penalty")
      localStorage.removeItem("aria_presence_penalty")
      localStorage.removeItem("aria_context_length")

      setModel(defaultSettings.model)
      setSecondaryModel(defaultSettings.secondaryModel)
      setTemperature(defaultSettings.temperature)
      setMaxTokens(defaultSettings.maxTokens)
      setTopP(defaultSettings.topP)
      setFrequencyPenalty(defaultSettings.frequencyPenalty)
      setPresencePenalty(defaultSettings.presencePenalty)
      setContextLength(defaultSettings.contextLength)
    }
  }

  const handleBack = () => {
    sessionStorage.removeItem("aria_admin_token")
    router.push("/settings")
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <header className="flex-shrink-0 border-b border-border bg-card">
        <div className="max-w-4xl mx-auto p-3 sm:p-3 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={handleBack} className="px-2 sm:px-3">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold">Admin Settings</h1>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button onClick={handleSave} className="px-2 sm:px-3 text-xs sm:text-sm [&:not(:disabled):hover]:opacity-80\" style={{ backgroundColor: 'var(--accent-color)' }}>
              <Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 pb-[env(safe-area-inset-bottom)]">
          {/* Model Parameters */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Model Parameters</h2>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
              <Slider
                id="temperature"
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Lower = more focused/deterministic, Higher = more creative/random
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max Output Tokens</Label>
              <Input
                id="max-tokens"
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                min={100}
                max={8000}
              />
              <p className="text-xs text-muted-foreground">Maximum length of the model's response</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="top-p">Top P: {topP.toFixed(2)}</Label>
              <Slider
                id="top-p"
                value={[topP]}
                onValueChange={(value) => setTopP(value[0])}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Nucleus sampling - controls diversity via probability mass</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency-penalty">Frequency Penalty: {frequencyPenalty.toFixed(1)}</Label>
              <Slider
                id="frequency-penalty"
                value={[frequencyPenalty]}
                onValueChange={(value) => setFrequencyPenalty(value[0])}
                min={-2}
                max={2}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Reduces repetition of tokens that appear frequently</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="presence-penalty">Presence Penalty: {presencePenalty.toFixed(1)}</Label>
              <Slider
                id="presence-penalty"
                value={[presencePenalty]}
                onValueChange={(value) => setPresencePenalty(value[0])}
                min={-2}
                max={2}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Increases likelihood of new topics being introduced</p>
            </div>
          </section>

          {/* Context Settings */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Context Settings</h2>

            <div className="space-y-2">
              <Label htmlFor="context-length">Conversation Context Length</Label>
              <Input
                id="context-length"
                type="number"
                value={contextLength}
                onChange={(e) => setContextLength(Number(e.target.value))}
                min={1}
                max={50}
              />
              <p className="text-xs text-muted-foreground">
                Number of previous messages to include in context (higher = more memory)
              </p>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> System prompts are now configured per mode via Vercel environment variables. 
                Each mode (Default, Creative, Precise, Coder, Analyst) has its own system prompt and model configured server-side.
              </p>
            </div>
          </section>

          {/* Reset Button */}
          <section className="space-y-4">
            <Button variant="outline" onClick={handleReset}>
              Reset AI Settings to Defaults
            </Button>
          </section>
        </div>
      </div>
    </div>
  )
}
