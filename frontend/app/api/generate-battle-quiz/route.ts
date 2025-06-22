import { NextRequest, NextResponse } from "next/server"
import { getApiUrl, API_ENDPOINTS } from '../../../lib/config'

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty = "intermediate", num_questions = 5 } = await request.json()

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required and must be a string" },
        { status: 400 }
      )
    }

    // Validate difficulty
    const validDifficulties = ["easy", "intermediate", "hard"]
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: "Difficulty must be one of: easy, intermediate, hard" },
        { status: 400 }
      )
    }

    // Validate number of questions
    if (typeof num_questions !== "number" || num_questions < 1 || num_questions > 20) {
      return NextResponse.json(
        { error: "Number of questions must be between 1 and 20" },
        { status: 400 }
      )
    }

    console.log(`Generating battle quiz for topic: ${topic}, difficulty: ${difficulty}, questions: ${num_questions}`)

    // Make request to hosted Render API
    const apiUrl = getApiUrl(API_ENDPOINTS.BATTLE_QUIZ)
    console.log("Making request to:", apiUrl)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        difficulty,
        num_questions
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("API request failed:", response.status, errorData)
      return NextResponse.json(
        { 
          error: "Failed to generate battle quiz from hosted API",
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

    // Validate the response structure
    if (!data.quiz || !Array.isArray(data.quiz)) {
      throw new Error("Invalid quiz structure in response")
    }

    console.log(`Successfully generated ${data.quiz.length} battle quiz questions`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating battle quiz:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate battle quiz", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
} 