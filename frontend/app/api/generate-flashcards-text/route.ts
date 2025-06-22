import { NextRequest, NextResponse } from "next/server"
import { getApiUrl, API_ENDPOINTS } from '../../../lib/config'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { text, genre } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const normalizedGenre = genre ? genre.toLowerCase().trim() : 'factual'
    console.log("Text length:", text.length)
    console.log("Genre:", normalizedGenre)

    // Make request to hosted Render API
    const apiUrl = getApiUrl(API_ENDPOINTS.FLASHCARDS_TEXT)
    console.log("Making request to:", apiUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        genre: normalizedGenre
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("API request failed:", response.status, errorData)
      return NextResponse.json(
        { 
          error: "Failed to generate flashcards from hosted API",
          details: `HTTP ${response.status}: ${errorData}`
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("API response received:", data)

    if (data.error) {
      return NextResponse.json(
        { error: data.error, details: data.details },
        { status: 500 }
      )
    }

    if (!data.flashcards || !Array.isArray(data.flashcards)) {
      throw new Error("Invalid flashcard data structure from API")
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
