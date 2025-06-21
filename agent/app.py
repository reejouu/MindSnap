import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flashcard_agent import handle_flashcard_request
from quiz_agent import generate_quiz
from quiz_battle_agent import generate_battle_quiz
from flashcard_ask import answer_flashcard_question
from flashcard_agent_text import generate_flashcards_from_text
from flashcard_agent_pdf import generate_flashcards_from_text as generate_flashcards_from_pdf
from flashcard_agent_image import generate_flashcards_from_text as generate_flashcards_from_image
from highlighter import main as highlight_pdf

# Load environment variables
load_dotenv()

app = Flask(__name__)

@app.route('/')
def health_check():
    """Health check endpoint for Render"""
    return jsonify({"status": "healthy", "service": "MindSnap Agent API"})

@app.route('/api/flashcards', methods=['POST'])
def flashcards_api():
    """Generate flashcards from transcript"""
    try:
        data = request.get_json()
        transcript = data.get('transcript', '').strip()
        genre = data.get('genre', 'factual').strip().lower()
        
        if not transcript:
            return jsonify({"error": "Transcript is required"}), 400
            
        result = handle_flashcard_request(transcript, genre)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": "Failed to generate flashcards",
            "details": str(e)
        }), 500

@app.route('/api/flashcards/text', methods=['POST'])
def flashcards_text_api():
    """Generate flashcards from text input"""
    try:
        data = request.get_json()
        text = data.get('text', '').strip()
        genre = data.get('genre', 'factual').strip().lower()
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
            
        result = generate_flashcards_from_text(text, genre)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": "Failed to generate flashcards from text",
            "details": str(e)
        }), 500

@app.route('/api/flashcards/pdf', methods=['POST'])
def flashcards_pdf_api():
    """Generate flashcards from PDF file"""
    try:
        data = request.get_json()
        pdf_path = data.get('pdfPath', '').strip()
        genre = data.get('genre', 'factual').strip().lower()
        
        if not pdf_path:
            return jsonify({"error": "PDF path is required"}), 400
            
        result = generate_flashcards_from_pdf(pdf_path, genre)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": "Failed to generate flashcards from PDF",
            "details": str(e)
        }), 500

@app.route('/api/flashcards/image', methods=['POST'])
def flashcards_image_api():
    """Generate flashcards from image file"""
    try:
        data = request.get_json()
        image_path = data.get('imagePath', '').strip()
        genre = data.get('genre', 'factual').strip().lower()
        
        if not image_path:
            return jsonify({"error": "Image path is required"}), 400
            
        result = generate_flashcards_from_image(image_path, genre)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": "Failed to generate flashcards from image",
            "details": str(e)
        }), 500

@app.route('/api/quiz', methods=['POST'])
def quiz_api():
    """Generate quiz from flashcards"""
    try:
        data = request.get_json()
        flashcards = data.get('flashcards', [])
        
        if not flashcards:
            return jsonify({"error": "Flashcards are required"}), 400
            
        result = generate_quiz(flashcards)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": "Failed to generate quiz",
            "details": str(e)
        }), 500

@app.route('/api/battle-quiz', methods=['POST'])
def battle_quiz_api():
    """Generate battle quiz for a topic"""
    try:
        data = request.get_json()
        topic = data.get('topic', '').strip()
        difficulty = data.get('difficulty', 'intermediate')
        num_questions = data.get('num_questions', 5)
        
        if not topic:
            return jsonify({"error": "Topic is required"}), 400
            
        result = generate_battle_quiz(topic, difficulty, num_questions)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "error": "Failed to generate battle quiz",
            "details": str(e)
        }), 500

@app.route('/api/flashcard-ask', methods=['POST'])
def flashcard_ask_api():
    """Answer questions about flashcard content"""
    try:
        data = request.get_json()
        content = data.get('content', '').strip()
        question = data.get('question', '').strip()
        
        if not content or not question:
            return jsonify({"error": "Content and question are required"}), 400
            
        result = answer_flashcard_question(content, question)
        return jsonify({"response": result})
    except Exception as e:
        return jsonify({
            "error": "Failed to answer question",
            "details": str(e)
        }), 500

@app.route('/api/highlight-pdf', methods=['POST'])
def highlight_pdf_api():
    """Highlight important content in PDF"""
    try:
        data = request.get_json()
        pdf_path = data.get('pdfPath', '').strip()
        
        if not pdf_path:
            return jsonify({"error": "PDF path is required"}), 400
            
        # This would need to be adapted to work as an API
        # For now, return a placeholder
        return jsonify({"message": "PDF highlighting endpoint - implementation needed"})
    except Exception as e:
        return jsonify({
            "error": "Failed to highlight PDF",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 