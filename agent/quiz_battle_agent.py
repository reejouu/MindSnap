import os
import json
import sys
from dotenv import load_dotenv
import google.generativeai as genai
import re

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def generate_battle_quiz(topic: str, difficulty: str = "intermediate", num_questions: int = 5) -> dict:
    """Generate battle quiz questions for a specific topic using Gemini."""
    try:
        print(f"Configuring Gemini API for topic: {topic}", file=sys.stderr)
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Prepare the prompt
        prompt = f"""
You are an expert quiz creator for competitive battle games. Generate {num_questions} multiple-choice quiz questions about the topic: "{topic}".

Requirements:
- Difficulty level: {difficulty}
- Each question should be clear and unambiguous
- Each question should have 4 answer options (A, B, C, D)
- Only one correct answer per question
- Questions should test different aspects of the topic
- Avoid overly simple or extremely difficult questions for {difficulty} level
- Make questions engaging and suitable for competitive play
- Vary the question types (factual, conceptual, analytical)

Return your output in the following JSON format:
{{
  "quiz": [
    {{
      "id": 1,
      "question": "What is the main concept of [topic]?",
      "options": [
        "Option A description",
        "Option B description", 
        "Option C description",
        "Option D description"
      ],
      "correct_answer": 0,
      "explanation": "Brief explanation of why this is correct"
    }},
    ...
  ],
  "topic": "{topic}",
  "difficulty": "{difficulty}",
  "total_questions": {num_questions}
}}

Topic: {topic}
Difficulty: {difficulty}
Number of questions: {num_questions}
"""

        print("Generating battle quiz with Gemini...", file=sys.stderr)
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        print("Received response from Gemini", file=sys.stderr)

        # Try to parse the response as JSON
        try:
            quiz_data = json.loads(response_text)
            if not isinstance(quiz_data, dict) or 'quiz' not in quiz_data:
                raise ValueError("Invalid response format")
            print(f"Successfully generated {len(quiz_data['quiz'])} battle quiz questions", file=sys.stderr)
            return quiz_data
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract JSON from the text
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    quiz_data = json.loads(json_match.group())
                    if not isinstance(quiz_data, dict) or 'quiz' not in quiz_data:
                        raise ValueError("Invalid response format")
                    print(f"Successfully generated {len(quiz_data['quiz'])} battle quiz questions", file=sys.stderr)
                    return quiz_data
                except json.JSONDecodeError:
                    raise ValueError("Could not parse JSON from response")
            raise ValueError("No JSON found in response")
    except Exception as e:
        print(f"Error generating battle quiz: {str(e)}", file=sys.stderr)
        raise

def clean_surrogates(obj):
    """Clean surrogate characters from the response."""
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
        request_json = json.loads(input_data)
        
        # Extract parameters
        topic = request_json.get("topic", "")
        difficulty = request_json.get("difficulty", "intermediate")
        num_questions = request_json.get("num_questions", 5)
        
        if not topic:
            raise ValueError("Topic is required")
        
        print(f"Generating battle quiz for topic: {topic}, difficulty: {difficulty}, questions: {num_questions}", file=sys.stderr)

        quiz = generate_battle_quiz(topic, difficulty, num_questions)
        quiz_clean = clean_surrogates(quiz)
        
        # Always encode with errors="replace" to avoid surrogate errors
        sys.stdout.buffer.write(json.dumps(quiz_clean, ensure_ascii=False).encode("utf-8", errors="replace"))
        sys.stdout.buffer.write(b"\n")
    except Exception as e:
        error_response = {
            "error": "Failed to generate battle quiz",
            "details": str(e)
        }
        error_response_clean = clean_surrogates(error_response)
        sys.stdout.buffer.write(json.dumps(error_response_clean, ensure_ascii=False).encode("utf-8", errors="replace"))
        sys.stdout.buffer.write(b"\n")
        sys.exit(1) 