import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let tempFilePath: string | null = null;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const genre = formData.get("genre") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    tempFilePath = join(tmpdir(), `upload_${Date.now()}_${file.name}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempFilePath, buffer);

    const normalizedGenre = genre ? genre.toLowerCase().trim() : null;
    const scriptPath = join(process.cwd(), "..", "agent", "flashcard_agent_image.py");

    const pythonOutput = await new Promise<string>((resolve, reject) => {
      let outputData = "";
      let errorData = "";

      const pythonProcess = spawn("python", [scriptPath]);

      pythonProcess.stdin.write(JSON.stringify({ imagePath: tempFilePath, genre: normalizedGenre }) + "\n");
      pythonProcess.stdin.end();

      pythonProcess.stdout.on("data", (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code === 0) {
          resolve(outputData);
        } else {
          console.error("Python script error:", errorData);
          reject(new Error(`Python script exited with code ${code}: ${errorData}`));
        }
      });

      pythonProcess.on("error", (err) => {
        console.error("Failed to start Python process:", err);
        reject(err);
      });
    });

    try {
      const cleanOutput = pythonOutput.trim();
      const response = JSON.parse(cleanOutput);

      if (response.error) {
        return NextResponse.json(
          { error: response.error, details: response.details },
          { status: 500 }
        );
      }

      if (!response.flashcards || !Array.isArray(response.flashcards)) {
        throw new Error("Invalid flashcard data structure");
      }

      return NextResponse.json(response);
    } catch (error) {
      console.error("Failed to parse Python output:", pythonOutput);
      return NextResponse.json(
        { error: "Invalid response from flashcard generator", details: pythonOutput },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API route error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  } finally {
    if (tempFilePath) {
      try {
        await rm(tempFilePath);
      } catch (cleanupError) {
        console.error("Failed to remove temporary file:", cleanupError);
      }
    }
  }
} 
