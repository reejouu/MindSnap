import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import { writeFile } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    console.log("Received file:", file?.name, "Type:", file?.type)

    if (!file) {
      console.error("No file provided in form data")
      return NextResponse.json(
        { error: "No PDF file provided" },
        { status: 400 }
      )
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      console.error("Invalid file type:", file.type)
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      )
    }

    // Create a temporary file path
    const tempFilePath = join(tmpdir(), file.name)
    console.log("Writing file to:", tempFilePath)
    
    // Write the file to the temporary location
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(tempFilePath, buffer)
    console.log("File written successfully")

    console.log("Starting Python process for PDF processing...")
    // Spawn the Python process with the correct path
    const pythonProcess = spawn("python", ["../agent/flashcard_agent_pdf.py"])

    // Send the PDF path to the Python script
    pythonProcess.stdin.write(tempFilePath + "\n")
    pythonProcess.stdin.end()

    // Collect the output
    let output = ""
    let error = ""

    pythonProcess.stdout.on("data", (data) => {
      const chunk = data.toString()
      console.log("Python stdout:", chunk)
      output += chunk
    })

    pythonProcess.stderr.on("data", (data) => {
      const chunk = data.toString()
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
      const flashcards = JSON.parse(jsonMatch[0])
      return NextResponse.json(flashcards)
    } catch (e) {
      console.error("Failed to parse Python output as JSON:", output)
      throw new Error("Invalid JSON response from Python process")
    }
  } catch (error) {
    console.error("Error generating flashcards from PDF:", error)
    return NextResponse.json(
      { error: "Failed to generate flashcards from PDF", details: error.message },
      { status: 500 }
    )
  }
} 