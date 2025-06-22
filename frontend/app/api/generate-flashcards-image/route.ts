import { NextRequest, NextResponse } from "next/server";
import { getApiUrl, API_ENDPOINTS } from '../../../lib/config';
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

    const normalizedGenre = genre ? genre.toLowerCase().trim() : 'factual';

    // Make request to hosted Render API
    const apiUrl = getApiUrl(API_ENDPOINTS.FLASHCARDS_IMAGE);
    console.log("Making request to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imagePath: tempFilePath,
        genre: normalizedGenre
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API request failed:", response.status, errorData);
      return NextResponse.json(
        { 
          error: "Failed to generate flashcards from hosted API",
          details: `HTTP ${response.status}: ${errorData}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("API response received:", data);

    if (data.error) {
      return NextResponse.json(
        { error: data.error, details: data.details },
        { status: 500 }
      );
    }

    if (!data.flashcards || !Array.isArray(data.flashcards)) {
      throw new Error("Invalid flashcard data structure from API");
    }

    return NextResponse.json(data);
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
