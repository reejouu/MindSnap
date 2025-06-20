import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"

export async function POST(request: NextRequest) {
  try {
    const { content, question } = await request.json()
    if (!content || !question) {
      return NextResponse.json({ error: "Missing content or question" }, { status: 400 })
    }

    const pythonProcess = spawn("python", ["../agent/flashcard_ask.py"])
    pythonProcess.stdin.write(JSON.stringify({ content, question }) + "\n")
    pythonProcess.stdin.end()

    let output = ""
    let error = ""

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString()
    })
    pythonProcess.stderr.on("data", (data) => {
      error += data.toString()
    })

    const exitPromise = new Promise((resolve, reject) => {
      pythonProcess.on("close", (code) => {
        if (code === 0) {
          resolve(null)
        } else {
          reject(new Error(`Python process exited with code ${code}. Error: ${error}`))
        }
      })
    })

    await exitPromise

    if (!output) {
      throw new Error("No output received from Python process")
    }

    // Parse the output as JSON
    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error("No JSON object found in output")
      }
      const data = JSON.parse(jsonMatch[0])
      if (data.error) {
        throw new Error(data.error)
      }
      return NextResponse.json({ response: data.response })
    } catch (e) {
      return NextResponse.json({ error: "Failed to parse AI response", details: output }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
} 