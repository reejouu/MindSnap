import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { youtubeLink, genre } = await request.json();

    if (!youtubeLink) {
      return NextResponse.json(
        { error: 'YouTube link is required' },
        { status: 400 }
      );
    }

    // Get the absolute path to the Python script in the root directory
    const scriptPath = path.join(process.cwd(), '..', 'agent', 'main.py');
    console.log('Python script path:', scriptPath);
    console.log('Sending YouTube link:', youtubeLink);
    console.log('Genre:', genre);

    // After parsing genre
    const normalizedGenre = genre ? genre.toLowerCase().trim() : null;
    console.log(`Genre received in main.py: ${normalizedGenre}`);

    return new Promise((resolve) => {
      let outputData = '';
      let errorData = '';

      // Spawn Python process
      const pythonProcess = spawn('python', [scriptPath]);

      // Send the YouTube link and genre as JSON to the Python script
      pythonProcess.stdin.write(JSON.stringify({ youtubeLink, genre: normalizedGenre }) + '\n');
      pythonProcess.stdin.end();

      // Collect output data
      pythonProcess.stdout.on('data', (data) => {
        const chunk = data.toString();
        console.log('Python stdout chunk:', chunk);
        outputData += chunk;
      });

      // Collect error data
      pythonProcess.stderr.on('data', (data) => {
        const chunk = data.toString();
        console.error('Python stderr chunk:', chunk);
        errorData += chunk;
      });

      pythonProcess.on('close', (code) => {
        console.log('Python process exited with code:', code);
        console.log('Final output data:', outputData);
        console.log('Final error data:', errorData);

        if (code !== 0) {
          console.error('Python script error:', errorData);
          resolve(
            NextResponse.json(
              { error: 'Failed to generate flashcards', details: errorData },
              { status: 500 }
            )
          );
          return;
        }

        try {
          // Clean the output data
          const cleanOutput = outputData.trim();
          console.log('Cleaned output:', cleanOutput);
          
          // Try to parse the output as JSON
          const response = JSON.parse(cleanOutput);
          
          // Check if it's an error response
          if (response.error) {
            resolve(
              NextResponse.json(
                { error: response.error, details: response.details },
                { status: 500 }
              )
            );
            return;
          }
          
          // Ensure the response has the correct structure
          if (!response.flashcards || !Array.isArray(response.flashcards)) {
            throw new Error('Invalid flashcard data structure');
          }

          resolve(NextResponse.json(response));
        } catch (error) {
          console.error('Failed to parse Python output:', outputData);
          resolve(
            NextResponse.json(
              { error: 'Invalid response from flashcard generator', details: outputData },
              { status: 500 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 