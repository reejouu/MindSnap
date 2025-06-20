import sys
import json
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi
from transcriber import transcribe_audio
from flashcard_agent import generate_flashcards

def get_video_id(url: str) -> str:
    """Extract video ID from YouTube URL."""
    parsed_url = urlparse(url)
    if parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]
    if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            return parse_qs(parsed_url.query)['v'][0]
    raise ValueError("Invalid YouTube URL")

def get_transcript(video_id: str) -> str:
    """Get transcript from YouTube or transcribe if not available."""
    try:
        # First try to get the transcript from YouTube
        try:
            print(f"Attempting to fetch transcript from YouTube API...", file=sys.stderr)
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
            transcript = " ".join([entry['text'] for entry in transcript_list])
            print(f"Successfully fetched transcript from YouTube API", file=sys.stderr)
            return transcript
        except Exception as e:
            print(f"Could not fetch transcript from YouTube API: {str(e)}", file=sys.stderr)
            print("Falling back to audio transcription...", file=sys.stderr)
            # Let the transcriber handle it
            return transcribe_audio(video_id)
    except Exception as e:
        print(f"Error getting transcript: {str(e)}", file=sys.stderr)
        raise

def main():
    try:
        # Read input as JSON: {"youtubeLink": ..., "genre": ...} or just a string
        input_data = sys.stdin.read().strip()
        try:
            data = json.loads(input_data)
            youtube_link = data["youtubeLink"]
            genre = data.get("genre")
        except Exception:
            youtube_link = input_data
            genre = None
        
        if not youtube_link:
            print(json.dumps({"error": "No YouTube link provided"}))
            sys.exit(1)

        # Extract video ID
        video_id = get_video_id(youtube_link)
        print(f"Video ID: {video_id}", file=sys.stderr)

        # Get transcript
        transcript = get_transcript(video_id)
        print(f"Transcript length: {len(transcript)} characters", file=sys.stderr)
        print(f"First 100 characters of transcript: {transcript[:100]}", file=sys.stderr)

        # Generate flashcards from transcript
        flashcards_json = generate_flashcards(transcript, genre)
        
        # Print the JSON response without markdown formatting
        if isinstance(flashcards_json, str):
            # If it's already a string, try to parse it to remove any markdown
            try:
                # Remove any markdown code block markers
                clean_json = flashcards_json.replace("```json", "").replace("```", "").strip()
                # Parse and re-stringify to ensure valid JSON
                parsed = json.loads(clean_json)
                print(json.dumps(parsed))
            except json.JSONDecodeError:
                # If parsing fails, just print the original
                print(flashcards_json)
        else:
            # If it's already a dict, just stringify it
            print(json.dumps(flashcards_json))
            
        sys.exit(0)
        
    except Exception as e:
        error_response = {
            "error": "Failed to generate flashcards",
            "details": str(e)
        }
        print(json.dumps(error_response))
        sys.exit(1)

if __name__ == "__main__":
    main()
