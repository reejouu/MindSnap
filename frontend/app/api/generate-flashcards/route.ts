import { NextResponse } from 'next/server';
import { getApiUrl, API_ENDPOINTS } from '../../../lib/config';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { youtubeLink, genre } = await request.json();

    if (!youtubeLink) {
      return NextResponse.json(
        { error: 'YouTube link is required' },
        { status: 400 }
      );
    }

    console.log('Sending YouTube link:', youtubeLink);
    console.log('Genre:', genre);

    // Normalize genre
    const normalizedGenre = genre ? genre.toLowerCase().trim() : 'factual';
    console.log(`Genre normalized: ${normalizedGenre}`);

    // Make request to hosted Render API
    const apiUrl = getApiUrl(API_ENDPOINTS.FLASHCARDS);
    console.log('Making request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: youtubeLink, // The API expects transcript, but we're sending YouTube link
        genre: normalizedGenre
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('API request failed:', response.status, errorData);
      return NextResponse.json(
        { 
          error: 'Failed to generate flashcards from hosted API',
          details: `HTTP ${response.status}: ${errorData}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API response received:', data);

    // Check if it's an error response
    if (data.error) {
      return NextResponse.json(
        { error: data.error, details: data.details },
        { status: 500 }
      );
    }

    // Ensure the response has the correct structure
    if (!data.flashcards || !Array.isArray(data.flashcards)) {
      throw new Error('Invalid flashcard data structure from API');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}