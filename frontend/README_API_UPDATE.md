# MindSnap Frontend API Updates

## Overview
The MindSnap frontend has been updated to use the hosted Render API instead of local Python processes. All API routes now make HTTP requests to `https://mindsnap-7zsd.onrender.com/`.

## Changes Made

### 1. Configuration
- **New file**: `lib/config.ts` - Centralized API configuration
- **Base URL**: `https://mindsnap-7zsd.onrender.com/`
- **Environment variable**: `NEXT_PUBLIC_AGENT_API_URL` (optional override)

### 2. Updated API Routes
All the following routes have been updated to use the hosted API:

#### Flashcard Generation
- `app/api/generate-flashcards/route.ts` - YouTube video processing
- `app/api/generate-flashcards-text/route.ts` - Text input processing
- `app/api/generate-flashcards-pdf/route.ts` - PDF file processing
- `app/api/generate-flashcards-image/route.ts` - Image file processing

#### Quiz Generation
- `app/api/generate-quiz/route.ts` - Generate quiz from flashcards
- `app/api/generate-battle-quiz/route.ts` - Generate battle quiz for topics

#### Flashcard Q&A
- `app/api/flashcard-ask/route.ts` - Answer questions about flashcard content

#### PDF Highlighting
- `app/api/highlighter/highlight-pdf/route.ts` - PDF highlighting (placeholder implementation)

### 3. API Endpoints Available
The hosted API provides the following endpoints:

- `GET /` - Health check
- `POST /api/flashcards` - Generate flashcards from transcript
- `POST /api/flashcards/text` - Generate flashcards from text
- `POST /api/flashcards/pdf` - Generate flashcards from PDF
- `POST /api/flashcards/image` - Generate flashcards from image
- `POST /api/quiz` - Generate quiz from flashcards
- `POST /api/battle-quiz` - Generate battle quiz for topic
- `POST /api/flashcard-ask` - Answer flashcard questions
- `POST /api/highlight-pdf` - Highlight PDF content (placeholder)

## Benefits

### 1. Scalability
- No need to manage Python processes locally
- Better resource utilization
- Automatic scaling on Render

### 2. Reliability
- Hosted service with uptime monitoring
- Automatic restarts on failure
- Better error handling

### 3. Maintenance
- Centralized API management
- Easier updates and deployments
- No local Python environment setup required

## Deployment

### Environment Variables
Set the following environment variable in your deployment platform (optional):
```bash
NEXT_PUBLIC_AGENT_API_URL=https://mindsnap-7zsd.onrender.com
```

### Local Development
For local development, you can override the API URL:
```bash
NEXT_PUBLIC_AGENT_API_URL=http://localhost:5000
```

## API Response Format

All API endpoints return JSON responses with the following structure:

### Success Response
```json
{
  "flashcards": [
    {
      "id": 1,
      "title": "Card Title",
      "content": "Card content..."
    }
  ]
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Notes

### PDF Highlighting
The PDF highlighting feature currently returns a placeholder response (501 Not Implemented) because the hosted API doesn't support file uploads yet. This will need to be implemented in the future.

### File Processing
For PDF and image processing, files are still temporarily stored locally before being sent to the API. This is necessary because the current API expects file paths rather than file uploads.

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check if the hosted API is running: `https://mindsnap-7zsd.onrender.com/`
   - Verify network connectivity
   - Check CORS settings if applicable

2. **Authentication Errors**
   - Ensure `GOOGLE_API_KEY` is set in the hosted API environment
   - Check API key validity

3. **File Processing Errors**
   - Verify file format and size limits
   - Check temporary file permissions

### Debugging
All API routes include detailed logging. Check the console output for:
- Request URLs being called
- Response status codes
- Error messages and details

## Future Improvements

1. **File Upload Support**: Implement proper file upload handling in the hosted API
2. **Caching**: Add response caching for better performance
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Monitoring**: Add API usage monitoring and analytics 