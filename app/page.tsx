"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sparkles, MessageSquare, Zap, Shield } from "lucide-react"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/chat")
    }
  }, [status, router])

  const handleGetStarted = () => {
    router.push("/chat")
  }

  if (showSplash) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-8 px-6 text-center">
          <div className="relative">
            <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-violet-500/20 blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-sky-400 to-violet-400 shadow-2xl shadow-sky-500/50">
              <Sparkles className="h-12 w-12 animate-pulse text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-6xl font-bold tracking-tight text-transparent">
              ARIA
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-400" style={{ animationDelay: "0ms" }} />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-400" style={{ animationDelay: "150ms" }} />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.1),transparent_50%)]" />
      
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-sky-400">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">ARIA</span>
          </div>
          <Button
            variant="ghost"
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => router.push("/auth/signin")}
          >
            Sign In
          </Button>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
              <Zap className="h-4 w-4" />
              <span>Powered by real-time AI</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl">
              Instant answers,
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                lasting memory
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-white/60 sm:text-xl">
              Experience conversations that feel natural. ARIA combines the speed of modern search with the depth of advanced AI, all while keeping your data private.
            </p>

            <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="h-14 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 px-8 text-base font-semibold text-white shadow-2xl shadow-sky-500/50 transition-all hover:scale-105 hover:shadow-sky-500/70"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Start Chatting
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-full border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/10"
                onClick={() => router.push("/auth/signup")}
              >
                Create Account
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>Privacy first</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-sky-400" />
                <span>Lightning fast</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span>Always learning</span>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                <MessageSquare className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Natural Conversations</h3>
              <p className="text-sm text-white/60">
                Chat naturally and watch ARIA understand context, remember details, and provide thoughtful responses.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-sky-500/30 hover:bg-white/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-500/5">
                <Zap className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Real-Time Knowledge</h3>
              <p className="text-sm text-white/60">
                Get instant answers backed by live web data and verified sources, updated in real time.
              </p>
            </div>

            <div className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-violet-500/30 hover:bg-white/10 sm:col-span-2 lg:col-span-1">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5">
                <Shield className="h-6 w-6 text-violet-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">Your Privacy Matters</h3>
              <p className="text-sm text-white/60">
                Your conversations stay yours. No tracking, no selling data, just pure AI assistance.
              </p>
            </div>
          </div>
        </main>

        <footer className="py-8 text-center text-sm text-white/40">
          <p>© 2026 ARIA. Your intelligent companion.</p>
        </footer>
      </div>
    </div>
  )
}
