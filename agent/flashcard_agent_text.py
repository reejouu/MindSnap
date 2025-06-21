# generate_flashcards_from_text.py

import os
import json
import sys
import re
from dotenv import load_dotenv
import google.generativeai as genai

# Load API key from .env
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

GENRE_INSTRUCTIONS = {
    "factual": """Write 4-6 flashcards that focus on direct, concrete facts, dates, names, and specific information.
- Be clear, concise, and objective.
- Avoid speculation or narrative.
- Each card should deliver a standalone fact or data point.""",
    "conceptual": """Write 4-6 flashcards that explain scientific, technical, or theoretical concepts in depth.
- Focus on principles, mechanisms, relationships, and "how/why" explanations.
-Do NOT use bold text or headings (using "**Concept:**" or "**Explanation:**" is not allowed).
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

def get_genre_prompt(genre):
    if genre not in GENRE_INSTRUCTIONS:
        raise ValueError(f"Unknown genre: '{genre}'. Must be one of: {', '.join(GENRE_INSTRUCTIONS.keys())}")
    return GENRE_INSTRUCTIONS[genre]

def filter_conceptual_flashcards(flashcards):
    filtered = []
    for card in flashcards:
        content = card["content"]

        # Remove "**Concept:**" and "**Explanation:**" labels using regex
        content = re.sub(r"\*\*Concept:\*\*\s*", "", content)
        content = re.sub(r"\*\*Explanation:\*\*\s*", "", content)

        # Optional: You can also join everything into one trimmed paragraph
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        cleaned_content = " ".join(lines)

        filtered.append({"id": card["id"], "content": cleaned_content})
    return filtered


def generate_flashcards_from_text(transcript: str, genre: str) -> dict:
    """Generate flashcards from text using Gemini, with genre support."""
    genre = genre.strip().lower()
    genre_instructions = get_genre_prompt(genre)

    print(f"Configuring Gemini API...", file=sys.stderr)
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')

    prompt = f"""
IMPORTANT: You must write the flashcards in the **{genre.upper()}** style ONLY. Do NOT mix with other styles. Follow the instructions for this style exactly.

GENRE INSTRUCTION:
{genre_instructions}

---
Input Text:
{transcript}

---
Return your output in the following JSON format. For each flashcard, you must provide a "title" that is a 2-3 word catchy phrase summarizing the card's content, and the "content" of the flashcard.
{{
  "flashcards": [
    {{
      "id": 1,
      "title": "A Catchy Title",
      "content": "..."
    }},
    ...
  ]
}}
"""

    print(f"Generating flashcards with Gemini in '{genre}' mode...", file=sys.stderr)
    response = model.generate_content(prompt)
    response_text = response.text.strip()
    print("Received response from Gemini", file=sys.stderr)

    try:
        flashcards_data = json.loads(response_text)
        if not isinstance(flashcards_data, dict) or 'flashcards' not in flashcards_data:
            raise ValueError("Invalid response format")
        if genre == "conceptual":
            flashcards_data["flashcards"] = filter_conceptual_flashcards(flashcards_data["flashcards"])
        print(f"Successfully generated {len(flashcards_data['flashcards'])} flashcards", file=sys.stderr)
        return flashcards_data
    except json.JSONDecodeError:
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            try:
                flashcards_data = json.loads(json_match.group())
                if not isinstance(flashcards_data, dict) or 'flashcards' not in flashcards_data:
                    raise ValueError("Invalid response format")
                print(f"Successfully generated {len(flashcards_data['flashcards'])} flashcards", file=sys.stderr)
                return flashcards_data
            except json.JSONDecodeError:
                raise ValueError("Could not parse JSON from response")
        raise ValueError("No JSON found in response")

if __name__ == "__main__":
    try:
        # Read one line from stdin and parse as JSON
        input_data = sys.stdin.readline()
        data = json.loads(input_data)
        text = data.get("text", "").strip()
        genre = data.get("genre", "factual").strip().lower()
        if not text:
            raise ValueError("Input text is required")
        if not genre:
            raise ValueError("Genre is required")
        flashcards = generate_flashcards_from_text(text, genre)
        print(json.dumps(flashcards))
    except Exception as err:
        error_response = {
            "error": "Failed to generate flashcards",
            "details": str(err)
        }
        print(json.dumps(error_response))
        sys.exit(1)
