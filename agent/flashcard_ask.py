import os
import sys
import json
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def answer_flashcard_question(content: str, question: str) -> str:
    """Use Gemini to answer a user question about a flashcard's content."""
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"""
You are a knowledgeable and student-friendly AI tutor helping users understand flashcard material. 
Your goal is to answer the user's question *based only* on the flashcard content provided.

Instructions:
- If the user asks to **simplify**, rephrase the flashcard content in simpler, clearer terms.
- If the user asks to **expand** or **elaborate**, provide more detail, examples, or background to clarify the concept.
- If the question is **unrelated**, say: "This question is not directly related to the content provided."
- Be concise, accurate, and educational in tone.

Flashcard Content:
\"\"\"
{content}
\"\"\"

User's Question or Request:
\"\"\"
{question}
\"\"\"

Your Response:
"""

    response = model.generate_content(prompt)
    return response.text.strip()

if __name__ == "__main__":
    try:
        input_data = sys.stdin.read().strip()
        data = json.loads(input_data)
        content = data.get("content", "")
        question = data.get("question", "")
        if not content or not question:
            raise ValueError("Missing content or question")
        answer = answer_flashcard_question(content, question)
        print(json.dumps({"response": answer}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1) 