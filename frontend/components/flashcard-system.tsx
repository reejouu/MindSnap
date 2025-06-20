"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle, Brain, Trophy, Target, MessageSquare, X as XIcon, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { Modal } from "@/components/ui/modal"
import { useAccount } from "wagmi"

interface FlashcardData {
  id: string
  title: string
  content: string
  type: "learning" | "quiz"
  question?: string
  options?: string[]
  correctAnswer?: number
}

interface FlashcardSystemProps {
  sessionId: string
  topic: string
  mode: "learning" | "quiz"
  cards: FlashcardData[]
  userName: string
  onComplete?: (score?: number) => void
  onExit?: () => void
  onFinishLearning?: () => void
  onSkipQuiz?: () => void
}

export default function FlashcardSystem({ sessionId, topic, mode, cards, userName, onComplete, onExit, onFinishLearning, onSkipQuiz }: FlashcardSystemProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now())
  const router = useRouter()
  const { address: walletAddress } = useAccount()

  const currentCard = cards[currentCardIndex]
  const progress = ((currentCardIndex + 1) / cards.length) * 100
  const isLastCard = currentCardIndex === cards.length - 1

  // Function to update time spent in localStorage
  const updateTimeSpent = (timeSpent: number) => {
    try {
      const storedData = localStorage.getItem(`flashcards_${sessionId}`)
      if (storedData) {
        const data = JSON.parse(storedData)
        // Update the current card's time spent
        if (data.cards && data.cards[currentCardIndex]) {
          data.cards[currentCardIndex].timeSpent = (data.cards[currentCardIndex].timeSpent || 0) + timeSpent
        }
        // Update the total time spent for the session
        data.timeSpent = (data.timeSpent || 0) + timeSpent
        localStorage.setItem(`flashcards_${sessionId}`, JSON.stringify(data))
      }
    } catch (error) {
      console.error('Error updating time spent:', error)
    }
  }

  // Update time spent when card changes
  useEffect(() => {
    const timeSpent = Date.now() - cardStartTime
    updateTimeSpent(timeSpent)
    setCardStartTime(Date.now())
  }, [currentCardIndex])

  // Update time spent when component unmounts
  useEffect(() => {
    return () => {
      const timeSpent = Date.now() - cardStartTime
      updateTimeSpent(timeSpent)
    }
  }, [])

  const handleNext = () => {
    if (mode === "quiz" && selectedAnswer !== null) {
      setAnswers([...answers, selectedAnswer])
      setSelectedAnswer(null)
      setShowResult(false)
    }

    if (isLastCard) {
      setIsCompleted(true)
    } else {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      if (mode === "quiz") {
        setSelectedAnswer(null)
        setShowResult(false)
      }
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowResult(true)
  }

  const calculateScore = () => {
    if (mode !== "quiz") return 0
    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === cards[index].correctAnswer) {
        correct++
      }
    })
    return Math.round((correct / cards.length) * 100)
  }

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right" && !isLastCard) {
      handleNext()
    } else if (direction === "left" && currentCardIndex > 0) {
      handlePrevious()
    }
  }

  // Touch/swipe handlers
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleSwipe("right")
    }
    if (isRightSwipe) {
      handleSwipe("left")
    }
  }

  if (isCompleted) {
    if (mode === "learning") {      return (
        <LearningComplete
          topic={topic}
          onQuiz={onFinishLearning || (() => router.push(`/quiz/${sessionId}`))}
          onDashboard={onSkipQuiz || (() => router.push("/dashboard"))}
        />
      )
    } else {
      const score = calculateScore()
      return (
        <QuizComplete
          topic={topic}
          score={score}
          totalCards={cards.length}
          answers={answers}
          cards={cards}
          onRetry={() => {
            setCurrentCardIndex(0)
            setAnswers([])
            setSelectedAnswer(null)
            setShowResult(false)
            setIsCompleted(false)
          }}
          onDashboard={() => router.push("/dashboard")}
          userName={userName}
          walletAddress={walletAddress}
        />
      )
    }
  }

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      {/* Header */}
      <div className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onExit || (() => router.push("/dashboard"))}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-text">{topic}</h1>
                <Badge className="bg-primary/20 text-primary">
                  {mode === "learning" ? "Learning Mode" : "Quiz Mode"}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-text/60">
              {currentCardIndex + 1} of {cards.length}
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Card
            className="bg-[#0d2520] border-primary/20 min-h-[400px] cursor-grab active:cursor-grabbing"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <CardContent className="p-8 h-full flex flex-col justify-center">
              {mode === "learning" ? (
                <LearningCard card={currentCard} />
              ) : (
                <QuizCard
                  card={currentCard}
                  selectedAnswer={selectedAnswer}
                  showResult={showResult}
                  onAnswerSelect={handleAnswerSelect}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              className="border-primary/20 text-primary hover:bg-primary/10"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {cards.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentCardIndex ? "bg-primary" : "bg-primary/20"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={mode === "quiz" && selectedAnswer === null}
              className="bg-primary hover:bg-primary/90 text-background"
            >
              {isLastCard ? "Complete" : "Next"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Swipe Hint */}
          <div className="text-center mt-4 text-text/40 text-sm">Swipe left or right to navigate</div>
        </div>
      </div>
    </div>
  )
}

function LearningCard({ card }: { card: FlashcardData }) {
  const [userQuestion, setUserQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showInput, setShowInput] = useState(false);

  // Reset question box when card changes
  useEffect(() => {
    setUserQuestion("");
    setResponse("");
    setError("");
    setShowModal(false);
    setShowInput(false);
  }, [card.id]);

  const handleAsk = async () => {
    if (!userQuestion.trim()) return;
    setLoading(true);
    setError("");
    setResponse("");
    try {
      const res = await fetch("/api/flashcard-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: card.content, question: userQuestion }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to get response");
      }
      const data = await res.json();
      setResponse(data.response);
      setShowModal(true);
      setShowInput(false);
    } catch (e: any) {
      setError(e.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full justify-between text-center space-y-6">
      <div>
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4 shadow border border-primary/20">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4 break-words leading-tight tracking-tight">
          {card.title}
        </h2>
        <div className="bg-primary/5 p-6 rounded-xl border border-primary/10 mx-auto max-w-prose text-lg text-text/90 leading-relaxed whitespace-pre-line break-words shadow-sm">
          {card.content}
        </div>
      </div>
      {/* Ask Button and Input */}
      <div className="flex flex-col items-end mt-4">
        {!showInput && (
          <Button
            size="sm"
            variant="ghost"
            className="bg-primary/10 hover:bg-primary/20 text-primary shadow transition-transform duration-300 flex items-center whitespace-nowrap"
            onClick={() => setShowInput(true)}
            aria-label="Focus Mode"
          >
            <Target className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Focus Mode</span>
          </Button>
        )}
        {showInput && (
          <div className="w-full max-w-md animate-fade-in-slide-up mt-2">
            <div className="bg-background border border-primary/20 rounded-lg shadow p-2 flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  className="w-full p-3 pr-10 border-none bg-transparent text-text placeholder:text-primary/40 focus:outline-none text-base"
                  placeholder="Ask to expand, elaborate, or simplify..."
                  value={userQuestion}
                  onChange={e => setUserQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAsk(); }}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAsk}
                  disabled={loading || !userQuestion.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-primary/80 hover:text-primary focus:outline-none transition-colors duration-200 disabled:opacity-50"
                  aria-label="Send"
                >
                  <Send />
                </button>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="text-primary hover:bg-primary/10 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                onClick={() => { setShowInput(false); setUserQuestion(""); setError(""); }}
                disabled={loading}
                aria-label="Cancel"
              >
                <XIcon className="w-5 h-5" />
              </Button>
            </div>
            {error && (
              <div className="w-full mt-1 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm text-left">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
      {/* AI Response Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="AI Response">
        <div className="p-2 text-left">
          <strong>AI:</strong> {response}
        </div>
      </Modal>
      <style jsx>{`
        .animate-fade-in-slide-up {
          animation: fadeInSlideUp 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeInSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function QuizCard({
  card,
  selectedAnswer,
  showResult,
  onAnswerSelect,
}: {
  card: FlashcardData
  selectedAnswer: number | null
  showResult: boolean
  onAnswerSelect: (index: number) => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full flex items-center justify-center mb-4 shadow border border-accent/20">
          <Target className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-2xl font-bold text-accent mb-6 break-words leading-tight tracking-tight">
          {card.question}
        </h2>
      </div>

      <div className="space-y-3">
        {card.options?.map((option, index) => {
          let buttonClass = "w-full p-4 text-left border rounded-lg transition-all duration-200 text-base font-medium break-words ";

          if (showResult) {
            if (index === card.correctAnswer) {
              buttonClass += "border-primary bg-primary/10 text-primary"
            } else if (index === selectedAnswer && index !== card.correctAnswer) {
              buttonClass += "border-red-500 bg-red-500/10 text-red-400"
            } else {
              buttonClass += "border-primary/20 text-text/60"
            }
          } else {
            if (index === selectedAnswer) {
              buttonClass += "border-primary bg-primary/10 text-primary"
            } else {
              buttonClass += "border-primary/20 text-text hover:border-primary/40 hover:bg-primary/5"
            }
          }

          return (
            <button
              key={index}
              onClick={() => !showResult && onAnswerSelect(index)}
              disabled={showResult}
              className={buttonClass}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && index === card.correctAnswer && <CheckCircle className="w-5 h-5 text-primary" />}
                {showResult && index === selectedAnswer && index !== card.correctAnswer && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {showResult && (
        <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20 mt-4">
          <p className="text-text/80 text-lg font-medium">
            {selectedAnswer === card.correctAnswer ? (
              <span className="text-primary font-semibold">Correct! 🎉</span>
            ) : (
              <span className="text-red-400 font-semibold">Incorrect. The correct answer is highlighted above.</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

function LearningComplete({
  topic,
  onQuiz,
  onDashboard,
}: {
  topic: string
  onQuiz: () => void
  onDashboard: () => void
}) {
  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center p-6">
      <Card className="bg-[#0d2520] border-primary/20 max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text mb-2">Learning Complete!</h2>
            <p className="text-text/60">You've finished learning about {topic}</p>
          </div>
          <div className="space-y-3">
            <Button onClick={onQuiz} className="w-full bg-primary hover:bg-primary/90 text-background">
              ✅ Take Quiz Now
            </Button>
            <Button
              onClick={onDashboard}
              variant="outline"
              className="w-full border-primary/20 text-primary hover:bg-primary/10"
            >
              ❌ Maybe Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function QuizComplete({
  topic,
  score,
  totalCards,
  answers,
  cards,
  onRetry,
  onDashboard,
  userName,
  walletAddress,
}: {
  topic: string
  score: number
  totalCards: number
  answers: number[]
  cards: FlashcardData[]
  onRetry: () => void
  onDashboard: () => void
  userName: string
  walletAddress?: string
}) {
  // Submit score to API when this component mounts
  useEffect(() => {
    if (userName && walletAddress) {
      fetch("/api/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, walletAddress, score }),
      }).catch((err) => console.error("Failed to submit score:", err));
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary"
    if (score >= 60) return "text-accent"
    return "text-red-400"
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent work! 🌟"
    if (score >= 80) return "Great job! 🎉"
    if (score >= 70) return "Good effort! 👍"
    if (score >= 60) return "Not bad! Keep practicing"
    return "Keep studying! You'll get it next time 💪"
  }

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center p-6">
      <Card className="bg-[#0d2520] border-primary/20 max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-accent/20 to-secondary/20 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text mb-2">Quiz Complete!</h2>
            <p className="text-text/60 mb-4">{topic}</p>
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(score)}`}>{score} points</div>
            <p className="text-text/60 text-sm">
              {answers.filter((answer, index) => answer === cards[index]?.correctAnswer).length} out of {totalCards}
              correct
            </p>
            <p className="text-text/80 mt-2">{getScoreMessage(score)}</p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={onRetry}
              variant="outline"
              className="w-full border-primary/20 text-primary hover:bg-primary/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Quiz
            </Button>
            <Button onClick={onDashboard} className="w-full bg-primary hover:bg-primary/90 text-background">
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
