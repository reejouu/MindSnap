"use client"

import { useState, useEffect, useRef } from "react"
import { motion, type PanInfo, useMotionValue, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Brain,
  Trophy,
  Target,
  XIcon,
  Send,
  Sparkles,
} from "lucide-react"
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

const DRAG_BUFFER = 50
const VELOCITY_THRESHOLD = 500
const GAP = 20
const SPRING_OPTIONS = { type: "spring", stiffness: 300, damping: 30 }

export default function FlashcardSystem({
  sessionId,
  topic,
  mode,
  cards,
  userName,
  onComplete,
  onExit,
  onFinishLearning,
  onSkipQuiz,
}: FlashcardSystemProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now())
  const router = useRouter()
  const { address: walletAddress } = useAccount()

  // Carousel specific state
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const baseWidth = 600
  const containerPadding = 20
  const itemWidth = baseWidth - containerPadding * 2
  const trackItemOffset = itemWidth + GAP

  const currentCard = cards[currentCardIndex]
  const progress = ((currentCardIndex + 1) / cards.length) * 100
  const isLastCard = currentCardIndex === cards.length - 1

  // Precompute all rotateY transforms at the top level, never in a loop or function
  const rotateYTransforms = cards.map((_, index) =>
    useTransform(
      x,
      [
        -(index + 1) * trackItemOffset,
        -index * trackItemOffset,
        -(index - 1) * trackItemOffset,
      ],
      [45, 0, -45],
      { clamp: false }
    )
  )

  // Function to update time spent in localStorage
  const updateTimeSpent = (timeSpent: number) => {
    try {
      const storedData = localStorage.getItem(`flashcards_${sessionId}`)
      if (storedData) {
        const data = JSON.parse(storedData)
        if (data.cards && data.cards[currentCardIndex]) {
          data.cards[currentCardIndex].timeSpent = (data.cards[currentCardIndex].timeSpent || 0) + timeSpent
        }
        data.timeSpent = (data.timeSpent || 0) + timeSpent
        localStorage.setItem(`flashcards_${sessionId}`, JSON.stringify(data))
      }
    } catch (error) {
      console.error("Error updating time spent:", error)
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

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      // Swipe left - go to next card
      if (!isLastCard) {
        handleNext()
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      // Swipe right - go to previous card
      if (currentCardIndex > 0) {
        handlePrevious()
      }
    }
  }

  if (isCompleted) {
    if (mode === "learning") {
      return (
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
    <div className="min-h-screen bg-[#0a0f0a] text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-emerald-500/20 bg-[#0a0f0a]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onExit || (() => router.push("/dashboard"))}
                className="text-gray-300 hover:text-white hover:bg-emerald-500/10 transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-white">{topic}</h1>
                <Badge
                  className={`${mode === "learning" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"} transition-all duration-300`}
                >
                  {mode === "learning" ? "Learning Mode" : "Quiz Mode"}
                </Badge>
              </div>
            </div>
            <div className="text-sm text-gray-400 font-medium">
              {currentCardIndex + 1} of {cards.length}
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2 bg-gray-800/50" />
          </div>
        </div>
      </div>

      {/* Flashcard Carousel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-[24px] border border-emerald-500/20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm"
            style={{
              width: `${baseWidth}px`,
              height: "500px",
              margin: "0 auto",
            }}
          >
            <motion.div
              className="flex h-full"
              drag="x"
              dragConstraints={{
                left: -trackItemOffset * (cards.length - 1),
                right: 0,
              }}
              style={{
                width: itemWidth,
                gap: `${GAP}px`,
                perspective: 1000,
                perspectiveOrigin: `${currentCardIndex * trackItemOffset + itemWidth / 2}px 50%`,
                x,
              }}
              onDragEnd={handleDragEnd}
              animate={{ x: -(currentCardIndex * trackItemOffset) }}
              transition={SPRING_OPTIONS}
            >
              {cards.map((card, index) => {
                const isActive = index === currentCardIndex
                const rotateY = rotateYTransforms[index]
                return (
                  <motion.div
                    key={card.id}
                    className="relative shrink-0 flex flex-col bg-gradient-to-br from-gray-900/95 to-gray-800/90 border-2 border-gray-600/50 rounded-[16px] overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl backdrop-blur-sm"
                    style={{
                      width: itemWidth,
                      height: "100%",
                      rotateY: rotateY,
                      borderColor: isActive
                        ? mode === "learning"
                          ? "rgba(16, 185, 129, 0.5)"
                          : "rgba(6, 182, 212, 0.5)"
                        : "rgba(75, 85, 99, 0.5)",
                    }}
                    transition={SPRING_OPTIONS}
                  >
                    <div className="p-8 h-full flex flex-col justify-center">
                      {mode === "learning" ? (
                        <LearningCard card={card} isActive={isActive} />
                      ) : (
                        <QuizCard
                          card={card}
                          selectedAnswer={isActive ? selectedAnswer : null}
                          showResult={isActive ? showResult : false}
                          onAnswerSelect={isActive ? handleAnswerSelect : () => {}}
                          isActive={isActive}
                        />
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <div className="flex justify-center space-x-2">
                {cards.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 ${
                      currentCardIndex === index
                        ? mode === "learning"
                          ? "bg-emerald-400"
                          : "bg-cyan-400"
                        : "bg-gray-600/50"
                    }`}
                    animate={{
                      scale: currentCardIndex === index ? 1.2 : 1,
                    }}
                    onClick={() => setCurrentCardIndex(index)}
                    transition={{ duration: 0.15 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              className="border-gray-600/50 text-gray-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-center text-gray-500 text-sm">
              {mode === "learning" ? "Drag cards or use buttons to navigate" : "Select an answer and click Next"}
            </div>

            <Button
              onClick={handleNext}
              disabled={mode === "quiz" && selectedAnswer === null}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[100px]"
            >
              {isLastCard ? "Complete" : "Next"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function LearningCard({ card, isActive }: { card: FlashcardData; isActive: boolean }) {
  const [userQuestion, setUserQuestion] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showInput, setShowInput] = useState(false)

  // Reset question box when card changes
  useEffect(() => {
    setUserQuestion("")
    setResponse("")
    setError("")
    setShowModal(false)
    setShowInput(false)
  }, [card.id])

  const handleAsk = async () => {
    if (!userQuestion.trim()) return
    setLoading(true)
    setError("")
    setResponse("")
    try {
      const res = await fetch("/api/flashcard-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: card.content, question: userQuestion }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to get response")
      }
      const data = await res.json()
      setResponse(data.response)
      setShowModal(true)
      setShowInput(false)
    } catch (e: any) {
      setError(e.message || "Failed to get response")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full justify-between text-center space-y-6">
      <div>
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mb-4 shadow-lg border border-emerald-500/30">
          <Brain className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4 break-words leading-tight tracking-tight">
          {card.title}
        </h2>
        <div className="bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 p-4 rounded-xl border border-emerald-500/20 mx-auto max-w-prose text-base text-gray-200 leading-relaxed whitespace-pre-line break-words shadow-sm backdrop-blur-sm">
          {card.content}
        </div>
      </div>
      {/* Ask Button and Input - Only show on active card */}
      {isActive && (
        <div className="flex flex-col items-end mt-4">
          {!showInput && (
            <Button
              size="sm"
              variant="ghost"
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 shadow-lg transition-all duration-300 hover:scale-105 flex items-center whitespace-nowrap border border-emerald-500/20 hover:border-emerald-500/30"
              onClick={() => setShowInput(true)}
              aria-label="Focus Mode"
            >
              <Target className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">Focus Mode</span>
            </Button>
          )}
          {showInput && (
            <div className="w-full max-w-md animate-fade-in-slide-up mt-2">
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/50 border border-emerald-500/30 rounded-lg shadow-xl p-2 flex items-center gap-2 backdrop-blur-sm">
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="w-full p-2 pr-8 border-none bg-transparent text-white placeholder:text-emerald-400/60 focus:outline-none text-sm"
                    placeholder="Ask to expand, elaborate, or simplify..."
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAsk()
                    }}
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAsk}
                    disabled={loading || !userQuestion.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-emerald-400/80 hover:text-emerald-400 focus:outline-none transition-colors duration-200 disabled:opacity-50 hover:scale-110"
                    aria-label="Send"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="text-gray-400 hover:text-white hover:bg-red-500/10 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all duration-200 h-8 w-8"
                  onClick={() => {
                    setShowInput(false)
                    setUserQuestion("")
                    setError("")
                  }}
                  disabled={loading}
                  aria-label="Cancel"
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
              {error && (
                <div className="w-full mt-1 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm text-left backdrop-blur-sm">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* AI Response Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="AI Response">
        <div className="p-2 text-left text-gray-200">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="text-emerald-400">AI:</strong>
              <span className="ml-2">{response}</span>
            </div>
          </div>
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
  )
}

function QuizCard({
  card,
  selectedAnswer,
  showResult,
  onAnswerSelect,
  isActive,
}: {
  card: FlashcardData
  selectedAnswer: number | null
  showResult: boolean
  onAnswerSelect: (index: number) => void
  isActive: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500/20 to-purple-400/20 rounded-full flex items-center justify-center mb-4 shadow-lg border border-cyan-500/30">
          <Target className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4 break-words leading-tight tracking-tight">
          {card.question}
        </h2>
      </div>

      <div className="space-y-2">
        {card.options?.map((option, index) => {
          let buttonClass =
            "w-full p-3 text-left border rounded-lg transition-all duration-200 text-sm font-medium break-words "

          if (showResult) {
            if (index === card.correctAnswer) {
              buttonClass += "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20"
            } else if (index === selectedAnswer && index !== card.correctAnswer) {
              buttonClass += "border-red-500 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/20"
            } else {
              buttonClass += "border-gray-600/50 text-gray-400 bg-gray-800/30"
            }
          } else {
            if (index === selectedAnswer) {
              buttonClass += "border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/20"
            } else {
              buttonClass +=
                "border-gray-600/50 text-gray-200 hover:border-cyan-500/40 hover:bg-cyan-500/5 bg-gray-800/30 hover:shadow-lg transition-all duration-200"
            }
          }

          return (
            <button
              key={index}
              onClick={() => isActive && !showResult && onAnswerSelect(index)}
              disabled={!isActive || showResult}
              className={buttonClass}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && index === card.correctAnswer && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                {showResult && index === selectedAnswer && index !== card.correctAnswer && (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {showResult && (
        <div className="text-center p-3 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 rounded-lg border border-emerald-500/20 mt-4 backdrop-blur-sm">
          <p className="text-gray-200 text-base font-medium">
            {selectedAnswer === card.correctAnswer ? (
              <span className="text-emerald-400 font-semibold">Correct! 🎉</span>
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
    <div className="min-h-screen bg-[#0a0f0a] text-white flex items-center justify-center p-6">
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 hover:border-emerald-500/30 max-w-md w-full shadow-2xl backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 rounded-full flex items-center justify-center shadow-lg border border-emerald-500/30">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Learning Complete!</h2>
            <p className="text-gray-300">You've finished learning about {topic}</p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={onQuiz}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium transition-all duration-200 hover:scale-105 shadow-lg"
            >
              ✅ Take Quiz Now
            </Button>
            <Button
              onClick={onDashboard}
              variant="outline"
              className="w-full border-gray-600/50 text-gray-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200"
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
      }).catch((err) => console.error("Failed to submit score:", err))
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400"
    if (score >= 60) return "text-cyan-400"
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
    <div className="min-h-screen bg-[#0a0f0a] text-white flex items-center justify-center p-6">
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 hover:border-cyan-500/30 max-w-md w-full shadow-2xl backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500/20 to-purple-400/20 rounded-full flex items-center justify-center shadow-lg border border-cyan-500/30">
            <Trophy className="w-10 h-10 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
            <p className="text-gray-300 mb-4">{topic}</p>
            <div className={`text-4xl font-bold mb-2 ${getScoreColor(score)}`}>{score} points</div>
            <p className="text-gray-400 text-sm">
              {answers.filter((answer, index) => answer === cards[index]?.correctAnswer).length} out of {totalCards}{" "}
              correct
            </p>
            <p className="text-gray-200 mt-2">{getScoreMessage(score)}</p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={onRetry}
              variant="outline"
              className="w-full border-gray-600/50 text-gray-300 hover:text-white hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Quiz
            </Button>
            <Button
              onClick={onDashboard}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-medium transition-all duration-200 hover:scale-105 shadow-lg"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
