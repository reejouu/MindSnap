import os
import json
import sys
import re
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import google.generativeai as genai

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY not found in environment variables.")

# Define genre instructions
GENRE_INSTRUCTIONS = {
    "factual": """Write 4-6 flashcards that focus on direct, concrete facts, dates, names, and specific information.
- Be clear, concise, and objective.
- Avoid speculation or narrative.
- Each card should deliver a standalone fact or data point.""",
    "conceptual": """Write 4-6 flashcards that explain scientific, technical, or theoretical concepts in depth.
- Focus on principles, mechanisms, relationships, and "how/why" explanations.
- Use analogies or diagrams if helpful.
- Cards should help the learner understand the underlying ideas, not just memorize facts.""",
    "genz": """Write 4-6 flashcards in a Gen-Z style:
- Use memes, slang, and pop culture references (but do NOT use emojis).
- Make it funny, relatable, and surprising.
- Each card should have a playful, energetic vibe and spark curiosity.
- Think TikTok, not textbook.
- Do NOT use emojis.""",
    "story": """Write 4-6 flashcards that present the content as a vivid, engaging story or narrative.
- Use storytelling techniques: characters, conflict, suspense, or a journey.
- Each card should feel like a scene or plot point.
- End with a cliffhanger or emotional beat (except the last card, which should conclude the story)."""
}

# Flask App Setup
app = Flask(__name__)

# Flask route
@app.route('/api/flashcards', methods=['POST'])
def flashcards_api():
    data = request.get_json()
    transcript = data.get('transcript', '').strip()
    genre = data.get('genre', '').strip().lower()
    print(f"DEBUG: API called with genre: {genre}", file=sys.stderr)

    try:
        return jsonify(handle_flashcard_request(transcript, genre))
    except Exception as e:
        return jsonify({
            "error": "Failed to generate flashcards",
            "details": str(e)
        }), 500

# Helper to select the correct genre instructions
def get_genre_prompt(genre):
    if genre not in GENRE_INSTRUCTIONS:
        raise ValueError(f"Unknown genre: '{genre}'. Must be one of: {', '.join(GENRE_INSTRUCTIONS.keys())}")
    return GENRE_INSTRUCTIONS[genre]

# Flashcard generator
def generate_flashcards(transcript: str, genre: str) -> dict:
    genre = genre.strip().lower()
    print(f"DEBUG: generate_flashcards called with genre: '{genre}'", file=sys.stderr)

    genre_instructions = get_genre_prompt(genre)

    prompt = f'''
IMPORTANT: You must write the flashcards in the **{genre.upper()}** style ONLY. Do NOT mix with other styles. Follow the instructions for this style exactly.

GENRE INSTRUCTION:
{genre_instructions}

---
Transcript:
{transcript}

---
Return your output in the following JSON format:
{{
  "flashcards": [
    {{
      "id": 1,
      "content": "..."
    }},
    ...
  ]
}}
'''

    print("Configuring Gemini API...", file=sys.stderr)
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    print(f"Generating flashcards with Gemini in '{genre}' mode...", file=sys.stderr)

    response = model.generate_content(prompt)
    response_text = response.text.strip()
    print("Received response from Gemini", file=sys.stderr)

    try:
        flashcards_data = json.loads(response_text)
        if not isinstance(flashcards_data, dict) or 'flashcards' not in flashcards_data:
            raise ValueError("Invalid response format (missing 'flashcards')")
        return flashcards_data
    except json.JSONDecodeError:
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                flashcards_data = json.loads(json_match.group())
                if not isinstance(flashcards_data, dict) or 'flashcards' not in flashcards_data:
                    raise ValueError("Invalid fallback JSON format")
                return flashcards_data
            except json.JSONDecodeError:
                raise ValueError("Failed to parse JSON from matched text.")
        raise ValueError("No valid JSON found in response.")

# Request handler for internal call
def handle_flashcard_request(transcript, genre):
    print(f"DEBUG: handle_flashcard_request received genre: '{genre}'", file=sys.stderr)
    return generate_flashcards(transcript, genre)

# CLI Mode (optional)
if __name__ == "__main__":
    try:
        genre = input("Enter genre (factual/conceptual/genz/story): ").strip().lower()
        transcript = input("Paste transcript: ").strip()
        print(f"DEBUG: CLI genre = {genre}", file=sys.stderr)
        flashcards_json = generate_flashcards(transcript, genre)
        print(json.dumps(flashcards_json, indent=2))
    except Exception as e:
        error_response = {
            "error": "Failed to generate flashcards",
            "details": str(e)
        }
        print(json.dumps(error_response))
        sys.exit(1)
