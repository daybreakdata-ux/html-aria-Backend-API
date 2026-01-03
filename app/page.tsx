"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    // Auto-hide splash after animation
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)

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
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.3),transparent_58%)]" />
        <div className="absolute -left-1/3 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute -right-1/4 top-20 h-[440px] w-[440px] rounded-full bg-indigo-500/25 blur-3xl" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="relative mb-12">
            <div className="absolute -inset-[72px] rounded-[64px] border border-white/10" />
            <div className="absolute -inset-[104px] rounded-[96px] border border-white/5" />
            <div className="relative flex h-48 w-48 items-center justify-center rounded-[40px] border border-white/20 bg-white/10 backdrop-blur-2xl">
              <div className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-[40px] border-2 border-white/10" />
              <div className="absolute inset-6 animate-[spin_6s_linear_infinite] rounded-[28px] border border-white/5 opacity-70" />
              <Globe className="h-16 w-16 text-white" />
            </div>
          </div>

          <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">ARIA</h1>
          <p className="mt-4 max-w-sm text-lg text-white/80">
            Booting your real-time AI copilot. Perplexity speed with ChatGPT depth.
          </p>
          <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-white/60">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-sky-300" />
            <span>Syncing Live Data</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.28),transparent_60%)]" />
      <div className="absolute -left-1/3 top-1/3 h-[520px] w-[520px] rounded-full bg-sky-500/15 blur-3xl" />
      <div className="absolute -right-1/4 top-0 h-[420px] w-[420px] rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-8 md:px-12">
          <span className="text-lg font-semibold tracking-[0.32em] text-white/80">ARIA</span>
          <Button
            variant="outline"
            className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            onClick={() => router.push("/auth/signin")}
          >
            Sign In
          </Button>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-6 pb-16 md:px-12">
          <div className="grid w-full max-w-6xl items-center gap-16 md:grid-cols-[1.05fr,0.95fr]">
            <div className="flex flex-col items-center space-y-10 text-center md:items-start md:text-left">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] uppercase tracking-[0.4em] text-white/60">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Real-Time Copilot Ready
              </div>
              <div className="space-y-6">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                  Answers like Perplexity. Conversations like ChatGPT.
                </h1>
                <p className="max-w-xl text-lg text-white/70">
                  Ask anything, watch ARIA pull verified sources in real time, remember what matters, and stay private—no throttling, no censorship.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                  Live web + data sync
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                  Persistent personal memory
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                  Privacy-first, no censorship
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="h-14 rounded-full bg-sky-400 px-10 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition-transform hover:scale-[1.02] hover:bg-sky-300"
                >
                  Launch ARIA
                </Button>
                <span className="text-sm text-white/60">Free preview. Sign in to unlock memory across devices.</span>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute -inset-10 rounded-[40px] bg-white/5 blur-3xl" />
              <div className="relative w-full max-w-sm rounded-[34px] border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-transparent p-6 shadow-[0_40px_120px_-40px_rgba(56,189,248,0.45)] backdrop-blur-2xl">
                <div className="flex items-center justify-between text-xs text-white/50">
                  <span>08:45</span>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                    <span className="h-1.5 w-3 rounded-md bg-white/40" />
                    <span className="h-1.5 w-2 rounded-md bg-white/40" />
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="text-sm text-white/60">Live Briefing</p>
                    <p className="mt-2 text-base font-medium text-white">Markets dipping 1.4%. NASA confirms new launch window.</p>
                    <p className="mt-2 text-sm text-white/60">Sources pinned with freshness timestamps.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/30 to-purple-500/30 p-4">
                    <p className="text-sm text-white/70">Memory Lane</p>
                    <p className="mt-2 text-base font-medium text-white">Pick up the "Moonlit Atlas" book you loved last month?</p>
                    <p className="mt-2 text-sm text-white/70">Saved from your bookstore chat on Dec 12.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-white/60">Unfiltered Answer</p>
                    <p className="mt-2 text-base font-medium text-white">How do LLM guardrails work, really?</p>
                    <p className="mt-2 text-sm text-white/60">ARIA: "Here is what the research actually says."</p>
                  </div>
                </div>

                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="mt-8 h-12 w-full rounded-full bg-white/90 text-slate-900 hover:bg-white"
                >
                  Launch ARIA
                </Button>
              </div>
            </div>
          </div>
        </main>

        <footer className="relative mx-auto mb-10 mt-auto w-full max-w-md px-6">
          <div className="flex items-center justify-between rounded-[26px] border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/70 shadow-[0_20px_60px_-30px_rgba(56,189,248,0.6)] backdrop-blur-2xl">
            <button className="flex flex-col items-center gap-1 text-white">
              <span className="h-1.5 w-8 rounded-full bg-sky-400" />
              <span>Chat</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <span>Discover</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <span>Memory</span>
            </button>
            <button className="flex flex-col items-center gap-1 hover:text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
              <span>Profile</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
