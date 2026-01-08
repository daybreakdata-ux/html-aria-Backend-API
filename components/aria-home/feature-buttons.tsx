"use client"

import { MessageSquare, Brain, Calendar, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function FeatureButtons() {
  const router = useRouter()

  const handleChatClick = () => {
    router.push("/chat")
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      <Button
        variant="outline"
        onClick={handleChatClick}
        className="flex flex-col items-center gap-2 h-auto py-4 px-2 rounded-2xl hover:bg-primary/10 transition-colors bg-transparent border-0 shadow-none"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-medium">Chat</span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col items-center gap-2 h-auto py-4 px-2 rounded-2xl hover:bg-primary/10 transition-colors bg-transparent border-0 shadow-none"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-medium">Deep Research</span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col items-center gap-2 h-auto py-4 px-2 rounded-2xl hover:bg-primary/10 transition-colors bg-transparent border-0 shadow-none"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-medium">Calendar</span>
      </Button>

      <Button
        variant="outline"
        className="flex flex-col items-center gap-2 h-auto py-4 px-2 rounded-2xl hover:bg-primary/10 transition-colors bg-transparent border-0 shadow-none"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <ImageIcon className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs font-medium">Photos</span>
      </Button>
    </div>
  )
}
