import { NextRequest, NextResponse } from "next/server"
import { getApiUrl, API_ENDPOINTS } from '../../../lib/config'

export async function POST(request: NextRequest) {
  try {
    const { content, question } = await request.json()
    if (!content || !question) {
      return NextResponse.json({ error: "Missing content or question" }, { status: 400 })
    }

    // Make request to hosted Render API
    const apiUrl = getApiUrl(API_ENDPOINTS.FLASHCARD_ASK)
    console.log("Making request to:", apiUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        question
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("API request failed:", response.status, errorData)
      return NextResponse.json(
        { 
          error: "Failed to get answer from hosted API",
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

    return NextResponse.json({ response: data.response })
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    )
  }
} 