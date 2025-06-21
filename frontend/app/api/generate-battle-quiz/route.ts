import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

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

    // Get the path to the Python script
    const scriptPath = path.join(process.cwd(), "..", "agent", "quiz_battle_agent.py")
    
    // Spawn the Python process
    const pythonProcess = spawn("python", [scriptPath], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: process.cwd()
    })

    // Send the request JSON to the Python script
    const requestData = {
      topic,
      difficulty,
      num_questions
    }
    
    pythonProcess.stdin.write(Buffer.from(JSON.stringify(requestData) + "\n", "utf-8"))
    pythonProcess.stdin.end()

    // Collect the output
    let output = ""
    let error = ""

    pythonProcess.stdout.on("data", (data) => {
      const chunk = data.toString("utf-8")
      console.log("Python stdout:", chunk)
      output += chunk
    })

    pythonProcess.stderr.on("data", (data) => {
      const chunk = data.toString("utf-8")
      console.error("Python stderr:", chunk)
      error += chunk
    })

    // Wait for the process to complete
    await new Promise((resolve, reject) => {
      pythonProcess.on("close", (code) => {
        console.log(`Python process exited with code ${code}`)
        if (code === 0) {
          resolve(null)
        } else {
          reject(new Error(`Python process exited with code ${code}. Error: ${error}`))
        }
      })
    })

    if (!output) {
      throw new Error("No output received from Python process")
    }

    // Parse the output as JSON
    try {
      // Find the first occurrence of a JSON object in the output
      const jsonMatch = output.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON object found in output")
      }
      
      const quiz = JSON.parse(jsonMatch[0])
      
      // Validate the response structure
      if (!quiz.quiz || !Array.isArray(quiz.quiz)) {
        throw new Error("Invalid quiz structure in response")
      }
      
      console.log(`Successfully generated ${quiz.quiz.length} battle quiz questions`)
      return NextResponse.json(quiz)
    } catch (e) {
      console.error("Failed to parse Python output as JSON:", output)
      throw new Error("Invalid JSON response from Python process")
    }
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