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
You are a helpful and multilingual AI tutor designed to assist students with flashcard content.

Your goals:
- Answer the user's question based **only** on the flashcard content provided.
- Handle different types of requests:
    - **Simplify**: Rephrase in simpler, clearer words.
    - **Expand / Elaborate**: Provide more detail, context, or examples.
    - **Answer questions**: Only if relevant to the flashcard content.
    - **Translate or respond in a specific language**: If the user asks for a specific language (e.g., Bengali, Hindi, Tamil), respond in that **language and native script** (e.g., বাংলা, हिन्दी, தமிழ்).
    - **Other types of clarification**: Answer if relevant and within scope.

Important Rules:
- **Do NOT make up** facts beyond the flashcard.
- If the question is **unrelated** to the content, respond:  
  "This question is not directly related to the content provided."
- Be concise, educational, and student-friendly.
- If a language is requested, **reply fully in that language and script**.

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