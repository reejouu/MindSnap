import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { text, genre } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 })
    }

    const normalizedGenre = genre ? genre.toLowerCase().trim() : null
    const scriptPath = path.join(process.cwd(), "..", "agent", "flashcard_agent_text.py")
    console.log("Python script path:", scriptPath)
    console.log("Text length:", text.length)
    console.log("Genre:", normalizedGenre)

    return new Promise((resolve) => {
      let outputData = ""
      let errorData = ""

      const pythonProcess = spawn("python", [scriptPath])

      pythonProcess.stdin.write(JSON.stringify({ text, genre: normalizedGenre }) + "\n")
      pythonProcess.stdin.end()

      pythonProcess.stdout.on("data", (data) => {
        const chunk = data.toString()
        console.log("Python stdout chunk:", chunk)
        outputData += chunk
      })

      pythonProcess.stderr.on("data", (data) => {
        const chunk = data.toString()
        console.error("Python stderr chunk:", chunk)
        errorData += chunk
      })

      pythonProcess.on("close", (code) => {
        console.log("Python process exited with code:", code)
        console.log("Final output data:", outputData)
        console.log("Final error data:", errorData)

        if (code !== 0) {
          console.error("Python script error:", errorData)
          resolve(
            NextResponse.json(
              { error: "Failed to generate flashcards", details: errorData },
              { status: 500 }
            )
          )
          return
        }

        try {
          const cleanOutput = outputData.trim()
          const response = JSON.parse(cleanOutput)

          if (response.error) {
            resolve(
              NextResponse.json(
                { error: response.error, details: response.details },
                { status: 500 }
              )
            )
            return
          }

          if (!response.flashcards || !Array.isArray(response.flashcards)) {
            throw new Error("Invalid flashcard data structure")
          }

          resolve(NextResponse.json(response))
        } catch (error) {
          console.error("Failed to parse Python output:", outputData)
          resolve(
            NextResponse.json(
              { error: "Invalid response from flashcard generator", details: outputData },
              { status: 500 }
            )
          )
        }
      })
    })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
