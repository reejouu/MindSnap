import { NextRequest, NextResponse } from "next/server";
import { getApiUrl, API_ENDPOINTS } from '../../../../lib/config';
import { promises as fs } from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  let tempDir: string | null = null;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Create a unique temporary directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "highlight-"));

    const sanitizedFileName = path.basename(file.name);
    const inputFilePath = path.join(tempDir, sanitizedFileName);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputFilePath, fileBuffer);

    // Make request to hosted Render API
    const apiUrl = getApiUrl(API_ENDPOINTS.HIGHLIGHT_PDF);
    console.log("Making request to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfPath: inputFilePath
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API request failed:", response.status, errorData);
      return NextResponse.json(
        { 
          error: "Failed to highlight PDF from hosted API",
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

    // For now, return a placeholder response since the hosted API doesn't support file uploads yet
    return NextResponse.json(
      { 
        message: "PDF highlighting endpoint - file upload support needed in hosted API",
        status: "not_implemented"
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error highlighting PDF:", error);
    return NextResponse.json(
      { 
        error: "Failed to highlight PDF",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  } finally {
    if (tempDir) {
      fs.rm(tempDir, { recursive: true, force: true }).catch(err => {
        console.error(`Failed to remove temporary directory ${tempDir}:`, err);
      });
    }
  }
} 