"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Shield, 
  Globe, 
  Cloud, 
  Search,
  Newspaper,
  MapPin,
  Brain,
  Lock,
  Smartphone,
  ArrowRight,
  Check,
  Star
} from "lucide-react"

function SpinningGlobe({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[conic-gradient(from_220deg_at_50%_50%,rgba(34,197,94,1),rgba(59,130,246,1),rgba(129,140,248,1),rgba(45,212,191,1),rgba(34,197,94,1))] aria-globe-spin shadow-lg shadow-emerald-500/40 ${className}`}
    >
      <div className="absolute inset-[18%] rounded-full border border-emerald-100/70" />
      <div className="absolute inset-[32%] rounded-full border border-emerald-100/55" />
      <div className="absolute inset-[46%] rounded-full border border-emerald-100/40" />
      <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-emerald-100/70" />
      <div className="absolute left-1/4 top-0 h-full w-px bg-emerald-100/45" />
      <div className="absolute left-3/4 top-0 h-full w-px bg-emerald-100/45" />
      <div className="absolute inset-x-[18%] top-1/4 h-px bg-emerald-100/45" />
      <div className="absolute inset-x-[22%] top-1/2 h-px bg-emerald-100/40" />
      <div className="absolute inset-x-[26%] top-3/4 h-px bg-emerald-100/30" />
      <div className="absolute bottom-1 right-2 h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.6),transparent_55%)]" />
    </div>
  )
}

export default function PromoPage() {
  const router = useRouter()

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced language models provide thoughtful, context-aware responses to any question",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Search,
      title: "Real-Time Web Search",
      description: "Get instant answers backed by live web data from SerpAPI and verified sources",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Newspaper,
      title: "Personalized News Feed",
      description: "Stay informed with curated news articles based on your interests and location",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: MapPin,
      title: "Location-Based Services",
      description: "Weather updates, local news, and location-aware search results",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MessageSquare,
      title: "Natural Conversations",
      description: "Chat naturally with context memory and intelligent follow-ups",
      color: "from-violet-500 to-purple-500"
    },
    {
      icon: Cloud,
      title: "Cloud Synchronization",
      description: "Your conversations sync across devices with secure PostgreSQL storage",
      color: "from-sky-500 to-blue-500"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Secure authentication with NextAuth.js and encrypted data storage",
      color: "from-slate-500 to-gray-500"
    },
    {
      icon: Smartphone,
      title: "Progressive Web App",
      description: "Install as a native app on any device for seamless mobile experience",
      color: "from-teal-500 to-cyan-500"
    }
  ]

  const techStack = [
    { name: "Next.js 16", desc: "React framework with App Router" },
    { name: "TypeScript", desc: "Type-safe development" },
    { name: "Tailwind CSS", desc: "Modern styling" },
    { name: "OpenRouter AI", desc: "Multiple AI models" },
    { name: "SerpAPI", desc: "Web search integration" },
    { name: "NewsAPI", desc: "Real-time news" },
    { name: "PostgreSQL", desc: "Neon database" },
    { name: "NextAuth.js", desc: "Secure authentication" }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_50%)]" />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute -inset-6 animate-pulse rounded-full bg-gradient-to-r from-emerald-500/30 via-sky-500/30 to-violet-500/30 blur-3xl" />
              <SpinningGlobe className="h-24 w-24 relative" />
            </div>
          </div>

          <div className="mb-6">
            <Image 
              src="/splashlogo.svg" 
              alt="ARIA" 
              width={500} 
              height={150}
              className="w-auto h-20 sm:h-28 mx-auto"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm font-medium text-emerald-400 mb-8">
            <Sparkles className="h-4 w-4" />
            <span>Your Personal AI Assistant</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Intelligence meets
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              instant answers
            </span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the next generation of AI assistance. ARIA combines powerful language models, 
            real-time web search, personalized news, and intelligent conversation in one beautifully 
            crafted application.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              onClick={() => router.push('/')}
              size="lg"
              className="h-16 px-10 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 text-white text-lg font-semibold shadow-2xl shadow-sky-500/50 hover:shadow-sky-500/70 hover:scale-105 transition-all"
            >
              <Zap className="mr-2 h-6 w-6" />
              Enter ARIA
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm">Built with care & precision</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold text-white mb-2">8+</div>
              <div className="text-sm text-gray-400">Key Features</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-gray-400">Privacy Focused</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold text-white mb-2">PWA</div>
              <div className="text-sm text-gray-400">Mobile Ready</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="text-3xl font-bold text-white mb-2">Next.js</div>
              <div className="text-sm text-gray-400">Latest Tech</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need for intelligent assistance, all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} p-3 shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Built with Modern Tech
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Leveraging the best tools and frameworks for performance and reliability
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {techStack.map((tech, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-emerald-500/30 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <div className="text-white font-semibold">{tech.name}</div>
                </div>
                <div className="text-sm text-gray-400">{tech.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Capabilities */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                  More than just chat
                </h2>
                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                  ARIA is a complete ecosystem designed for productivity and information discovery.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Smart Homepage</h3>
                      <p className="text-gray-400">Personalized dashboard with search, weather, and curated news feed</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Intelligent Chat</h3>
                      <p className="text-gray-400">Multiple AI models, conversation history, and context-aware responses</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
                      <p className="text-gray-400">Authentication, encrypted storage, and data protection built-in</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-sky-500/20 to-violet-500/20 blur-3xl rounded-3xl" />
                <div className="relative rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm p-8">
                  <div className="space-y-4">
                    <div className="h-3 w-3/4 bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full" />
                    <div className="h-3 w-full bg-gradient-to-r from-sky-400 to-violet-400 rounded-full" />
                    <div className="h-3 w-2/3 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full" />
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500" />
                        <div className="space-y-2">
                          <div className="h-2 w-32 bg-white/20 rounded" />
                          <div className="h-2 w-24 bg-white/10 rounded" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-2 w-full bg-white/10 rounded" />
                        <div className="h-2 w-5/6 bg-white/10 rounded" />
                        <div className="h-2 w-4/6 bg-white/10 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="rounded-3xl border border-white/20 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm p-12 sm:p-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to experience ARIA?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join the future of AI-powered assistance. Beautiful, intelligent, and built for you.
              </p>
              <Button
                onClick={() => router.push('/')}
                size="lg"
                className="h-16 px-12 rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-violet-500 text-white text-lg font-semibold shadow-2xl shadow-sky-500/50 hover:shadow-sky-500/70 hover:scale-105 transition-all"
              >
                <Sparkles className="mr-2 h-6 w-6" />
                Get Started Now
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              <p className="mt-6 text-sm text-gray-400">
                No credit card required • Free to use • Privacy guaranteed
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 text-center border-t border-white/10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <SpinningGlobe className="h-8 w-8" />
            <span className="text-xl font-bold text-white">ARIA</span>
          </div>
          <p className="text-gray-400">
            Your intelligent companion for the digital age
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Built with ❤️ using Next.js, TypeScript, and cutting-edge AI
          </p>
        </footer>
      </div>
    </div>
  )
}
