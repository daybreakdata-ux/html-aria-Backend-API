// Mode configuration - reads from environment variables
// Each mode has its own system prompt and model configured server-side

export interface ModeConfig {
  id: string
  name: string
  description: string
  icon: string
  model?: string
  systemPrompt?: string
  temperature?: number
}

// Get mode configuration from environment variables
export function getModeConfig(modeId: string): {
  systemPrompt: string
  model: string
  temperature: number
} {
  const defaultSystemPrompt = process.env.MODE_DEFAULT_SYSTEM_PROMPT || ""
  const defaultModel = process.env.MODE_DEFAULT_MODEL || "cognitivecomputations/dolphin-mistral-24b-venice-edition:free"
  const defaultTemperature = Number(process.env.MODE_DEFAULT_TEMPERATURE) || 0.7

  switch (modeId) {
    case "default":
      return {
        systemPrompt: process.env.MODE_DEFAULT_SYSTEM_PROMPT || defaultSystemPrompt,
        model: process.env.MODE_DEFAULT_MODEL || defaultModel,
        temperature: Number(process.env.MODE_DEFAULT_TEMPERATURE) || defaultTemperature,
      }
    case "creative":
      return {
        systemPrompt: process.env.MODE_CREATIVE_SYSTEM_PROMPT || defaultSystemPrompt,
        model: process.env.MODE_CREATIVE_MODEL || defaultModel,
        temperature: Number(process.env.MODE_CREATIVE_TEMPERATURE) || 1.2,
      }
    case "precise":
      return {
        systemPrompt: process.env.MODE_PRECISE_SYSTEM_PROMPT || defaultSystemPrompt,
        model: process.env.MODE_PRECISE_MODEL || defaultModel,
        temperature: Number(process.env.MODE_PRECISE_TEMPERATURE) || 0.3,
      }
    case "coder":
      return {
        systemPrompt: process.env.MODE_CODER_SYSTEM_PROMPT || "You are an expert software engineer. Provide clear, concise code solutions with explanations.",
        model: process.env.MODE_CODER_MODEL || defaultModel,
        temperature: Number(process.env.MODE_CODER_TEMPERATURE) || defaultTemperature,
      }
    case "analyst":
      return {
        systemPrompt: process.env.MODE_ANALYST_SYSTEM_PROMPT || "You are a data analyst. Provide detailed analysis with insights and recommendations.",
        model: process.env.MODE_ANALYST_MODEL || defaultModel,
        temperature: Number(process.env.MODE_ANALYST_TEMPERATURE) || defaultTemperature,
      }
    case "voice":
      return {
        systemPrompt: process.env.MODE_VOICE_SYSTEM_PROMPT || "You are a conversational AI assistant. Keep your responses conversational, friendly, and engaging. Respond naturally as if in a spoken conversation, not writing an essay. Keep responses reasonably brief but complete.",
        model: process.env.MODE_VOICE_MODEL || defaultModel,
        temperature: Number(process.env.MODE_VOICE_TEMPERATURE) || 0.8,
      }
    default:
      return {
        systemPrompt: defaultSystemPrompt,
        model: defaultModel,
        temperature: defaultTemperature,
      }
  }
}

