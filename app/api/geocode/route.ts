import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${process.env.OPENWEATHERMAP_API_KEY}`
    )
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log("Geocoding result:", data)
    
    if (data && data.length > 0) {
      const location = data[0]
      // Return city, state, and country for better accuracy
      return NextResponse.json({ 
        city: location.name,
        state: location.state || "",
        country: location.country || "",
        fullName: location.state ? `${location.name}, ${location.state}` : location.name
      })
    }

    return NextResponse.json({ error: "Location not found" }, { status: 404 })
  } catch (error) {
    console.error("Geocoding error:", error)
    return NextResponse.json({ error: "Failed to geocode location" }, { status: 500 })
  }
}
