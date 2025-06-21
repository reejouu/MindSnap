# Battle Quiz System

A comprehensive AI-powered quiz generation system for competitive battle games. This system generates dynamic quiz questions based on user-selected topics and difficulty levels.

## Features

- 🤖 **AI-Generated Questions**: Uses Google's Gemini AI to create engaging quiz questions
- 🎯 **Topic-Based**: Generate quizzes for any programming or technical topic
- 📊 **Multiple Difficulty Levels**: Easy, Intermediate, and Hard difficulty options
- ⚡ **Real-time Generation**: Questions generated on-demand for fresh content
- 🏆 **Competitive Ready**: Designed for battle royale and competitive quiz games
- 📱 **Responsive UI**: Beautiful, modern interface with animations

## Architecture

### Backend Components

1. **Python Agent** (`agent/quiz_battle_agent.py`)
   - Generates quiz questions using Google Gemini AI
   - Handles topic-specific question creation
   - Supports multiple difficulty levels
   - Returns structured JSON responses

2. **API Route** (`frontend/app/api/generate-battle-quiz/route.ts`)
   - RESTful endpoint for quiz generation
   - Validates input parameters
   - Spawns Python agent process
   - Handles error responses

3. **Service Layer** (`frontend/lib/battleQuizService.ts`)
   - TypeScript service for frontend integration
   - Manages quiz state and validation
   - Provides utility methods for quiz interaction

### Frontend Components

1. **BattleQuiz Component** (`frontend/components/battle/BattleQuiz.tsx`)
   - Interactive quiz interface
   - Progress tracking and scoring
   - Answer validation and feedback
   - Navigation between questions

2. **Demo Page** (`frontend/app/battle-quiz-demo/page.tsx`)
   - Showcase of the battle quiz system
   - Configuration interface
   - Results display

## Installation & Setup

### Prerequisites

1. **Python Dependencies**
   ```bash
   cd agent
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   ```bash
   # Create .env file in the agent directory
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   ```

3. **Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Running the System

1. **Start the Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test the Python Agent**
   ```bash
   # Test the agent directly
   python test-battle-quiz.py
   
   # Or test with specific input
   echo '{"topic": "JavaScript", "difficulty": "intermediate", "num_questions": 5}' | python agent/quiz_battle_agent.py
   ```

3. **Access the Demo**
   - Navigate to `http://localhost:3000/battle-quiz-demo`
   - Configure your quiz settings
   - Start the quiz!

## API Usage

### Generate Battle Quiz

**Endpoint:** `POST /api/generate-battle-quiz`

**Request Body:**
```json
{
  "topic": "JavaScript Fundamentals",
  "difficulty": "intermediate",
  "num_questions": 5
}
```

**Response:**
```json
{
  "quiz": [
    {
      "id": 1,
      "question": "What is the difference between let and var in JavaScript?",
      "options": [
        "let is block-scoped, var is function-scoped",
        "let is function-scoped, var is block-scoped",
        "There is no difference",
        "let is deprecated, var is modern"
      ],
      "correct_answer": 0,
      "explanation": "let creates block-scoped variables while var creates function-scoped variables."
    }
  ],
  "topic": "JavaScript Fundamentals",
  "difficulty": "intermediate",
  "total_questions": 5
}
```

### Frontend Integration

```typescript
import { battleQuizService } from '@/lib/battleQuizService'

// Generate a quiz
const quiz = await battleQuizService.generateBattleQuiz({
  topic: "React Hooks",
  difficulty: "intermediate",
  num_questions: 5
})

// Use the quiz
const question = battleQuizService.getQuestion(1)
const isCorrect = battleQuizService.isCorrectAnswer(1, 2)
```

## Component Usage

### Basic BattleQuiz Component

```tsx
import { BattleQuiz } from '@/components/battle/BattleQuiz'

function MyQuizPage() {
  const handleQuizComplete = (score: number, totalQuestions: number) => {
    console.log(`Quiz completed! Score: ${score}/${totalQuestions}`)
  }

  const handleQuizError = (error: string) => {
    console.error('Quiz error:', error)
  }

  return (
    <BattleQuiz
      topic="Python Programming"
      difficulty="intermediate"
      numQuestions={5}
      onQuizComplete={handleQuizComplete}
      onQuizError={handleQuizError}
    />
  )
}
```

## Configuration Options

### Difficulty Levels

- **Easy**: Basic concepts, straightforward questions
- **Intermediate**: Moderate complexity, practical applications
- **Hard**: Advanced topics, complex scenarios

### Question Count

- Minimum: 1 question
- Maximum: 20 questions
- Default: 5 questions

### Supported Topics

The system can generate questions for any programming or technical topic, including:

- Programming Languages (JavaScript, Python, Java, etc.)
- Frameworks (React, Angular, Vue, etc.)
- Databases (SQL, MongoDB, Redis, etc.)
- DevOps (Docker, Kubernetes, CI/CD, etc.)
- Computer Science (Algorithms, Data Structures, etc.)
- Web Technologies (HTML, CSS, HTTP, etc.)

## Error Handling

### Common Errors

1. **API Key Missing**
   ```
   Error: GOOGLE_API_KEY environment variable not set
   ```
   Solution: Set the `GOOGLE_API_KEY` environment variable

2. **Invalid Topic**
   ```
   Error: Topic is required and must be a string
   ```
   Solution: Provide a valid topic string

3. **Python Process Error**
   ```
   Error: Python process exited with code 1
   ```
   Solution: Check Python dependencies and API key

### Error Recovery

The system includes automatic error recovery:

- Retry mechanisms for failed API calls
- Fallback error messages for users
- Graceful degradation when services are unavailable

## Testing

### Python Agent Testing

```bash
# Run comprehensive tests
python test-battle-quiz.py

# Test specific topic
echo '{"topic": "React", "difficulty": "easy", "num_questions": 3}' | python agent/quiz_battle_agent.py
```

### API Testing

```bash
# Test the API endpoint
curl -X POST http://localhost:3000/api/generate-battle-quiz \
  -H "Content-Type: application/json" \
  -d '{"topic": "JavaScript", "difficulty": "intermediate", "num_questions": 3}'
```

### Frontend Testing

1. Navigate to the demo page
2. Test different topics and difficulty levels
3. Verify quiz completion and scoring
4. Check error handling with invalid inputs

## Performance Considerations

- **Caching**: Consider implementing quiz caching for popular topics
- **Rate Limiting**: Implement rate limiting for API calls
- **Async Processing**: Use background jobs for quiz generation in production
- **CDN**: Serve static assets through a CDN

## Security

- **Input Validation**: All inputs are validated on both frontend and backend
- **API Key Protection**: Keep API keys secure and never expose them in client-side code
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Error Sanitization**: Sanitize error messages to prevent information leakage

## Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   GOOGLE_API_KEY=your_production_api_key
   NODE_ENV=production
   ```

2. **Python Environment**
   ```bash
   # Use virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Build and Deploy**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

### Docker Deployment

```dockerfile
# Example Dockerfile for the Python agent
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY agent/ .
CMD ["python", "quiz_battle_agent.py"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting guide
- Review the demo page for examples 