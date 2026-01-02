"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Auto-hide splash after animation
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/chat')
    }
  }, [status, router])

  const handleGetStarted = () => {
    router.push("/chat")
  }

  if (!showSplash) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#208299] to-[#1a6b7a] flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20">
            <Globe className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            ARIA
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            AI Assistant with Real-Time Intelligence
          </p>
          <p className="text-white/70 text-sm md:text-base mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            Powered by Advanced Language Models from Daybreak Data
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-[#208299] hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 shadow-xl"
          >
            Get Started
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#208299] to-[#1a6b7a] flex items-center justify-center z-50">
      <div className="text-center animate-in zoom-in-95 duration-700 delay-300">
        <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/20 animate-pulse">
          <Globe className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">Daybreak Data</h1>
        <p className="text-white/90 text-lg md:text-xl mb-2">AI Assistant with Real-Time Intelligence</p>
        <p className="text-white/70 text-sm md:text-base opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-1000">
          Powered by Advanced Language Models & Live Web Search
        </p>
        <div className="mt-8 w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}
