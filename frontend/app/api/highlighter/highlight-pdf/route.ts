import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
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
    const outputPdfPath = path.join(tempDir, `highlighted-${sanitizedFileName}`);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputFilePath, fileBuffer);

    const scriptPath = path.resolve(process.cwd(), "../agent/highlighter.py");
    
    // Check if the script exists
    try {
        await fs.access(scriptPath);
    } catch (error) {
        console.error(`Python script not found at ${scriptPath}`);
        return NextResponse.json({ error: "Internal server error: script not found" }, { status: 500 });
    }

    await new Promise<void>((resolve, reject) => {
      const pythonProcess = spawn("python", [
        scriptPath,
        inputFilePath,
        outputPdfPath,
      ]);

      pythonProcess.stdout.on("data", (data) => {
        console.log(`python stdout: ${data}`);
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`python stderr: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Python script exited with code ${code}`));
        }
      });
    });

    const highlightedPdfBuffer = await fs.readFile(outputPdfPath);

    return new NextResponse(highlightedPdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="highlighted.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error highlighting PDF:", error);
    return NextResponse.json(
      { error: "Failed to highlight PDF" },
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