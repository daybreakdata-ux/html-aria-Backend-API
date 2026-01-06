import { generateText } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

// Disable AI SDK warnings
globalThis.AI_SDK_LOG_WARNINGS = false

// Vercel Edge Runtime for faster cold starts and better scalability
export const runtime = "nodejs"
export const maxDuration = 30 // Maximum execution time in seconds

const systemPrompt = `You are Aria, a web search assistant that synthesizes search results.

CRITICAL RULES:
- NEVER include phrases like "Okay, here's", "compiled from", "based on", "according to sources"
- NEVER explain what you're doing or how you found the information
- DO NOT use introductory phrases or meta-commentary
- Start directly with the information requested
- Present information from search results in a clean, organized format
- Use clear headings, bullet points, and structure
- Include all relevant links with [Title](URL) format
- Cite sources inline where information appears
- Be direct and concise`

interface SerpAPIResult {
  title: string
  link: string
  snippet: string
  position: number
}

interface SerpAPIResponse {
  organic_results?: SerpAPIResult[]
  answer_box?: {
    title?: string
    answer?: string
    link?: string
  }
  knowledge_graph?: {
    title?: string
    description?: string
    website?: string
    address?: string
  }
  local_results?: {
    places?: Array<{
      title: string
      address?: string
      latitude?: number
      longitude?: number
      rating?: number
      reviews?: number
      type?: string
      phone?: string
      website?: string
    }>
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const engine = searchParams.get("engine")
    const query = searchParams.get("q")
    const location = searchParams.get("location")

    // Handle google_news engine for news feed
    if (engine === "google_news") {
      const serpApiKey = process.env.SERPAPI_API_KEY

      if (!serpApiKey) {
        console.error("[Search API] SERPAPI_API_KEY is not configured")
        return Response.json(
          { news_results: [], error: "News search service is not configured" },
          { status: 200 }
        )
      }

      try {
        const serpApiUrl = new URL("https://serpapi.com/search")
        serpApiUrl.searchParams.append("engine", "google_news")
        serpApiUrl.searchParams.append("q", query || "latest news")
        serpApiUrl.searchParams.append("api_key", serpApiKey)
        if (location) {
          serpApiUrl.searchParams.append("gl", "us") // Can be enhanced to map location to country code
        }

        console.log("[Search API] Fetching Google News:", serpApiUrl.toString().replace(serpApiKey, "***"))

        const serpApiResponse = await fetch(serpApiUrl.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: 'no-store',
        })

        if (!serpApiResponse.ok) {
          const errorText = await serpApiResponse.text().catch(() => 'Unknown error')
          console.error(`[Search API] SerpAPI error ${serpApiResponse.status}:`, errorText)
          throw new Error(`SerpAPI error: ${serpApiResponse.status}`)
        }

        const data = await serpApiResponse.json()
        
        console.log("[Search API] Google News results count:", data.news_results?.length || 0)

        return Response.json(data, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Content-Type': 'application/json',
          },
        })
      } catch (error: any) {
        console.error("[Search API] News search error:", error)
        return Response.json(
          { news_results: [], error: "Failed to fetch news" },
          { status: 200 }
        )
      }
    }

    // For other GET requests, return method not allowed
    return Response.json(
      { error: "Use POST method for search queries or GET with engine=google_news for news" },
      { status: 405 }
    )
  } catch (error: any) {
    console.error("[Search API] GET error:", error)
    return Response.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query, location } = body

    if (!query || typeof query !== "string" || !query.trim()) {
      return Response.json(
        { error: "Query is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    // Detect if query is about a business or place
    const businessKeywords = [
      'restaurant', 'hotel', 'store', 'shop', 'cafe', 'coffee', 'bar', 'gym',
      'hospital', 'pharmacy', 'bank', 'gas station', 'walmart', 'target',
      'mcdonalds', 'starbucks', 'pizza', 'burger', 'sushi', 'mexican',
      'chinese', 'italian', 'food', 'eat', 'market', 'mall', 'cinema',
      'theater', 'park', 'museum', 'library', 'school', 'church', 'salon',
      'spa', 'dentist', 'doctor', 'vet', 'near me', 'nearby', 'open now',
      'hours', 'address', 'phone', 'directions'
    ]
    
    const isBusinessQuery = businessKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    )
    
    // Auto-append location to business queries if location is provided
    let enhancedQuery = query
    if (isBusinessQuery && location && !query.toLowerCase().includes(location.toLowerCase())) {
      enhancedQuery = `${query} in ${location}`
      console.log(`[Search API] Enhanced query with location: "${enhancedQuery}"`)
    }

    // Check for API keys
    const openrouterKey = process.env.OPENROUTER_API_KEY
    const serpApiKey = process.env.SERPAPI_API_KEY

    if (!openrouterKey) {
      console.error("[Search API] OPENROUTER_API_KEY is not configured")
      return Response.json(
        { error: "Search service is not configured" },
        { status: 503 }
      )
    }

    if (!serpApiKey) {
      console.error("[Search API] SERPAPI_API_KEY is not configured")
      return Response.json(
        { error: "Web search service is not configured" },
        { status: 503 }
      )
    }

    // Perform web search using SerpAPI
    let searchResults = ""
    let rawSearchData = null
    
    try {
      const serpApiUrl = new URL("https://serpapi.com/search")
      serpApiUrl.searchParams.append("engine", "google")
      serpApiUrl.searchParams.append("q", enhancedQuery)
      serpApiUrl.searchParams.append("api_key", serpApiKey)
      serpApiUrl.searchParams.append("num", "10")

      const serpApiResponse = await fetch(serpApiUrl.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!serpApiResponse.ok) {
        const errorText = await serpApiResponse.text().catch(() => 'Unknown error')
        console.error(`[Search API] SerpAPI error ${serpApiResponse.status}:`, errorText)
        throw new Error(`SerpAPI error: ${serpApiResponse.status}`)
      }

      const data: SerpAPIResponse = await serpApiResponse.json()
      rawSearchData = data

      // Format search results for the AI
      searchResults = "WEB SEARCH RESULTS:\n\n"

      // Add answer box if available
      if (data.answer_box) {
        searchResults += "FEATURED ANSWER:\n"
        if (data.answer_box.title) searchResults += `Title: ${data.answer_box.title}\n`
        if (data.answer_box.answer) searchResults += `${data.answer_box.answer}\n`
        if (data.answer_box.link) searchResults += `Source: ${data.answer_box.link}\n`
        searchResults += "\n"
      }

      // Add knowledge graph if available
      if (data.knowledge_graph) {
        searchResults += "KNOWLEDGE PANEL:\n"
        if (data.knowledge_graph.title) searchResults += `Title: ${data.knowledge_graph.title}\n`
        if (data.knowledge_graph.description) searchResults += `Description: ${data.knowledge_graph.description}\n`
        if (data.knowledge_graph.website) searchResults += `Website: ${data.knowledge_graph.website}\n`
        searchResults += "\n"
      }

      // Add organic search results
      if (data.organic_results && data.organic_results.length > 0) {
        searchResults += "SEARCH RESULTS:\n\n"
        data.organic_results.forEach((result, index) => {
          searchResults += `${index + 1}. ${result.title}\n`
          searchResults += `   URL: ${result.link}\n`
          searchResults += `   ${result.snippet}\n\n`
        })
      }

      if (!searchResults || searchResults === "WEB SEARCH RESULTS:\n\n") {
        searchResults = "[No web results available]\n"
      }
    } catch (searchError: any) {
      console.error("[Search API] Web search error:", searchError)
      searchResults = "[Web search unavailable]\n"
    }

    // Initialize OpenRouter provider
    const openrouter = createOpenRouter({
      apiKey: openrouterKey,
    })

    // Generate response using OpenRouter with search results
    const enhancedPrompt = `User Query: ${query}

${searchResults}

Based on the above web search results, provide a comprehensive answer to the user's query. Prioritize information from the search results and include relevant links. Format your response clearly with proper structure.`

    const { text, usage } = await generateText({
      model: openrouter("google/gemma-3-27b-it:free"),
      system: systemPrompt,
      prompt: enhancedPrompt,
    })

    return Response.json(
      {
        query,
        response: text,
        searchResults: rawSearchData,
        usage: usage || undefined,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error: any) {
    console.error("[Search API] Error:", error)

    // Handle specific error cases
    if (error.message?.includes("API key")) {
      return Response.json(
        { error: "Authentication failed. Please check API configuration." },
        { status: 401 }
      )
    }

    if (error.message?.includes("rate limit")) {
      return Response.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    return Response.json(
      {
        error: "An error occurred while processing your search",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
