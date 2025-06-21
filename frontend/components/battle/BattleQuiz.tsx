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
  Brain
} from "lucide-react"
import { 
  battleQuizService, 
  type BattleQuiz, 
  BattleQuizQuestion,
  BattleQuizRequest 
} from "@/lib/battleQuizService"

interface BattleQuizProps {
  topic: string
  difficulty?: "easy" | "intermediate" | "hard"
  numQuestions?: number
  onQuizComplete?: (score: number, totalQuestions: number) => void
  onQuizError?: (error: string) => void
}

interface AnswerState {
  [questionId: number]: {
    selectedAnswer: number | null
    isCorrect: boolean | null
    timeSpent: number
  }
}

export function BattleQuiz({ 
  topic, 
  difficulty = "intermediate", 
  numQuestions = 5,
  onQuizComplete,
  onQuizError 
}: BattleQuizProps) {
  const [quiz, setQuiz] = useState<BattleQuiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerState>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  // Generate quiz on component mount
  useEffect(() => {
    generateQuiz()
  }, [topic, difficulty, numQuestions])

  const generateQuiz = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const request: BattleQuizRequest = {
        topic,
        difficulty,
        num_questions: numQuestions
      }
      
      const generatedQuiz = await battleQuizService.generateBattleQuiz(request)
      setQuiz(generatedQuiz)
      setStartTime(Date.now())
      
      // Initialize answer state
      const initialAnswers: AnswerState = {}
      generatedQuiz.quiz.forEach(question => {
        initialAnswers[question.id] = {
          selectedAnswer: null,
          isCorrect: null,
          timeSpent: 0
        }
      })
      setAnswers(initialAnswers)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate quiz"
      setError(errorMessage)
      onQuizError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (quizCompleted) return
    
    const question = quiz?.quiz[currentQuestionIndex]
    if (!question || question.id !== questionId) return
    
    const isCorrect = battleQuizService.isCorrectAnswer(questionId, answerIndex)
    const timeSpent = startTime ? Date.now() - startTime : 0
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedAnswer: answerIndex,
        isCorrect,
        timeSpent
      }
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.quiz.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setStartTime(Date.now())
    } else {
      // Quiz completed
      setQuizCompleted(true)
      const score = Object.values(answers).filter(a => a.isCorrect).length
      onQuizComplete?.(score, quiz?.total_questions || 0)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setStartTime(Date.now())
    }
  }

  const getCurrentQuestion = (): BattleQuizQuestion | null => {
    return quiz?.quiz[currentQuestionIndex] || null
  }

  const getProgress = (): number => {
    if (!quiz) return 0
    return ((currentQuestionIndex + 1) / quiz.quiz.length) * 100
  }

  const getScore = (): number => {
    return Object.values(answers).filter(a => a.isCorrect).length
  }

  if (isLoading) {
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
          <p className="text-gray-400">Generating battle quiz for {topic}...</p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4"
      >
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h3 className="text-xl font-semibold text-white">Failed to Generate Quiz</h3>
        <p className="text-gray-400">{error}</p>
        <Button onClick={generateQuiz} className="bg-blue-500 hover:bg-blue-600">
          Try Again
        </Button>
      </motion.div>
    )
  }

  if (!quiz) {
    return null
  }

  const currentQuestion = getCurrentQuestion()
  if (!currentQuestion) return null

  const currentAnswer = answers[currentQuestion.id]
  const hasAnswered = currentAnswer?.selectedAnswer !== null

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
          <CardHeader>
            <CardTitle className="text-xl text-white">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Answer Options */}
            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = currentAnswer?.selectedAnswer === index
                const isCorrect = currentAnswer?.isCorrect && isSelected
                const isWrong = currentAnswer?.isCorrect === false && isSelected
                
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full justify-start p-4 h-auto text-left ${
                        isSelected
                          ? isCorrect
                            ? "bg-green-500/20 border-green-500/50 text-green-400"
                            : isWrong
                            ? "bg-red-500/20 border-red-500/50 text-red-400"
                            : "bg-blue-500/20 border-blue-500/50 text-blue-400"
                          : "bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                      }`}
                      onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                      disabled={hasAnswered}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? isCorrect
                              ? "border-green-400 bg-green-400/20"
                              : isWrong
                              ? "border-red-400 bg-red-400/20"
                              : "border-blue-400 bg-blue-400/20"
                            : "border-gray-500"
                        }`}>
                          {isSelected && (
                            isCorrect ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : isWrong ? (
                              <XCircle className="w-4 h-4 text-red-400" />
                            ) : (
                              <div className="w-2 h-2 bg-blue-400 rounded-full" />
                            )
                          )}
                        </div>
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                        <span>{option}</span>
                      </div>
                    </Button>
                  </motion.div>
                )
              })}
            </div>

            {/* Explanation */}
            {hasAnswered && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30"
              >
                <p className="text-sm text-gray-300">
                  <strong>Explanation:</strong> {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
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

        <Button
          onClick={handleNextQuestion}
          disabled={!hasAnswered}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600"
        >
          {currentQuestionIndex === quiz.quiz.length - 1 ? (
            <>
              <Trophy className="w-4 h-4" />
              Finish Quiz
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