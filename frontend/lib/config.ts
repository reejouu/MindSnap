// API Configuration
export const API_CONFIG = {
  // Render hosted agent API
  AGENT_API_BASE_URL: process.env.NEXT_PUBLIC_AGENT_API_URL || 'https://mindsnap-7zsd.onrender.com',
  
  // Local development fallback (if needed)
  LOCAL_API_BASE_URL: 'http://localhost:5000',
  
  // Use hosted API by default, fallback to local if needed
  get baseUrl() {
    return this.AGENT_API_BASE_URL;
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Health check
  HEALTH: '/',
  
  // Flashcard generation
  FLASHCARDS: '/api/flashcards',
  FLASHCARDS_TEXT: '/api/flashcards/text',
  FLASHCARDS_PDF: '/api/flashcards/pdf',
  FLASHCARDS_IMAGE: '/api/flashcards/image',
  
  // Quiz generation
  QUIZ: '/api/quiz',
  BATTLE_QUIZ: '/api/battle-quiz',
  
  // Flashcard Q&A
  FLASHCARD_ASK: '/api/flashcard-ask',
  
  // PDF highlighting
  HIGHLIGHT_PDF: '/api/highlight-pdf',
};

// Helper function to get full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}${endpoint}`;
} 