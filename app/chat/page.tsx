"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, Send, Settings, Plus, X, Copy, RotateCw, Globe, Sparkles, Download, Mic, Paperclip, History, Zap, LogOut, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { PermissionsManager } from "@/components/permissions-manager"
import { FileUploadButton } from "@/components/file-upload-button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { performWebSearch } from "@/app/actions/web-search"

// Note: Google API key is now server-side only (GOOGLE_API_KEY in environment variables)

interface Message {
  id: string
  role: "user" | "assistant" | "error" | "system"
  content: string
  timestamp: Date
  webSearchResults?: WebSearchResult[]
  downloadUrl?: string
  downloadFilename?: string
}

interface WebSearchResult {
  title: string
  url: string
  snippet: string
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

interface Mode {
  id: string
  name: string
  description: string
  icon?: string // Made optional since we're removing icons
  model?: string
  systemPrompt?: string
  temperature?: number
}

export default function ChatPage() {
  const router = useRouter()
  const { data: session, status: authStatus } = useSession()

  // Bypass authentication for local development
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true' || process.env.BYPASS_AUTH === 'true'
  const status = bypassAuth ? 'authenticated' : authStatus
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; content: string } | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; city?: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarView, setSidebarView] = useState<"history" | "modes">("history")
  const [selectedMode, setSelectedMode] = useState<string>("default")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState<string>("default")
  const [anonymousMessageCount, setAnonymousMessageCount] = useState<number>(0)
  const [showAuthPrompt, setShowAuthPrompt] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<any>(null)

  // Load anonymous message count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem("aria_anonymous_messages")
    if (savedCount) {
      const count = parseInt(savedCount, 10)
      setAnonymousMessageCount(count)
      if (count >= 4 && status === 'unauthenticated') {
        setShowAuthPrompt(true)
      }
    }
  }, [status])

  // Reset anonymous count when user signs in
  useEffect(() => {
    if (status === 'authenticated') {
      setAnonymousMessageCount(0)
      setShowAuthPrompt(false)
      localStorage.removeItem("aria_anonymous_messages")
    }
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') return

    // Apply UI customization settings
    const chatWidth = localStorage.getItem("aria_chat_width") || "768"
    const lightBrightness = localStorage.getItem("aria_light_brightness") || "100"
    const darkBrightness = localStorage.getItem("aria_dark_brightness") || "100"
    const fontSize = localStorage.getItem("aria_font_size") || "16"

    const root = document.documentElement
    root.style.setProperty("--chat-width", `${chatWidth}px`)
    root.style.setProperty("--light-brightness", `${lightBrightness}%`)
    root.style.setProperty("--dark-brightness", `${darkBrightness}%`)
    root.style.setProperty("--base-font-size", `${fontSize}px`)
    // Note: accent-color and user-message-color are now controlled by theme CSS variables

    // Load selected mode from localStorage
    const savedMode = localStorage.getItem("aria_selected_mode")
    if (savedMode) {
      setSelectedMode(savedMode)
    }

    // Load chats from API
    loadChats()

    // Initialize location if permission granted
    const locationEnabled = localStorage.getItem("aria_location_enabled")
    if (locationEnabled === "true") {
      updateUserLocation()
    }
  }, [status])

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chat/list')
      if (response.ok) {
        const data = await response.json()
        const serverChats: Chat[] = data.chats.map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          messages: [], // Messages will be loaded when chat is selected
          createdAt: new Date(chat.created_at),
        }))

        // Merge server chats with local chats, preferring server data but keeping local messages
        setChats(prevChats => {
          const mergedChats = serverChats.map(serverChat => {
            const localChat = prevChats.find(c => c.id === serverChat.id)
            return localChat ? { ...serverChat, messages: localChat.messages } : serverChat
          })

          // Add any local chats that aren't on the server yet (shouldn't happen with proper sync)
          const localOnlyChats = prevChats.filter(localChat =>
            !serverChats.some(serverChat => serverChat.id === localChat.id)
          )

          return [...mergedChats, ...localOnlyChats]
        })

        if (serverChats.length > 0 && !activeChat) {
          const firstChatId = serverChats[0].id
          setActiveChat(firstChatId)
          // Load messages for the first chat
          loadChatMessages(firstChatId)
        } else if (serverChats.length === 0 && !activeChat) {
          // No chats exist, create a new one automatically
          createNewChat()
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    }
  }

  const loadChatMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/messages?chatId=${chatId}`)
      if (response.ok) {
        const data = await response.json()
        const formattedMessages: Message[] = data.chat.messages.map((msg: any) => ({
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          webSearchResults: msg.webSearchResults,
          downloadUrl: msg.downloadUrl,
          downloadFilename: msg.downloadFilename,
        }))

        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === chatId
              ? { ...chat, messages: formattedMessages, title: data.chat.title }
              : chat
          )
        )
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const updateUserLocation = () => {
    // Check if manual location override is set
    const manualLocation = localStorage.getItem("aria_manual_location")
    if (manualLocation && manualLocation.trim()) {
      setUserLocation({ latitude: 0, longitude: 0, city: manualLocation })
      return
    }

    // Otherwise use geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ latitude, longitude })
          
          // Reverse geocode to get city name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
            const data = await response.json()
            const city = data.address?.city || data.address?.town || data.address?.village
            if (city) {
              setUserLocation({ latitude, longitude, city })
            }
          } catch (error) {
            console.log("Could not get city name")
          }
        },
        (error) => {
          console.log("Location error:", error)
        }
      )
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chats, activeChat])

  // Auto-load messages when activeChat changes
  useEffect(() => {
    if (activeChat && status === 'authenticated') {
      const currentChat = chats.find(c => c.id === activeChat)
      // Only load if chat exists but has no messages loaded yet
      if (currentChat && currentChat.messages.length === 0) {
        loadChatMessages(activeChat)
      }
    }
  }, [activeChat, status])

  // Predefined modes - will be fetched from backend API later
  const modes: Mode[] = [
    {
      id: "default",
      name: "Default",
      description: "Balanced assistant for general tasks",
    },
    {
      id: "creative",
      name: "Creative",
      description: "Enhanced creativity for writing and brainstorming",
      temperature: 1.2,
    },
    {
      id: "precise",
      name: "Precise",
      description: "Focused and deterministic responses",
      temperature: 0.3,
    },
    {
      id: "coder",
      name: "Coder",
      description: "Optimized for programming and technical tasks",
      systemPrompt: "You are an expert software engineer. Provide clear, concise code solutions with explanations.",
    },
    {
      id: "analyst",
      name: "Analyst",
      description: "Data analysis and research focused",
      systemPrompt: "You are a data analyst. Provide detailed analysis with insights and recommendations.",
    },
    {
      id: "voice",
      name: "Voice Chat",
      description: "Conversational AI with voice input and output",
    },
  ]

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId)
    localStorage.setItem("aria_selected_mode", modeId)
    setSidebarOpen(false)
    // Mode settings will be applied when sending messages
  }

  const getActiveMode = () => {
    return modes.find(m => m.id === selectedMode) || modes[0]
  }

  // Available voices for selection
  const voiceOptions = [
    { id: "default", name: "Default", description: "System default voice" },
    { id: "female", name: "Female", description: "Female voice (if available)" },
    { id: "male", name: "Male", description: "Male voice (if available)" },
  ]

  // Text-to-Speech functionality
  const speakText = async (text: string) => {
    if (!text || selectedMode !== "voice") return

    // Check if speech is enabled
    const speechEnabled = localStorage.getItem("aria_speech_enabled")
    if (speechEnabled !== "true") {
      console.log("Text-to-speech not enabled")
      return
    }

    try {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9 // Slightly slower for clarity
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Select voice based on user preference
      const voices = window.speechSynthesis.getVoices()
      let selectedVoiceObj = voices[0] // Default fallback

      if (selectedVoice === "female") {
        selectedVoiceObj = voices.find(voice =>
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('zira') ||
          voice.name.toLowerCase().includes('susan') ||
          voice.name.toLowerCase().includes('karen')
        ) || voices.find(voice => voice.name.toLowerCase().includes('en') && !voice.name.toLowerCase().includes('male')) || voices[0]
      } else if (selectedVoice === "male") {
        selectedVoiceObj = voices.find(voice =>
          voice.name.toLowerCase().includes('male') ||
          voice.name.toLowerCase().includes('alex') ||
          voice.name.toLowerCase().includes('daniel') ||
          voice.name.toLowerCase().includes('fred')
        ) || voices.find(voice => voice.name.toLowerCase().includes('en') && voice.name.toLowerCase().includes('male')) || voices[0]
      }
      // For "default", use voices[0]

      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("Text-to-speech error:", error)
      setIsSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }

  const startVoiceRecording = async () => {
    try {
      // Check for microphone permission first
      const micEnabled = localStorage.getItem("aria_microphone_enabled")
      if (micEnabled !== "true") {
        alert("Please enable microphone permission in the notification first.")
        return
      }

      // Use Web Speech API directly
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser.")
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      let finalTranscript = ""

      recognition.onstart = () => {
        setIsRecording(true)
        finalTranscript = ""
      }

      recognition.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setMessage(transcript)
        finalTranscript = transcript // Store the latest transcript
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
        }
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
        // In voice chat mode, automatically send the message after recording
        if (selectedMode === "voice" && finalTranscript.trim()) {
          setMessage(finalTranscript) // Ensure the message is set
          setTimeout(() => sendMessage(), 100) // Smaller delay
        }
      }

      mediaRecorderRef.current = recognition
      recognition.start()
    } catch (error) {
      console.error("Error starting voice input:", error)
      alert("Could not start voice input. Please enable microphone permissions.")
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      const filesEnabled = localStorage.getItem("aria_files_enabled")
      if (filesEnabled !== "true") {
        alert("Please enable file access permission in the notification first.")
        return
      }

      // Read file content
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setUploadedFile({ name: file.name, content })
        setMessage((prev) => prev + `\n\n[Uploaded file: ${file.name}]`)
      }

      if (file.type.startsWith("text/") || file.type === "application/json") {
        reader.readAsText(file)
      } else if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file)
        setMessage((prev) => prev + `\n\n[Uploaded image: ${file.name}]`)
      } else {
        alert("File uploaded. Note: Binary files may not be processed correctly.")
      }
    } catch (error) {
      console.error("File upload error:", error)
      alert("Failed to upload file. Please try again.")
    }
  }

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Chat',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Don't add to local state immediately - let it be added when first message is sent
        // This prevents empty chats from appearing in history
        setActiveChat(data.chat.id)
        setMessage('') // Clear any existing message
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !activeChat) return

    // Check anonymous message limit
    if (status === 'unauthenticated') {
      if (anonymousMessageCount >= 4) {
        setShowAuthPrompt(true)
        return
      }
    }

    const currentMessage = message.trim()
    setMessage("")

    // Include file content if uploaded
    let uploadedFileData = null
    if (uploadedFile) {
      uploadedFileData = uploadedFile
      setUploadedFile(null) // Clear after sending
    }

    setIsLoading(true)

    // Immediately add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    }

    setChats(prevChats => {
      const existingChat = prevChats.find(chat => chat.id === activeChat)
      if (existingChat) {
        // Update existing chat
        return prevChats.map(chat =>
          chat.id === activeChat
            ? { ...chat, messages: [...chat.messages, userMessage] }
            : chat
        )
      } else {
        // Create new chat in local state (for newly created chats)
        const newChat: Chat = {
          id: activeChat,
          title: 'New Chat',
          messages: [userMessage],
          createdAt: new Date(),
        }
        return [newChat, ...prevChats]
      }
    })

    try {
      // Get current settings
      const contextLength = Number(localStorage.getItem("aria_context_length")) || 15

      // Mode configuration is now handled server-side via environment variables
      // Only send the mode ID, server will apply the correct model and prompt

      // Add location context if available
      let locationContext = ""
      if (userLocation) {
        locationContext = `\n\n[User Location: ${userLocation.city || "Unknown"}, Coordinates: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}]`
      }

      const requestBody = {
        chatId: activeChat,
        message: currentMessage,
        mode: selectedMode,
        contextLength,
        maxTokens: Number(localStorage.getItem("aria_max_tokens")) || 2000,
        topP: Number(localStorage.getItem("aria_top_p")) || 1,
        frequencyPenalty: Number(localStorage.getItem("aria_frequency_penalty")) || 0,
        presencePenalty: Number(localStorage.getItem("aria_presence_penalty")) || 0,
        uploadedFile: uploadedFileData,
        ...(locationContext && { locationContext }), // Only include if location is available
      }

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      // Add AI response to the chat (user message was already added above)
      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat.id === activeChat) {
            const aiMessage: Message = {
              id: data.assistantMessage.id.toString(),
              role: data.assistantMessage.role,
              content: data.assistantMessage.content,
              timestamp: new Date(data.assistantMessage.timestamp),
              webSearchResults: data.assistantMessage.webSearchResults,
            }
            return { ...chat, messages: [...chat.messages, aiMessage] }
          }
          return chat
        })
      )

      // Speak the AI response if in voice chat mode
      if (selectedMode === "voice" && data.assistantMessage?.content) {
        speakText(data.assistantMessage.content)
      }

      // If web search was performed, show the searching animation briefly
      if (data.assistantMessage.webSearchResults) {
        setIsSearching(true)
        setTimeout(() => setIsSearching(false), 1000)
      }

      // Update chat title if this was the first message exchange
      const currentChat = chats.find(c => c.id === activeChat)
      if (currentChat && currentChat.messages.length === 1 && currentChat.title === 'New Chat') {
        const newTitle = currentMessage.length > 50 ? currentMessage.substring(0, 50) + '...' : currentMessage
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === activeChat
              ? { ...chat, title: newTitle }
              : chat
          )
        )
      }

      // Update anonymous message count
      if (status === 'unauthenticated') {
        const newCount = anonymousMessageCount + 1
        setAnonymousMessageCount(newCount)
        localStorage.setItem("aria_anonymous_messages", newCount.toString())

        if (newCount >= 4) {
          setShowAuthPrompt(true)
        }
      }

    } catch (error) {
      console.error("Error sending message:", error)

      // Remove the optimistically added user message and add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "error",
        content: `Failed to send message: ${error instanceof Error ? error.message : "Please check your API key and try again."}`,
        timestamp: new Date(),
      }

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChat
            ? {
                ...chat,
                messages: [
                  ...chat.messages.slice(0, -1), // Remove the last message (user message)
                  errorMessage
                ]
              }
            : chat
        )
      )
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const regenerateMessage = async (messageId: string) => {
    const currentChat = chats.find((c) => c.id === activeChat)
    if (!currentChat) return

    const messageIndex = currentChat.messages.findIndex((m) => m.id === messageId)
    if (messageIndex === -1 || messageIndex === 0) return

    const previousUserMessage = currentChat.messages[messageIndex - 1]
    if (previousUserMessage.role !== "user") return

    // Remove the assistant message and regenerate
    const updatedMessages = currentChat.messages.slice(0, messageIndex)
    const updatedChats = chats.map((chat) => {
      if (chat.id === activeChat) {
        return { ...chat, messages: updatedMessages }
      }
      return chat
    })

    setChats(updatedChats)
    setMessage(previousUserMessage.content)
    await sendMessage()
  }

  const downloadMessage = async (content: string, messageId: string) => {
    try {
      // Check if message already has a download URL
      const currentChat = chats.find((c) => c.id === activeChat)
      const message = currentChat?.messages.find((m) => m.id === messageId)
      
      if (message?.downloadUrl) {
        // File already uploaded, just download it
        window.open(message.downloadUrl, "_blank")
        return
      }

      // Upload the file first
      const response = await fetch("/api/chatbot/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content,
          filename: `aria-response-${Date.now()}.md`,
        }),
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()

      // Update message with download URL for future clicks
      const updatedChats = chats.map((chat) => {
        if (chat.id === activeChat) {
          return {
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === messageId
                ? { ...msg, downloadUrl: data.downloadUrl, downloadFilename: data.filename }
                : msg
            ),
          }
        }
        return chat
      })

      setChats(updatedChats)

      // Trigger download
      window.open(data.downloadUrl, "_blank")
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to prepare download. Please try again.")
    }
  }

  const currentChat = chats.find((c) => c.id === activeChat)

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background dark:bg-gradient-to-br dark:from-zinc-700 dark:to-indigo-600">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl" style={{ background: `linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black))` }}>
            <Globe className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Loading ARIA...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] flex bg-background dark:bg-gradient-to-br dark:from-zinc-700 dark:to-indigo-600 overflow-hidden">
      <PermissionsManager onPermissionsUpdate={(perms) => {
        if (perms.location) {
          updateUserLocation()
        }
      }} />
      
      {/* Left Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 sm:w-72 md:w-64 bg-card/95 backdrop-blur-xl border-r border-border/60 z-50 transition-transform duration-300 flex flex-col max-h-screen overflow-hidden shadow-2xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-accent/5 to-transparent">
          <h2 className="font-semibold text-base" style={{ fontFamily: 'var(--menu-font-family)', fontSize: 'var(--menu-font-size)', color: 'var(--menu-font-color)' }}>
            {status === 'authenticated' ? (sidebarView === "history" ? "Chat History" : "Modes") : "Welcome"}
          </h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSidebarOpen(false)}
            className="h-7 w-7 p-0"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Sidebar Menu Tabs - Only show for authenticated users */}
        {status === 'authenticated' && (
          <div className="flex border-b border-border">
            <button
              onClick={() => setSidebarView("history")}
              className={cn(
                "flex-1 px-4 py-4 sm:py-3 text-sm font-medium transition-colors min-h-[48px] sm:min-h-0",
                sidebarView === "history"
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={{ fontFamily: 'var(--menu-font-family)', fontSize: 'var(--menu-font-size)' }}
            >
              <History className="w-4 h-4 inline mr-2" />
              History
            </button>
            <button
              onClick={() => setSidebarView("modes")}
              className={cn(
                "flex-1 px-4 py-4 sm:py-3 text-sm font-medium transition-colors min-h-[48px] sm:min-h-0",
                sidebarView === "modes"
                  ? "border-b-2 border-accent text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={{ fontFamily: 'var(--menu-font-family)', fontSize: 'var(--menu-font-size)' }}
            >
              <Zap className="w-4 h-4 inline mr-2" />
              Modes
            </button>
          </div>
        )}

        {/* Sidebar Content - Scrollable area that doesn't include footer */}
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            {status === 'authenticated' ? (
              sidebarView === "history" ? (
                <div className="p-2">
                  {chats.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No chat history yet
                    </div>
                  ) : (
                  chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => {
                        setActiveChat(chat.id)
                        loadChatMessages(chat.id)
                        setSidebarOpen(false)
                      }}
                      className={cn(
                        "w-full p-3 sm:p-4 rounded-lg text-left transition-all duration-200 mb-2 group min-h-[50px] sm:min-h-0 shadow-sm hover:shadow-md border border-transparent",
                        activeChat === chat.id
                          ? "bg-accent/20 border-accent/40 shadow-accent/10"
                          : "hover:bg-accent/10 hover:border-accent/20"
                      )}
                      style={{ fontFamily: 'var(--menu-font-family)', fontSize: 'var(--menu-font-size)' }}
                    >
                        <div className="font-medium text-sm truncate group-hover:text-accent transition-colors" style={{ color: 'var(--menu-font-color)' }}>{chat.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5" style={{ color: 'var(--system-font-color)' }}>
                          {chat.messages.length} messages
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleModeSelect(mode.id)}
                      className={cn(
                        "w-full p-4 sm:p-5 rounded-xl text-left transition-all duration-300 border group min-h-[70px] sm:min-h-0 shadow-sm hover:shadow-md",
                        selectedMode === mode.id
                          ? "bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 border-accent/60 shadow-lg shadow-accent/10 transform scale-[1.02]"
                          : "border-border/50 hover:border-accent/40 hover:bg-accent/5 hover:shadow-accent/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-semibold text-sm transition-colors truncate",
                          selectedMode === mode.id ? "text-foreground" : "text-foreground group-hover:text-accent"
                        )} style={{ fontFamily: 'var(--menu-font-family)', fontSize: 'var(--menu-font-size)', color: 'var(--menu-font-color)' }}>
                          {mode.name}
                        </div>
                        <div className={cn(
                          "text-xs mt-0.5 transition-colors leading-tight",
                          selectedMode === mode.id ? "text-foreground/70" : "text-muted-foreground group-hover:text-foreground/70"
                        )} style={{ fontFamily: 'var(--system-font-family)', fontSize: 'var(--system-font-size)', color: 'var(--system-font-color)' }}>
                          {mode.description}
                        </div>
                      </div>
                        {selectedMode === mode.id && (
                          <div className="ml-2 flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              <div className="p-8 sm:p-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-accent/20">
                  <Globe className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-3 text-foreground">Welcome to ARIA</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
                  Try ARIA with {4 - anonymousMessageCount} free messages, then join to continue your conversation.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push('/auth/signup')}
                    size="sm"
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                  <Button
                    onClick={() => router.push('/auth/signin')}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Sidebar Footer - Always visible at bottom */}
          <div className="flex-shrink-0 px-3 py-2 border-t border-border space-y-1 bg-card">
            {status === 'authenticated' ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    router.push("/settings")
                    setSidebarOpen(false)
                  }}
                  className="w-full justify-start h-8 text-sm"
                  style={{ fontFamily: 'var(--system-font-family)', fontSize: 'var(--system-font-size)', color: 'var(--system-font-color)' }}
                >
                  <Settings className="w-3.5 h-3.5 mr-2" />
                  Settings
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full justify-start h-8 text-sm"
                  style={{ fontFamily: 'var(--system-font-family)', fontSize: 'var(--system-font-size)', color: 'var(--system-font-color)' }}
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  <span>Sign Out</span>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-1">sign-out</p>
              </>
            ) : (
              <div className="text-center space-y-2">
                <div className="text-xs text-muted-foreground">
                  Messages used: {anonymousMessageCount}/4
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(anonymousMessageCount / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 h-14 bg-gray-100 border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">ARIA</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={createNewChat}
              className="h-9 w-9 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </Button>

            <div className="h-9 w-9 flex items-center justify-center">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Scrollable Messages Area */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 pb-32">
            <div className="mx-auto space-y-4 sm:space-y-6" style={{ maxWidth: 'var(--chat-width, 800px)' }}>
              {currentChat?.messages.length === 0 && (
              <div className="text-center py-12 sm:py-16">
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: `linear-gradient(to bottom right, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black))` }}>
                  <Globe className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                </div>
                <h2 className="text-xl sm:text-3xl font-bold mb-3 text-balance" style={{ fontFamily: 'var(--chat-font-family)', fontSize: 'var(--chat-font-size)', color: 'var(--chat-font-color)' }}>How can I help you today?</h2>
                <p className="text-muted-foreground text-sm sm:text-base text-pretty px-6 max-w-md mx-auto leading-relaxed" style={{ fontFamily: 'var(--system-font-family)', fontSize: 'var(--system-font-size)', color: 'var(--system-font-color)' }}>
                  Ask me anything - I'll automatically search the web for real-time information when needed
                </p>
              </div>
            )}

            {currentChat?.messages.map((msg) => (
              <div
                key={msg.id}
                className="flex justify-start animate-in slide-in-from-bottom-2 duration-300"
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl sm:rounded-3xl group overflow-hidden relative",
                    msg.role === "user" && "text-white p-4 sm:p-5 break-words ml-auto bg-gradient-to-br from-accent via-accent to-accent/90 shadow-lg shadow-accent/20 border border-accent/20",
                    msg.role === "assistant" && "bg-gray-100 border border-gray-200 p-4 sm:p-5 shadow-lg",
                    msg.role === "error" && "bg-destructive/10 text-destructive p-4 sm:p-5 border border-destructive/30 shadow-lg shadow-destructive/10",
                  )}
                  style={msg.role === "user" ? {
                    background: `linear-gradient(135deg, var(--user-message-color), color-mix(in srgb, var(--user-message-color) 85%, black))`,
                    boxShadow: '0 8px 32px color-mix(in srgb, var(--user-message-color) 40%, transparent), 0 4px 16px color-mix(in srgb, var(--user-message-color) 20%, transparent)'
                  } : undefined}
                >
                  {msg.role === "assistant" ? (
                    <div className="text-sm break-words overflow-hidden text-black" style={{ fontFamily: 'var(--chat-font-family)', fontSize: 'var(--chat-font-size)' }}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "")
                            const inline = !match
                            return inline ? (
                              <code
                                className="bg-accent/15 text-accent-foreground px-2 py-1 rounded-md text-xs sm:text-sm font-mono border border-accent/20"
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <pre className="bg-slate-900 dark:bg-slate-800 text-slate-100 rounded-xl p-4 sm:p-5 overflow-x-auto !mt-3 !mb-3 border border-slate-700 shadow-lg text-xs sm:text-sm max-w-full">
                                <code className="font-mono text-sm leading-relaxed" {...props}>
                                  {children}
                                </code>
                              </pre>
                            )
                          },
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="mb-2 last:mb-0 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-2 last:mb-0 space-y-1">{children}</ol>,
                          h1: ({ children }) => <h1 className="text-lg sm:text-xl font-bold mb-2 mt-4 first:mt-0 break-words">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base sm:text-lg font-bold mb-2 mt-3 first:mt-0 break-words">{children}</h2>,
                          h3: ({ children }) => (
                            <h3 className="text-sm sm:text-base font-bold mb-2 mt-2 first:mt-0 break-words">{children}</h3>
                          ),
                          a: ({ children, href }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline break-words"
                              style={{ color: 'var(--accent-color)' }}
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      {msg.webSearchResults && msg.webSearchResults.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-border/60">
                          <div className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5" />
                            Web Sources
                          </div>
                          <div className="space-y-2">
                            {msg.webSearchResults.map((result, idx) => (
                              <a
                                key={idx}
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs p-3 bg-card/60 backdrop-blur-sm rounded-lg hover:bg-card/80 border border-border/40 hover:border-accent/30 transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <div className="font-medium line-clamp-1 text-foreground" style={{ color: 'var(--accent-color)' }}>{result.title}</div>
                                <div className="text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{result.snippet}</div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ fontFamily: 'var(--chat-font-family)', fontSize: 'var(--chat-font-size)', color: 'var(--chat-font-color)' }}>{msg.content}</div>
                  )}

                  {msg.role === "assistant" && (
                    <div className="flex justify-end mt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                            style={{ fontFamily: 'var(--system-font-family)', fontSize: 'var(--system-font-size)', color: 'var(--system-font-color)' }}
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => copyMessage(msg.content)}>
                            <Copy className="w-3 h-3 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => regenerateMessage(msg.id)}>
                            <RotateCw className="w-3 h-3 mr-2" />
                            Retry
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => downloadMessage(msg.content, msg.id)}
                            title={msg.downloadUrl ? "Download file" : "Generate and download file"}
                          >
                            <Download className="w-3 h-3 mr-2" />
                            Download
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSearching && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 p-4 sm:p-5 rounded-2xl sm:rounded-3xl max-w-[85%] shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full animate-bounce bg-accent shadow-sm" />
                      <div className="w-2.5 h-2.5 rounded-full animate-bounce delay-100 bg-accent shadow-sm" />
                      <div className="w-2.5 h-2.5 rounded-full animate-bounce delay-200 bg-accent shadow-sm" />
                    </div>
                    <span className="text-sm font-medium text-accent-foreground">Searching the web for real-time information...</span>
                  </div>
                </div>
              </div>
            )}

            {isLoading && !isSearching && (
              <div className="flex justify-start">
                <div className="bg-card/60 backdrop-blur-sm border border-border/40 p-4 sm:p-5 rounded-2xl sm:rounded-3xl max-w-[85%] shadow-lg">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full animate-bounce bg-accent shadow-sm" />
                    <div className="w-2.5 h-2.5 rounded-full animate-bounce delay-100 bg-accent shadow-sm" />
                    <div className="w-2.5 h-2.5 rounded-full animate-bounce delay-200 bg-accent shadow-sm" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        </ScrollArea>

        {/* Auth Prompt */}
        {showAuthPrompt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-accent/20">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Join ARIA to Continue</h3>
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                  You've reached the limit of 4 free messages. Create an account to continue chatting with ARIA.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/auth/signup')}
                    className="w-full"
                  >
                    Sign Up
                  </Button>
                  <Button
                    onClick={() => router.push('/auth/signin')}
                    variant="outline"
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </div>
                <Button
                  onClick={() => setShowAuthPrompt(false)}
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-xs text-muted-foreground"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-gray-100 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:pb-[env(safe-area-inset-bottom)] shadow-lg">
          <div className="mx-auto" style={{ maxWidth: 'var(--chat-width, 800px)' }}>
          {uploadedFile && (
            <div className="mb-3 p-3 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-between text-sm shadow-sm backdrop-blur-sm">
              <span className="flex items-center gap-2 text-accent-foreground">
                <Paperclip className="w-4 h-4" />
                <span className="font-medium truncate max-w-[200px] sm:max-w-none">{uploadedFile.name}</span>
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setUploadedFile(null)}
                className="h-6 w-6 p-0 hover:bg-accent/20 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
          {/* Voice Chat Mode */}
          {selectedMode === "voice" && status === 'authenticated' ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent/20 to-accent/10 text-accent rounded-full text-sm font-medium shadow-sm border border-accent/20">
                  🎤 Voice Chat Mode
                </div>
                {isSpeaking && (
                  <div className="mt-3 text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-sm" />
                    <span className="font-medium">AI is speaking...</span>
                  </div>
                )}
              </div>

              {/* Voice Selection */}
              <div className="flex justify-center gap-2">
                {voiceOptions.map((voice) => (
                  <Button
                    key={voice.id}
                    size="sm"
                    variant={selectedVoice === voice.id ? "default" : "outline"}
                    onClick={() => setSelectedVoice(voice.id)}
                    className="text-xs"
                    disabled={isSpeaking}
                  >
                    {voice.name}
                  </Button>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  size="lg"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  disabled={isLoading || isSpeaking}
                  className={cn(
                    "h-16 w-16 rounded-full text-white font-medium",
                    isRecording
                      ? "bg-accent hover:bg-accent/90 animate-pulse"
                      : "bg-accent hover:bg-accent/90"
                  )}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? (
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse mb-1" />
                      <span className="text-xs">Stop</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Mic className="w-6 h-6 mb-1" />
                      <span className="text-xs">Speak</span>
                    </div>
                  )}
                </Button>

                {isSpeaking && (
                  <Button
                    size="lg"
                    onClick={stopSpeaking}
                    className="h-16 w-16 rounded-full bg-accent hover:bg-accent/90 text-white"
                    title="Stop speaking"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-lg">⏹️</span>
                      <span className="text-xs">Stop</span>
                    </div>
                  </Button>
                )}
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Select voice • Tap microphone to speak • AI responds with voice
              </div>
            </div>
          ) : (
            /* Text Chat Mode */
            <div className="flex gap-2 items-end">
              <FileUploadButton
                onFileSelect={handleFileUpload}
                disabled={isLoading || (status === 'unauthenticated' && anonymousMessageCount >= 4)}
              />
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder={
                  status === 'unauthenticated' && anonymousMessageCount >= 4
                    ? "Join ARIA to continue chatting..."
                    : "Ask me anything..."
                }
                className="resize-none min-h-[44px] max-h-[120px] sm:max-h-[200px] rounded-xl sm:rounded-2xl text-sm sm:text-base touch-manipulation"
                rows={1}
                disabled={isLoading || (status === 'unauthenticated' && anonymousMessageCount >= 4)}
              />
              <Button
                size="sm"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={isLoading || (status === 'unauthenticated' && anonymousMessageCount >= 4)}
                className={cn(
                  "h-11 w-11 sm:h-12 sm:w-12 p-0 flex-shrink-0 rounded-xl touch-manipulation",
                  isRecording
                    ? "bg-accent hover:bg-accent/90 animate-pulse text-white"
                    : ""
                )}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                <Mic className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5",
                  isRecording ? "text-white" : ""
                )} />
              </Button>
              <Button
                size="sm"
                onClick={() => sendMessage()}
                disabled={
                  isLoading ||
                  !message.trim() ||
                  (status === 'unauthenticated' && anonymousMessageCount >= 4)
                }
                className="h-11 w-11 sm:h-12 sm:w-12 p-0 flex-shrink-0 rounded-xl touch-manipulation [&:not(:disabled):hover]:opacity-80"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          )}
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2 hidden sm:block">
            {status === 'unauthenticated' ? (
              `Anonymous mode • ${4 - anonymousMessageCount} messages remaining • Join to continue`
            ) : selectedMode === "voice" ? (
              "Voice chat mode • Speak naturally • AI responds with voice"
            ) : (
              "Press Enter to send • Shift + Enter for new line • Upload files • Voice input • Location-aware"
            )}
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}
