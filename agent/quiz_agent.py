import os
import json
import sys
from dotenv import load_dotenv
import google.generativeai as genai
import re

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def generate_quiz(flashcards: list) -> dict:
    """Generate quiz questions from flashcards using Gemini."""
    try:
        print("Configuring Gemini API...", file=sys.stderr)
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Prepare the prompt
        prompt = f"""
You are an expert quiz creator. Given the following flashcards, generate a set of 4-6 multiple-choice quiz questions that test understanding of the material. Each question should:
- Be clear and unambiguous
- Have 4 answer options (A, B, C, D)
- Only one correct answer per question
- Cover different aspects of the content
- Avoid copying text verbatim from the flashcards
- Vary the style and difficulty

Return your output in the following JSON format:
{{
  "quiz": [
    {{
      "id": 1,
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_answer": 2
    }},
    ...
  ]
}}

Flashcards:
{json.dumps(flashcards, ensure_ascii=False)}
"""

        print("Generating quiz with Gemini...", file=sys.stderr)
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        print("Received response from Gemini", file=sys.stderr)

        # Try to parse the response as JSON
        try:
            quiz_data = json.loads(response_text)
            if not isinstance(quiz_data, dict) or 'quiz' not in quiz_data:
                raise ValueError("Invalid response format")
            print(f"Successfully generated {len(quiz_data['quiz'])} quiz questions", file=sys.stderr)
            return quiz_data
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract JSON from the text
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    quiz_data = json.loads(json_match.group())
                    if not isinstance(quiz_data, dict) or 'quiz' not in quiz_data:
                        raise ValueError("Invalid response format")
                    print(f"Successfully generated {len(quiz_data['quiz'])} quiz questions", file=sys.stderr)
                    return quiz_data
                except json.JSONDecodeError:
                    raise ValueError("Could not parse JSON from response")
            raise ValueError("No JSON found in response")
    except Exception as e:
        print(f"Error generating quiz: {str(e)}", file=sys.stderr)
        raise

def clean_surrogates(obj):
    if isinstance(obj, str):
        # Remove surrogates
        return obj.encode('utf-8', 'replace').decode('utf-8', 'replace')
    elif isinstance(obj, dict):
        return {clean_surrogates(k): clean_surrogates(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_surrogates(i) for i in obj]
    else:
        return obj

if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        input_data = sys.stdin.read().strip()
        flashcards_json = json.loads(input_data)
        flashcards = flashcards_json["flashcards"] if "flashcards" in flashcards_json else flashcards_json
        print(f"Received {len(flashcards)} flashcards", file=sys.stderr)

        quiz = generate_quiz(flashcards)
        quiz_clean = clean_surrogates(quiz)
        # Always encode with errors="replace" to avoid surrogate errors
        sys.stdout.buffer.write(json.dumps(quiz_clean, ensure_ascii=False).encode("utf-8", errors="replace"))
        sys.stdout.buffer.write(b"\n")
    except Exception as e:
        error_response = {
            "error": "Failed to generate quiz",
            "details": str(e)
        }
        error_response_clean = clean_surrogates(error_response)
        sys.stdout.buffer.write(json.dumps(error_response_clean, ensure_ascii=False).encode("utf-8", errors="replace"))
        sys.stdout.buffer.write(b"\n")
        sys.exit(1)
