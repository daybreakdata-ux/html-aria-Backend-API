"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sparkles, MessageSquare, Zap, Shield, Mic, Waves, Play } from "lucide-react"

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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.15),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col items-center justify-center space-y-8 px-6 text-center">
          <div className="relative">
            <div className="absolute -inset-4 animate-pulse rounded-full bg-gradient-to-r from-orange-500/20 via-white/20 to-orange-500/20 blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-orange-300 to-orange-500 shadow-2xl shadow-orange-500/50">
              <Sparkles className="h-12 w-12 animate-pulse text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="bg-gradient-to-r from-orange-400 via-white to-orange-400 bg-clip-text text-6xl font-bold tracking-tight text-transparent">
              ARIA
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400" style={{ animationDelay: "0ms" }} />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" style={{ animationDelay: "150ms" }} />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#1f2937_0,_#020617_55%,_#000_100%)]">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-[-120px] h-80 w-80 rounded-full bg-gradient-to-br from-orange-500/50 via-amber-300/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-[-160px] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.45),_transparent_65%)] blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5 sm:px-6 md:px-8 md:py-6">
        {/* Top nav */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-amber-300 to-rose-500 shadow-lg shadow-orange-500/40">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-medium uppercase tracking-[0.2em] text-orange-300/70">ARIA</span>
              <span className="text-xs text-slate-300/70">Voice-first AI companion</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300/70 sm:text-sm">
            <span className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm sm:inline-flex">
              <Zap className="h-3 w-3 text-emerald-300" />
              Live, real-time answers
            </span>
            <Button
              variant="ghost"
              className="h-8 rounded-full px-3 text-xs text-slate-100/80 hover:bg-white/10 hover:text-white sm:h-9 sm:px-4 sm:text-sm"
              onClick={() => router.push("/auth/signin")}
            >
              Sign In
            </Button>
          </div>
        </header>

        {/* Main layout */}
        <main className="mt-6 flex flex-1 flex-col items-stretch gap-10 md:mt-10 md:flex-row md:items-center md:gap-12">
          {/* Left column: copy & CTAs */}
          <section className="flex-1 space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-medium text-amber-200 shadow-[0_0_40px_rgba(251,191,36,0.35)] sm:px-4 sm:text-xs">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-300/20">
                <Mic className="h-2.5 w-2.5" />
              </div>
              Tap once. Talk naturally. Let ARIA handle the rest.
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-50 sm:text-5xl md:text-6xl">
                Voice-first
                <span className="block bg-gradient-to-r from-orange-300 via-amber-100 to-emerald-200 bg-clip-text text-transparent">
                  AI that remembers you.
                </span>
              </h1>
              <p className="max-w-xl text-sm text-slate-300/80 sm:text-base">
                Ask follow-ups, switch topics, and pick up where you left off. ARIA blends streaming voice, chat, and long-term memory into one calm, always-on space.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 px-7 text-sm font-semibold text-slate-950 shadow-[0_18px_60px_rgba(248,181,74,0.7)] transition-transform hover:scale-[1.02] sm:w-auto sm:px-8 sm:text-base"
              >
                <span className="absolute inset-0 h-full w-full bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,0.38),transparent_55%)] opacity-60" />
                <span className="relative flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Start a conversation
                </span>
              </Button>

              <button
                type="button"
                onClick={() => router.push("/auth/signup")}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-500/40 bg-slate-900/60 px-5 text-sm font-medium text-slate-50/90 backdrop-blur-md transition hover:border-slate-200/60 hover:bg-slate-900/90 sm:w-auto sm:px-6"
              >
                <Play className="h-4 w-4 fill-slate-50/80 text-slate-950" />
                Watch 30s demo
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 sm:text-xs">
              <div className="flex items-center gap-1.5 rounded-full bg-slate-900/70 px-3 py-1 backdrop-blur">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Ultra-low latency voice replies</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-emerald-300" />
                <span>End-to-end encrypted sessions</span>
              </div>
              <span className="hidden text-slate-500 sm:inline">•</span>
              <span className="text-slate-400/90">No training on your conversations</span>
            </div>
          </section>

          {/* Right column: phone / conversation card */}
          <section className="relative flex flex-1 items-center justify-center md:justify-end">
            <div className="relative h-[420px] w-[240px] rounded-[2.25rem] border border-white/10 bg-gradient-to-b from-slate-900/80 via-slate-950/95 to-slate-950/90 p-3 shadow-[0_30px_120px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:h-[460px] sm:w-[260px]">
              {/* Phone bezel */}
              <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-900/80" />
              <div className="absolute inset-[3px] rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(248,181,74,0.32),transparent_55%),_radial-gradient(circle_at_bottom,_rgba(56,189,248,0.28),_transparent_60%)]" />

              {/* Inner content */}
              <div className="relative z-10 flex h-full flex-col justify-between rounded-[1.85rem] border border-white/10 bg-gradient-to-b from-slate-900/70 via-slate-950/80 to-slate-950/95 p-4">
                {/* Top pill + avatar */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 self-start rounded-full bg-slate-900/80 px-3 py-1 text-[10px] text-slate-300/90 backdrop-blur">
                    <Waves className="h-3 w-3 text-sky-300" />
                    Listening for your next question…
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-amber-300 to-sky-400 shadow-md shadow-orange-400/60">
                      <Sparkles className="h-4 w-4 text-white" />
                      <div className="absolute inset-0 animate-ping rounded-2xl bg-amber-200/20" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-50">ARIA</span>
                      <span className="text-[10px] text-slate-400">Your voice assistant</span>
                    </div>
                  </div>
                </div>

                {/* Conversation preview */}
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="max-w-[72%] rounded-2xl rounded-br-sm bg-sky-500/90 px-3 py-2 text-[11px] font-medium text-slate-950 shadow-lg shadow-sky-500/40">
                      "Help me plan a weekend in Lisbon around food + art."
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-slate-900/80 px-3 py-2 text-[11px] text-slate-100/90 ring-1 ring-white/5">
                      I7ll build a 2-day route with cafés, galleries, and walking time between each stop. Any dietary preferences?
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[68%] rounded-2xl rounded-br-sm bg-sky-500/90 px-3 py-2 text-[11px] font-medium text-slate-950 shadow-lg shadow-sky-500/40">
                      "Idlike vegetarian spots & sunset views."
                    </div>
                  </div>
                </div>

                {/* Bottom controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-900/80 px-3 py-2 text-[10px] text-slate-300/80 ring-1 ring-white/10">
                    <div className="flex items-center gap-2">
                      <div className="relative h-7 w-7 rounded-full bg-gradient-to-tr from-emerald-300 via-sky-300 to-indigo-400">
                        <div className="absolute inset-[5px] rounded-full bg-slate-950/90" />
                        <div className="absolute inset-[9px] rounded-full bg-gradient-to-br from-emerald-400 via-sky-300 to-cyan-400 opacity-90" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-slate-50">Streaming reply</span>
                        <span className="text-[9px] text-emerald-300/90">0.4s avg. latency</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-medium text-emerald-200">
                      Live
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 rounded-full bg-slate-900/90 px-3 py-1.5 text-[10px] text-slate-400 ring-1 ring-white/10">
                      "Hold to speak" or start typinge
                    </div>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-orange-400 via-amber-300 to-rose-500 text-slate-950 shadow-[0_10px_30px_rgba(248,181,74,0.7)]"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics / trust pill */}
            <div className="pointer-events-none absolute -bottom-6 left-1/2 w-full max-w-xs -translate-x-1/2 md:-right-6 md:bottom-10 md:left-auto md:translate-x-0">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-[10px] text-slate-200 shadow-[0_18px_60px_rgba(0,0,0,0.8)] backdrop-blur">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.16em] text-slate-400">Sessions today</span>
                  <span className="text-sm font-semibold">2,184</span>
                </div>
                <div className="h-10 w-px bg-gradient-to-b from-slate-700/0 via-slate-500/60 to-slate-700/0" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.16em] text-slate-400">Avg satisfaction</span>
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    4.9
                    <span className="text-[10px] text-amber-300">★</span>
                  </span>
                </div>
                <div className="h-10 w-px bg-gradient-to-b from-slate-700/0 via-slate-500/60 to-slate-700/0" />
                <div className="flex flex-col text-right">
                  <span className="text-[9px] uppercase tracking-[0.16em] text-slate-400">Memory window</span>
                  <span className="text-sm font-semibold">90+ days</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-6 flex items-center justify-between gap-3 border-t border-slate-800/60 pt-4 text-[11px] text-slate-500">
          <p> a9 2026 ARIA. Designed for calm, continuous conversations.</p>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] text-slate-400">
              SOC2-ready infrastructure
            </span>
            <span className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] text-slate-400">
              Built for teams & individuals
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
