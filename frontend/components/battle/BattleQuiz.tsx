"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Trophy, 
  Clock,
  Target,
  Brain,
  Crown,
  Medal,
  Star,
  Award,
  Zap,
  Users
} from "lucide-react"
import { 
  battleQuizService, 
  type BattleQuiz as BattleQuizType, 
  BattleQuizQuestion,
} from "@/lib/battleQuizService"

interface BattleQuizProps {
  quiz: BattleQuizType
  onQuizComplete?: (score: number, totalQuestions: number) => void
}

interface AnswerState {
  [questionId: number]: {
    selectedAnswer: number | null
    isCorrect: boolean | null
    timeSpent: number
  }
}

interface WinnerModalProps {
  isOpen: boolean
  onClose: () => void
  score: number
  totalQuestions: number
  timeSpent: number
  topic: string
  onPlayAgain?: () => void
  onBackToLobby?: () => void
}

function WinnerModal({ 
  isOpen, 
  onClose, 
  score, 
  totalQuestions, 
  timeSpent, 
  topic,
  onPlayAgain,
  onBackToLobby 
}: WinnerModalProps) {
  const accuracy = Math.round((score / totalQuestions) * 100)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 space-y-8">
            {/* Winner Trophy */}
            <div className="text-center space-y-6">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
              >
                <Trophy className="w-16 h-16 text-white" />
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  🏆 Quiz Complete! 🏆
                </h1>
                <p className="text-xl text-gray-400">
                  You've conquered the <span className="text-blue-400 font-semibold">{topic}</span> challenge!
                </p>
              </div>
            </div>

            {/* Score Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4"
            >
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="text-3xl font-bold text-green-400">{score}/{totalQuestions}</div>
                <div className="text-sm text-gray-400">Correct</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="text-3xl font-bold text-blue-400">{accuracy}%</div>
                <div className="text-sm text-gray-400">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="text-3xl font-bold text-purple-400">{formatTime(timeSpent)}</div>
                <div className="text-sm text-gray-400">Time</div>
              </div>
            </motion.div>

            {/* Performance Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center p-6 bg-gray-800/30 rounded-lg border border-gray-700/30"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {accuracy >= 80 ? "🎯 Excellent Performance!" :
                 accuracy >= 60 ? "👍 Good Job!" :
                 accuracy >= 40 ? "💪 Keep Learning!" :
                 "📚 Room for Improvement!"}
              </h3>
              <p className="text-gray-400">
                {accuracy >= 80 ? "You're a master of this topic!" :
                 accuracy >= 60 ? "You have a solid understanding!" :
                 accuracy >= 40 ? "You're on the right track!" :
                 "Keep practicing to improve your knowledge!"}
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center space-x-4"
            >
              {onPlayAgain && (
                <Button
                  onClick={onPlayAgain}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Play Again
                </Button>
              )}
              
              {onBackToLobby && (
                <Button
                  onClick={onBackToLobby}
                  variant="outline"
                  className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-6 py-3"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  Back to Lobby
                </Button>
              )}
              
              <Button
                onClick={onClose}
                variant="outline"
                className="border-gray-500 text-gray-400 hover:bg-gray-500 hover:text-white px-6 py-3"
              >
                Close
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function BattleQuiz({ 
  quiz,
  onQuizComplete 
}: BattleQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerState>({})
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [winnerModalOpen, setWinnerModalOpen] = useState(false)
  const [finalScore, setFinalScore] = useState({ score: 0, totalQuestions: 0, timeSpent: 0 })

  useEffect(() => {
    if (quiz) {
      console.log("🎯 BattleQuiz - Quiz data received:", quiz)
      console.log("🎯 BattleQuiz - Quiz questions:", quiz.quiz?.length || 0)
      console.log("🎯 BattleQuiz - First question:", quiz.quiz?.[0])
      
      setStartTime(Date.now())
      const initialAnswers: AnswerState = {}
      quiz.quiz.forEach(question => {
        initialAnswers[question.id] = {
          selectedAnswer: null,
          isCorrect: null,
          timeSpent: 0
        }
      })
      setAnswers(initialAnswers)
      // Reset to first question when quiz changes
      setCurrentQuestionIndex(0)
      setQuizCompleted(false)
      
      console.log("🎯 BattleQuiz - Initialized with question index 0")
    }
  }, [quiz])

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (quizCompleted) return
    
    const question = quiz?.quiz[currentQuestionIndex]
    if (!question || question.id !== questionId) return
    
    const isCorrect = question.correct_answer === answerIndex
    const timeSpent = startTime ? Date.now() - startTime : 0
    
    console.log(`🎯 Answer selected for question ${questionId}:`, {
      selectedAnswer: answerIndex,
      correctAnswer: question.correct_answer,
      isCorrect,
      timeSpent
    })
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedAnswer: answerIndex,
        isCorrect,
        timeSpent
      }
    }))
  }

  const handleNextQuestion = async () => {
    if (quizCompleted) {
      console.log("🎯 Quiz already completed, ignoring duplicate call")
      return
    }
    
    if (currentQuestionIndex < (quiz?.quiz.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setStartTime(Date.now())
    } else {
      // Quiz completed - show loading state
      console.log("🎯 Quiz completed! Calculating score...")
      setIsSubmitting(true)
      setQuizCompleted(true)
      
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Calculate final score
      const answeredQuestions = Object.values(answers).filter(a => a.selectedAnswer !== null)
      const correctAnswers = answeredQuestions.filter(a => a.isCorrect === true)
      const score = correctAnswers.length
      const totalQuestions = quiz?.total_questions || quiz?.quiz?.length || 0
      const totalTimeSpent = Object.values(answers).reduce((total, answer) => total + answer.timeSpent, 0)
      
      console.log("🎯 Score calculation details:", {
        answeredQuestions: answeredQuestions.length,
        correctAnswers: correctAnswers.length,
        score,
        totalQuestions,
        totalTimeSpent,
        answers: answers
      })
      
      console.log("🎯 Final score:", score, "out of", totalQuestions)
      
      // Call onQuizComplete for parent to handle comparison
      if (onQuizComplete) {
        onQuizComplete(score, totalQuestions)
      }
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setStartTime(Date.now())
    }
  }

  const getCurrentQuestion = (): BattleQuizQuestion | null => {
    const question = quiz?.quiz[currentQuestionIndex] || null
    console.log(`🎯 BattleQuiz - Getting question ${currentQuestionIndex}:`, question?.question?.substring(0, 50) + "...")
    return question
  }

  const getProgress = (): number => {
    if (!quiz) return 0
    return ((currentQuestionIndex + 1) / quiz.quiz.length) * 100
  }

  const getScore = (): number => {
    return Object.values(answers).filter(a => a.isCorrect).length
  }

  if (!quiz) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-gray-400">Waiting for quiz data...</p>
        </div>
      </motion.div>
    )
  }

  // Show loading state when submitting
  if (isSubmitting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <div className="text-center space-y-6">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center"
          >
            <Trophy className="w-12 h-12 text-green-400" />
          </motion.div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Calculating Your Score...</h2>
            <p className="text-gray-400">Preparing to submit your results</p>
          </div>
          
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-green-400 text-lg font-semibold"
          >
            Please wait...
          </motion.div>
        </div>
      </motion.div>
    )
  }

  const currentQuestion = getCurrentQuestion()
  if (!currentQuestion) return null

  const currentAnswer = answers[currentQuestion.id]
  const hasAnswered = currentAnswer?.selectedAnswer !== null
  
  // Debug logging
  console.log("🎯 Current question ID:", currentQuestion.id)
  console.log("🎯 Current answer state:", currentAnswer)
  console.log("🎯 Has answered:", hasAnswered)
  console.log("🎯 Is last question:", currentQuestionIndex === quiz.quiz.length - 1)
  console.log("🎯 All answers:", answers)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-4">
          <Target className="w-8 h-8 text-blue-400" />
          <h2 className="text-3xl font-bold text-white">Battle Quiz</h2>
          <Brain className="w-8 h-8 text-purple-400" />
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {quiz.topic}
          </Badge>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            {quiz.difficulty}
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {getScore()}/{quiz.total_questions} Correct
          </Badge>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        className="space-y-2"
      >
        <div className="flex justify-between text-sm text-gray-400">
          <span>Question {currentQuestionIndex + 1} of {quiz.total_questions}</span>
          <span>{Math.round(getProgress())}% Complete</span>
        </div>
        <Progress value={getProgress()} className="h-2" />
      </motion.div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-6 break-words leading-tight tracking-tight">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = currentAnswer?.selectedAnswer === index
                  const isCorrect = currentAnswer?.isCorrect && isSelected
                  const isWrong = currentAnswer?.isCorrect === false && isSelected
                  const isTheCorrectAnswer = hasAnswered && index === currentQuestion.correct_answer

                  let buttonClass = "w-full p-4 text-left border rounded-lg transition-all duration-200 text-base font-medium break-words "

                  if (hasAnswered) {
                    if (isTheCorrectAnswer) {
                      buttonClass += "border-green-500 bg-green-500/10 text-green-400 shadow-lg shadow-green-500/20"
                    } else if (isWrong) {
                      buttonClass += "border-red-500 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/20"
                    } else {
                      buttonClass += "border-gray-600/50 text-gray-400 bg-gray-800/30"
                    }
                  } else {
                    if (isSelected) {
                      buttonClass += "border-blue-500 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/20"
                    } else {
                      buttonClass += "border-gray-600/50 text-gray-200 hover:border-blue-500/40 hover:bg-blue-500/5 bg-gray-800/30 hover:shadow-lg"
                    }
                  }

                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: hasAnswered ? 1 : 1.02 }}
                      whileTap={{ scale: hasAnswered ? 1 : 0.98 }}
                    >
                      <button
                        onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                        disabled={hasAnswered}
                        className={buttonClass}
                      >
                        <div className="flex items-center justify-between">
                          <span>{String.fromCharCode(65 + index)}. {option}</span>
                          {hasAnswered && isTheCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-400" />}
                          {hasAnswered && isWrong && <XCircle className="w-5 h-5 text-red-400" />}
                        </div>
                      </button>
                    </motion.div>
                  )
                })}
              </div>

              {hasAnswered && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 mt-4"
                >
                  <p className="text-sm text-gray-300">
                    <strong className="font-semibold text-green-400">Explanation:</strong> {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>
            {currentAnswer?.timeSpent ? Math.round(currentAnswer.timeSpent / 1000) : 0}s
          </span>
        </div>

        {/* Debug info */}
        <div className="text-xs text-gray-500">
          Debug: Q{currentQuestionIndex + 1}/{quiz.quiz.length}, Answered: {hasAnswered ? 'Yes' : 'No'}
        </div>

        <Button
          onClick={handleNextQuestion}
          disabled={!hasAnswered}
          className={`flex items-center space-x-2 ${
            hasAnswered 
              ? "bg-blue-500 hover:bg-blue-600" 
              : "bg-gray-500 cursor-not-allowed"
          }`}
        >
          {currentQuestionIndex === quiz.quiz.length - 1 ? (
            <>
              <Trophy className="w-4 h-4" />
              Finish Quiz {!hasAnswered && "(Answer required)"}
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
} 