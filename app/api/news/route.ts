import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category") || "general"
  const location = searchParams.get("location") || ""

  const apiKey = process.env.NEWS_API_KEY

  if (!apiKey) {
    console.error("NewsAPI key not configured")
    return NextResponse.json(
      {
        articles: [],
        error: "News API not configured",
      },
      { status: 200 }
    )
  }

  try {
    // Determine country code from location (defaulting to US)
    const countryMap: { [key: string]: string } = {
      'united states': 'us',
      'us': 'us',
      'usa': 'us',
      'uk': 'gb',
      'united kingdom': 'gb',
      'canada': 'ca',
      'australia': 'au',
      'india': 'in',
      'germany': 'de',
      'france': 'fr',
      'italy': 'it',
      'spain': 'es',
      'mexico': 'mx',
      'brazil': 'br',
      'japan': 'jp',
      'china': 'cn',
      'south korea': 'kr',
    }
    
    let country = 'us'
    if (location) {
      const locationLower = location.toLowerCase()
      for (const [key, code] of Object.entries(countryMap)) {
        if (locationLower.includes(key)) {
          country = code
          break
        }
      }
    }

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
      {
        headers: {
          "User-Agent": "Aria-Home/1.0",
        },
      }
    )

    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Transform NewsAPI response to our format, limit to 6 articles
    const articles = data.articles?.slice(0, 6).map((article: any, index: number) => ({
      id: `news-${Date.now()}-${index}`,
      title: article.title,
      excerpt: article.description || article.content?.substring(0, 150) + "..." || "",
      imageUrl: article.urlToImage || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800",
      source: article.source.name,
      publishedAt: article.publishedAt,
      url: article.url,
    })) || []

    return NextResponse.json({ articles })
  } catch (error) {
    console.error("News API error:", error)
    
    // Return empty articles array on error
    return NextResponse.json(
      {
        articles: [],
        error: "Failed to fetch news",
      },
      { status: 200 }
    )
  }
}
