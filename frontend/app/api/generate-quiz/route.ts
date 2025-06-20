import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"

export async function POST(request: NextRequest) {
  try {
    const { flashcards } = await request.json()

    if (!flashcards || !Array.isArray(flashcards)) {
      return NextResponse.json(
        { error: "No flashcards provided" },
        { status: 400 }
      )
    }

    // Spawn the Python process with the correct path
    const pythonProcess = spawn("python", ["../agent/quiz_agent.py"], {
      stdio: ["pipe", "pipe", "pipe"]
    })

    // Send the flashcards JSON to the Python script
    pythonProcess.stdin.write(Buffer.from(JSON.stringify({ flashcards }) + "\n", "utf-8"))
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
      return NextResponse.json(quiz)
    } catch (e) {
      console.error("Failed to parse Python output as JSON:", output)
      throw new Error("Invalid JSON response from Python process")
    }
  } catch (error) {
    console.error("Error generating quiz:", error)
    return NextResponse.json(
      { error: "Failed to generate quiz", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 