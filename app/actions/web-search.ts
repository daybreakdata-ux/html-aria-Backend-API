"use server"

interface WebSearchResult {
  title: string
  url: string
  snippet: string
}

export async function performWebSearch(query: string): Promise<WebSearchResult[]> {
  try {
    // Using SerpAPI - users can also use other search APIs like Brave Search, DuckDuckGo, etc.
    const apiKey = process.env.SERPAPI_KEY

    if (!apiKey) {
      console.log("[v0] SERPAPI_KEY not configured, skipping web search")
      return []
    }

    const response = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&num=5`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      console.log("[v0] Web search API error:", response.status)
      return []
    }

    const data = await response.json()

    return (
      data.organic_results?.slice(0, 5).map((result: any) => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet,
      })) || []
    )
  } catch (error) {
    console.log("[v0] Web search failed:", error)
    return []
  }
}
