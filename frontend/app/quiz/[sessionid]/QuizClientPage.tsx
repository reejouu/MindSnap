"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import FlashcardSystem from "@/components/flashcard-system";

export default function QuizClientPage({ userName }: { userName: string }) {
  const params = useParams();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get sessionId from URL or params
    const paramSessionId = params?.sessionId;
    const urlSessionId = typeof window !== 'undefined' ? window.location.pathname.split("/").pop() : undefined;
    const finalSessionId = paramSessionId || urlSessionId;
    setSessionId(finalSessionId as string);
  }, [params]);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);

    // Try to get quiz from localStorage
    const storedQuiz = localStorage.getItem(`quiz_${sessionId}`);
    if (storedQuiz) {
      try {
        const parsed = JSON.parse(storedQuiz);
        setQuizData(parsed);
        setLoading(false);
        return;
      } catch (e) {
        // If parsing fails, remove corrupted data
        localStorage.removeItem(`quiz_${sessionId}`);
      }
    }

    // If not found, get flashcards and call API
    const storedFlashcards = localStorage.getItem(`flashcards_${sessionId}`);
    if (!storedFlashcards) {
      setError("No flashcards found for this session. Please complete the learning session first.");
      setLoading(false);
      return;
    }
    let flashcards;
    try {
      const parsed = JSON.parse(storedFlashcards);
      flashcards = parsed.cards;
    } catch (e) {
      setError("Failed to parse flashcards for this session.");
      setLoading(false);
      return;
    }
    if (!flashcards || !Array.isArray(flashcards)) {
      setError("No valid flashcards found for this session.");
      setLoading(false);
      return;
    }
    // Call API to generate quiz
    fetch("/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flashcards }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to generate quiz");
        }
        return res.json();
      })
      .then((data) => {
        // Store in localStorage
        localStorage.setItem(`quiz_${sessionId}`, JSON.stringify(data));
        setQuizData(data);
      })
      .catch((err) => {
        setError(err.message || "Failed to generate quiz");
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading || !userName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Generating quiz...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Quiz Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  if (!quizData || !quizData.quiz || !Array.isArray(quizData.quiz)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Quiz Found</h2>
          <p className="mb-4">No quiz available for this session.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  // Format for FlashcardSystem
  const formattedCards = quizData.quiz.map((q: any) => ({
    id: q.id.toString(),
    type: "quiz" as const,
    title: q.question.split(".")[0] || `Quiz ${q.id}`,
    content: "",
    question: q.question,
    options: q.options,
    correctAnswer: q.correct_answer,
  }));
  return (
    <FlashcardSystem
      sessionId={sessionId as string}
      topic={quizData.topic || "Quiz"}
      mode="quiz"
      cards={formattedCards}
      userName={userName}
    />
  );
} 