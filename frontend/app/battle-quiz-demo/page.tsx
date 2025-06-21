"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BattleQuiz } from "@/components/battle/BattleQuiz"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Target, Brain, Zap } from "lucide-react"

export default function BattleQuizDemoPage() {
  const [topic, setTopic] = useState("JavaScript Fundamentals")
  const [difficulty, setDifficulty] = useState<"easy" | "intermediate" | "hard">("intermediate")
  const [numQuestions, setNumQuestions] = useState(5)
  const [quizData, setQuizData] = useState<any | null>(null)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState<{ score: number; total: number } | null>(null)

  const handleStartQuiz = async () => {
    setLoadingQuiz(true)
    setShowQuiz(true)
    setQuizCompleted(false)
    setFinalScore(null)
    try {
      const response = await fetch("/api/generate-battle-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, num_questions: numQuestions }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to generate quiz")
      }
      const data = await response.json()
      setQuizData(data)
    } catch (e: any) {
      handleQuizError(e.message)
      setShowQuiz(false)
    } finally {
      setLoadingQuiz(false)
    }
  }

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    setQuizCompleted(true)
    setFinalScore({ score, total: totalQuestions })
  }

  const handleQuizError = (error: string) => {
    console.error("Quiz error:", error)
    // You could show a toast notification here
  }

  const handleReset = () => {
    setShowQuiz(false)
    setQuizCompleted(false)
    setFinalScore(null)
    setQuizData(null)
  }

  const getScorePercentage = () => {
    if (!finalScore) return 0
    return Math.round((finalScore.score / finalScore.total) * 100)
  }

  const getScoreColor = () => {
    const percentage = getScorePercentage()
    if (percentage >= 80) return "text-green-400"
    if (percentage >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreMessage = () => {
    const percentage = getScorePercentage()
    if (percentage >= 90) return "Excellent! You're a master!"
    if (percentage >= 80) return "Great job! You really know your stuff!"
    if (percentage >= 70) return "Good work! You have solid knowledge!"
    if (percentage >= 60) return "Not bad! Keep learning!"
    if (percentage >= 50) return "You're getting there! Study more!"
    return "Keep practicing! You'll get better!"
  }

  if (showQuiz && !quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {loadingQuiz ? (
            <div className="flex items-center justify-center min-h-[400px] text-white">
              <p>Generating Quiz...</p>
            </div>
          ) : quizData ? (
            <BattleQuiz quiz={quizData} onQuizComplete={handleQuizComplete} />
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <p className="text-red-400">Failed to load quiz. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (quizCompleted && finalScore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8"
          >
            {/* Score Display */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
              >
                <Trophy className="w-12 h-12 text-white" />
              </motion.div>
              
              <h1 className="text-4xl font-bold text-white">Quiz Complete!</h1>
              
              <div className="text-center space-y-2">
                <div className={`text-6xl font-bold ${getScoreColor()}`}>
                  {getScorePercentage()}%
                </div>
                <div className="text-2xl text-gray-300">
                  {finalScore.score} / {finalScore.total} Correct
                </div>
                <p className="text-lg text-gray-400">{getScoreMessage()}</p>
              </div>
            </motion.div>

            {/* Quiz Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Quiz Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-blue-400 font-semibold">{topic}</div>
                      <div className="text-gray-400 text-sm">Topic</div>
                    </div>
                    <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Brain className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <div className="text-green-400 font-semibold capitalize">{difficulty}</div>
                      <div className="text-gray-400 text-sm">Difficulty</div>
                    </div>
                    <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <Zap className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <div className="text-purple-400 font-semibold">{numQuestions}</div>
                      <div className="text-gray-400 text-sm">Questions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={handleReset}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
              >
                Try Another Quiz
              </Button>
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3"
              >
                Go Back
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8"
        >
          {/* Header */}
          <div className="space-y-4">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Target className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-white">Battle Quiz Demo</h1>
            <p className="text-xl text-gray-400">
              Test your knowledge with AI-generated quiz questions
            </p>
          </div>

          {/* Quiz Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Configure Your Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Topic Input */}
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-gray-300">Quiz Topic</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic (e.g., JavaScript, Python, React)"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-gray-300">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={(value: "easy" | "intermediate" | "hard") => setDifficulty(value)}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="easy" className="text-white hover:bg-gray-700">Easy</SelectItem>
                      <SelectItem value="intermediate" className="text-white hover:bg-gray-700">Intermediate</SelectItem>
                      <SelectItem value="hard" className="text-white hover:bg-gray-700">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of Questions */}
                <div className="space-y-2">
                  <Label htmlFor="questions" className="text-gray-300">Number of Questions</Label>
                  <Select value={numQuestions.toString()} onValueChange={(value) => setNumQuestions(parseInt(value))}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {[3, 5, 7, 10].map(num => (
                        <SelectItem key={num} value={num.toString()} className="text-white hover:bg-gray-700">
                          {num} Questions
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/30">
                  <h4 className="text-white font-semibold mb-2">Quiz Preview</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {topic}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {difficulty}
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {numQuestions} questions
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={handleStartQuiz}
              disabled={!topic.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-12 py-4 text-xl rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <Target className="w-6 h-6 mr-3" />
              Start Battle Quiz
            </Button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            <div className="text-center p-6 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">AI Generated</h3>
              <p className="text-gray-400">Questions created by advanced AI for optimal learning</p>
            </div>
            <div className="text-center p-6 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <Target className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Multiple Topics</h3>
              <p className="text-gray-400">Test your knowledge on any programming topic</p>
            </div>
            <div className="text-center p-6 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Instant Feedback</h3>
              <p className="text-gray-400">Get immediate results and explanations</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 