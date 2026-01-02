"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Menu, Send, Settings, Plus, X, Copy, RotateCw, Globe, Sparkles, Download, Mic, Paperclip, History, Zap, LogOut } from "lucide-react"
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
  icon: string
  model?: string
  systemPrompt?: string
  temperature?: number
}

export default function ChatPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<any>(null)

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return

    // Apply UI customization settings
    const chatWidth = localStorage.getItem("aria_chat_width") || "768"
    const lightBrightness = localStorage.getItem("aria_light_brightness") || "100"
    const darkBrightness = localStorage.getItem("aria_dark_brightness") || "100"
    const fontSize = localStorage.getItem("aria_font_size") || "16"
    const accentColor = localStorage.getItem("aria_accent_color") || "#208299"
    const userMessageColor = localStorage.getItem("aria_user_message_color") || "#208299"

    const root = document.documentElement
    root.style.setProperty("--chat-width", `${chatWidth}px`)
    root.style.setProperty("--light-brightness", `${lightBrightness}%`)
    root.style.setProperty("--dark-brightness", `${darkBrightness}%`)
    root.style.setProperty("--base-font-size", `${fontSize}px`)
    root.style.setProperty("--accent-color", accentColor)
    root.style.setProperty("--user-message-color", userMessageColor)

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
        const formattedChats: Chat[] = data.chats.map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          messages: [], // Messages will be loaded when chat is selected
          createdAt: new Date(chat.created_at),
        }))
        setChats(formattedChats)
        if (formattedChats.length > 0 && !activeChat) {
          const firstChatId = formattedChats[0].id
          setActiveChat(firstChatId)
          // Load messages for the first chat
          loadChatMessages(firstChatId)
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
      icon: "💬",
    },
    {
      id: "creative",
      name: "Creative",
      description: "Enhanced creativity for writing and brainstorming",
      icon: "✨",
      temperature: 1.2,
    },
    {
      id: "precise",
      name: "Precise",
      description: "Focused and deterministic responses",
      icon: "🎯",
      temperature: 0.3,
    },
    {
      id: "coder",
      name: "Coder",
      description: "Optimized for programming and technical tasks",
      icon: "💻",
      systemPrompt: "You are an expert software engineer. Provide clear, concise code solutions with explanations.",
    },
    {
      id: "analyst",
      name: "Analyst",
      description: "Data analysis and research focused",
      icon: "📊",
      systemPrompt: "You are a data analyst. Provide detailed analysis with insights and recommendations.",
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

      recognition.onstart = () => {
        setIsRecording(true)
      }

      recognition.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setMessage(transcript)
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
        const newChat: Chat = {
          id: data.chat.id,
          title: data.chat.title,
          messages: [],
          createdAt: new Date(data.chat.created_at),
        }
        const updatedChats = [newChat, ...chats]
        setChats(updatedChats)
        setActiveChat(newChat.id)
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !activeChat) return

    const currentMessage = message.trim()
    setMessage("")

    // Include file content if uploaded
    let uploadedFileData = null
    if (uploadedFile) {
      uploadedFileData = uploadedFile
      setUploadedFile(null) // Clear after sending
    }

    setIsLoading(true)

    try {
      // Get current settings
      const contextLength = Number(localStorage.getItem("aria_context_length")) || 15

      // Get active mode and apply its settings
      const activeMode = getActiveMode()
      const model = activeMode.model || localStorage.getItem("aria_model") || "cognitivecomputations/dolphin-mistral-24b-venice-edition:free"
      const systemPrompt = activeMode.systemPrompt || localStorage.getItem("aria_system_prompt") || ""
      const temperature = activeMode.temperature !== undefined ? activeMode.temperature : Number(localStorage.getItem("aria_temperature")) || 0.7

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
        model,
        systemPrompt: systemPrompt + locationContext,
        temperature,
        maxTokens: Number(localStorage.getItem("aria_max_tokens")) || 2000,
        topP: Number(localStorage.getItem("aria_top_p")) || 1,
        frequencyPenalty: Number(localStorage.getItem("aria_frequency_penalty")) || 0,
        presencePenalty: Number(localStorage.getItem("aria_presence_penalty")) || 0,
        uploadedFile: uploadedFileData,
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

      // Update the chat with new messages
      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat.id === activeChat) {
            const newMessages = [
              ...chat.messages,
              {
                id: data.userMessage.id.toString(),
                role: data.userMessage.role,
                content: data.userMessage.content,
                timestamp: new Date(data.userMessage.timestamp),
              },
              {
                id: data.assistantMessage.id.toString(),
                role: data.assistantMessage.role,
                content: data.assistantMessage.content,
                timestamp: new Date(data.assistantMessage.timestamp),
                webSearchResults: data.assistantMessage.webSearchResults,
              },
            ]
            return { ...chat, messages: newMessages }
          }
          return chat
        })
      )

      // If web search was performed, show the searching animation briefly
      if (data.assistantMessage.webSearchResults) {
        setIsSearching(true)
        setTimeout(() => setIsSearching(false), 1000)
      }

    } catch (error) {
      console.error("Error sending message:", error)

      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "error",
        content: `Failed to send message: ${error instanceof Error ? error.message : "Please check your API key and try again."}`,
        timestamp: new Date(),
      }

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChat
            ? { ...chat, messages: [...chat.messages, errorMessage] }
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
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: `linear-gradient(to bottom right, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black))` }}>
            <Globe className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[100dvh] flex bg-background overflow-hidden">
      <PermissionsManager onPermissionsUpdate={(perms) => {
        if (perms.location) {
          updateUserLocation()
        }
      }} />
      
      {/* Left Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 transition-transform duration-300 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg">
            {sidebarView === "history" ? "Chat History" : "Modes"}
          </h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Sidebar Menu Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setSidebarView("history")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors",
              sidebarView === "history"
                ? "border-b-2 border-accent text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="w-4 h-4 inline mr-2" />
            History
          </button>
          <button
            onClick={() => setSidebarView("modes")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors",
              sidebarView === "modes"
                ? "border-b-2 border-accent text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Modes
          </button>
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="flex-1">
          {sidebarView === "history" ? (
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
                      "w-full p-3 rounded-lg text-left transition-colors mb-1",
                      activeChat === chat.id
                        ? "bg-accent/50"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="font-medium text-sm truncate">{chat.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {chat.messages.length} messages
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="p-2">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className={cn(
                    "w-full p-4 rounded-lg text-left transition-colors mb-2 border",
                    selectedMode === mode.id
                      ? "bg-accent/20 border-accent"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mode.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{mode.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {mode.description}
                      </div>
                    </div>
                    {selectedMode === mode.id && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-color)' }} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Sidebar Footer with Settings and Sign Out */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="ghost"
            onClick={() => {
              router.push("/settings")
              setSidebarOpen(false)
            }}
            className="w-full justify-start"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Sign Out</span>
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-1">sign-out</p>
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
        {/* Fixed Header */}
        <header className="flex-shrink-0 p-3 sm:p-4 border-b border-border/50 bg-card/95 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 sm:h-10 sm:w-10 p-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(to bottom right, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black))` }}>
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-base sm:text-lg">ARIA</h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                    {getActiveMode().icon} {getActiveMode().name}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                  AI Assistant with Real-Time Web Access
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button size="sm" variant="ghost" onClick={createNewChat} className="h-9 sm:h-10 px-2 sm:px-3">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          </div>
        </header>

        {/* Scrollable Messages Area */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 pb-32">
            <div className="mx-auto space-y-4 sm:space-y-6" style={{ maxWidth: 'var(--chat-width, 800px)' }}>
              {currentChat?.messages.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg" style={{ background: `linear-gradient(to bottom right, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black))` }}>
                  <Globe className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold mb-2 text-balance">How can I help you today?</h2>
                <p className="text-muted-foreground text-xs sm:text-sm text-pretty px-4">
                  Ask me anything - I'll automatically search the web for real-time information when needed
                </p>
              </div>
            )}

            {currentChat?.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2 sm:gap-4 animate-in slide-in-from-bottom-2 duration-300",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-md" style={{ background: `linear-gradient(to bottom right, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black))` }}>
                    <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl sm:rounded-2xl group overflow-hidden",
                    msg.role === "user" && "text-white p-3 sm:p-4 shadow-md break-words",
                    msg.role === "assistant" && "bg-muted/50 p-3 sm:p-4",
                    msg.role === "error" && "bg-destructive/10 text-destructive p-3 sm:p-4 border border-destructive/20",
                  )}
                  style={msg.role === "user" ? { backgroundColor: 'var(--user-message-color)' } : undefined}
                >
                  {msg.role === "assistant" ? (
                    <div className="text-sm break-words overflow-hidden">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "")
                            const inline = !match
                            return inline ? (
                              <code
                                className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono break-all"
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-3 sm:p-4 overflow-x-auto !mt-2 !mb-2 border border-zinc-800 text-xs sm:text-sm max-w-full">
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
                        <div className="mt-4 pt-4 border-t border-border/50">
                          <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Web Sources
                          </div>
                          <div className="space-y-2">
                            {msg.webSearchResults.map((result, idx) => (
                              <a
                                key={idx}
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs p-2 bg-background/50 rounded-lg hover:bg-background/80 transition-colors"
                              >
                                <div className="font-medium line-clamp-1" style={{ color: 'var(--accent-color)' }}>{result.title}</div>
                                <div className="text-muted-foreground line-clamp-1 mt-0.5">{result.snippet}</div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</div>
                  )}

                  {msg.role === "assistant" && (
                    <div className="flex gap-1 mt-3 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyMessage(msg.content)}
                        className="h-7 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => regenerateMessage(msg.id)}
                        className="h-7 px-2 text-xs"
                      >
                        <RotateCw className="w-3 h-3 mr-1" />
                        Retry
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => downloadMessage(msg.content, msg.id)}
                        className="h-7 px-2 text-xs"
                        title={msg.downloadUrl ? "Download file" : "Generate and download file"}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: 'color-mix(in srgb, var(--user-message-color) 20%, transparent)' }}>
                    <span className="text-[10px] sm:text-xs font-semibold" style={{ color: 'var(--user-message-color)' }}>You</span>
                  </div>
                )}
              </div>
            ))}

            {isSearching && (
              <div className="flex justify-start gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: `linear-gradient(to bottom right, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black))` }}>
                  <Globe className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-color)' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ backgroundColor: 'var(--accent-color)' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ backgroundColor: 'var(--accent-color)' }} />
                    </div>
                    Searching the web for real-time information...
                  </div>
                </div>
              </div>
            )}

            {isLoading && !isSearching && (
              <div className="flex justify-start gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: `linear-gradient(to bottom right, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, black))` }}>
                  <Globe className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-muted/50 p-4 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-color)' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce delay-100" style={{ backgroundColor: 'var(--accent-color)' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce delay-200" style={{ backgroundColor: 'var(--accent-color)' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-border/50 bg-card/95 backdrop-blur-xl pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto" style={{ maxWidth: 'var(--chat-width, 800px)' }}>
          {uploadedFile && (
            <div className="mb-2 p-2 bg-muted/50 rounded-lg flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <Paperclip className="w-3 h-3" />
                {uploadedFile.name}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setUploadedFile(null)}
                className="h-5 w-5 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <FileUploadButton onFileSelect={handleFileUpload} disabled={isLoading} />
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
              placeholder="Ask me anything..."
              className="resize-none min-h-[44px] max-h-[120px] sm:max-h-[200px] rounded-xl sm:rounded-2xl text-sm sm:text-base touch-manipulation"
              rows={1}
              disabled={isLoading}
            />
            <Button
              size="sm"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              disabled={isLoading}
              className={cn(
                "h-11 w-11 sm:h-12 sm:w-12 p-0 flex-shrink-0 rounded-xl touch-manipulation",
                isRecording 
                  ? "bg-red-600 hover:bg-red-700 animate-pulse text-white" 
                  : "bg-background hover:bg-muted border-2 border-input text-foreground"
              )}
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              <Mic className={cn(
                "w-4 h-4 sm:w-5 sm:h-5",
                isRecording ? "text-white" : "text-foreground"
              )} />
            </Button>
            <Button
              size="sm"
              onClick={() => sendMessage()}
              disabled={isLoading || !message.trim()}
              className="h-11 w-11 sm:h-12 sm:w-12 p-0 flex-shrink-0 rounded-xl touch-manipulation [&:not(:disabled):hover]:opacity-80"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-2 hidden sm:block">
            Press Enter to send • Shift + Enter for new line • Upload files • Voice input • Location-aware
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}
