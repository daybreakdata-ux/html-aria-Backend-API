"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Plus, Trash2, MessageSquare, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant" | "error" | "system"
  content: string
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export default function HistoryPage() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    const savedChats = localStorage.getItem("aria_chats")
    if (savedChats) {
      setChats(JSON.parse(savedChats))
    }
  }, [])

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("Delete this conversation?")) {
      const updatedChats = chats.filter((c) => c.id !== chatId)
      setChats(updatedChats)
      localStorage.setItem("aria_chats", JSON.stringify(updatedChats))
    }
  }

  const createNewChat = () => {
    router.push("/chat")
  }

  const openChat = (chatId: string) => {
    router.push("/chat")
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      {/* Floating Buttons */}
      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => router.push("/chat")} 
        className="floating-button top-left h-10 w-10 sm:h-11 sm:w-11 p-0 shadow-lg"
        title="Back to Chat"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      
      <Button 
        size="sm" 
        onClick={createNewChat} 
        className="floating-button top-right-2 px-4 h-10 sm:h-11 text-sm shadow-lg" 
        style={{ backgroundColor: 'var(--accent-color)' }}
        title="New Chat"
      >
        <Plus className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">New</span>
      </Button>
      
      <div className="floating-button top-right">
        <ThemeToggle />
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {chats.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-br from-[#208299] to-[#1a6b7a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg opacity-50">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">No conversations yet</h2>
              <p className="text-muted-foreground text-sm mb-4">Start a new chat to get started</p>
              <Button onClick={createNewChat} className="bg-[#208299] hover:bg-[#1a6b7a]">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => openChat(chat.id)}
                className="group bg-card border border-border/50 rounded-xl p-4 hover:border-[#208299]/50 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base mb-2 line-clamp-2">{chat.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {chat.messages.length} {chat.messages.length === 1 ? "message" : "messages"}
                      </div>
                      <div>
                        {new Date(chat.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    {chat.messages.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {chat.messages[chat.messages.length - 1].content}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
