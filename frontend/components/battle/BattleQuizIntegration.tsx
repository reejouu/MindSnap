"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Trophy, Clock, Users, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BattleQuiz } from "./BattleQuiz"
import { battleService } from "@/lib/battleService"

interface BattleQuizIntegrationProps {
  roomId: string
  topic: string
  onBattleComplete?: (winner: string, scores: { [userId: string]: number }) => void
}

interface PlayerScore {
  userId: string
  username: string
  score: number
  totalQuestions: number
  timeSpent: number
  accuracy: number
  completedAt?: number
}

interface WaitingForResultsProps {
  currentPlayerScore: {
    score: number
    totalQuestions: number
    timeSpent: number
    accuracy: number
  }
  playerCount: number
  onManualCheck?: () => void
}

// WaitingForResults component definition
const WaitingForResults: React.FC<WaitingForResultsProps> = ({
  currentPlayerScore,
  playerCount,
  onManualCheck
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-8"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-400/20 rounded-full flex items-center justify-center mb-6"
      >
        <Trophy className="w-12 h-12 text-green-400" />
      </motion.div>

      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
        <p className="text-gray-400 text-lg">
          Great job! Here's your performance:
        </p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700 max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {currentPlayerScore.score}/{currentPlayerScore.totalQuestions}
              </div>
              <div className="text-gray-400">Questions Correct</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-xl font-semibold text-blue-400">
                  {currentPlayerScore.accuracy}%
                </div>
                <div className="text-gray-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-purple-400">
                  {Math.floor(currentPlayerScore.timeSpent / 60)}:{(currentPlayerScore.timeSpent % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-gray-400">Time Taken</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-yellow-400 text-lg font-semibold"
        >
          Waiting for opponent to finish... ({playerCount}/2 completed)
        </motion.div>
        
        {onManualCheck && (
          <Button
            onClick={onManualCheck}
            variant="outline"
            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          >
            Check Results Now
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export function BattleQuizIntegration({ 
  roomId, 
  topic, 
  onBattleComplete 
}: BattleQuizIntegrationProps) {
  const [battleState, setBattleState] = useState<"waiting" | "quiz" | "results" | "complete" | "waiting_for_others">("waiting")
  const [playerScores, setPlayerScores] = useState<{ [userId: string]: PlayerScore }>({})
  const [currentUser, setCurrentUser] = useState(battleService.getCurrentUser())
  const [battleData, setBattleData] = useState(battleService.getCurrentBattle())
  const [timeLimit, setTimeLimit] = useState(300) // 5 minutes
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [quizData, setQuizData] = useState<any>(null)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null)
  const [waitingForResults, setWaitingForResults] = useState(false)
  const [currentPlayerScore, setCurrentPlayerScore] = useState<any>(null)
  const [playerCount, setPlayerCount] = useState(0)
  const quizGeneratedRef = useRef(false)
  const resultsCalculatedRef = useRef(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!topic || !timeLimit) return

    // Listen for battle start event
    const handleBattleStarted = async (event: Event) => {
      console.log("⚔️ Battle started, generating quiz...")
      
      // Prevent duplicate quiz generation
      if (quizGeneratedRef.current) {
        console.log("⚔️ Quiz already generated, ignoring duplicate event")
        return
      }
      
      quizGeneratedRef.current = true
      setLoadingQuiz(true)
      
      try {
        // Generate the quiz when battle starts
        const response = await fetch("/api/generate-battle-quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: topic,
            difficulty: "intermediate",
            num_questions: 5,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to generate battle quiz")
        }

        const quiz = await response.json()
        setQuizData(quiz)
        setBattleState("quiz")
        setTimeRemaining(timeLimit)
        setQuizStartTime(Date.now())
        console.log("✅ Quiz generated successfully:", quiz)
      } catch (error) {
        console.error("❌ Error generating quiz:", error)
        // Handle error - maybe show error state
      } finally {
        setLoadingQuiz(false)
      }
    }

    window.addEventListener("battleStarted", handleBattleStarted)

    return () => {
      window.removeEventListener("battleStarted", handleBattleStarted)
    }
  }, [topic, timeLimit])

  // Cleanup effect to reset refs when component unmounts
  useEffect(() => {
    return () => {
      console.log("🧹 BattleQuizIntegration - Component unmounting, cleaning up...")
      quizGeneratedRef.current = false
      
      // Clear polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }

      // Clean up localStorage for this battle
      const battleKey = `battle_${roomId}`
      localStorage.removeItem(battleKey)
      console.log("🧹 Cleared localStorage for battle:", battleKey)
    }
  }, [roomId])

  // Timer for quiz phase
  useEffect(() => {
    if (battleState === "quiz" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up! End the quiz
            handleTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [battleState, timeRemaining])

  const handleTimeUp = () => {
    console.log("⏰ Time's up! Ending quiz phase")
    setBattleState("results")
    calculateFinalResults()
  }

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    console.log("🎯 handleQuizComplete called with score:", score, "totalQuestions:", totalQuestions)
    
    if (!currentUser || !quizStartTime) {
      console.log("❌ Missing currentUser or quizStartTime")
      console.log("❌ currentUser:", currentUser)
      console.log("❌ quizStartTime:", quizStartTime)
      return
    }

    const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000)
    const accuracy = Math.round((score / totalQuestions) * 100)
    
    const playerScore = {
      score,
      totalQuestions,
      timeSpent,
      accuracy
    }

    console.log("🎯 Player score data:", playerScore)
    setCurrentPlayerScore(playerScore)

    try {
      console.log("🎯 Submitting score to localStorage...")
      
      // Store score in localStorage
      const battleKey = `battle_${roomId}`
      const existingScores = JSON.parse(localStorage.getItem(battleKey) || '{}')
      existingScores[currentUser.id] = playerScore
      localStorage.setItem(battleKey, JSON.stringify(existingScores))

      setPlayerScores(existingScores)
      setPlayerCount(Object.keys(existingScores).length)

      console.log(`🎯 Player ${currentUser.name} completed quiz: ${score}/${totalQuestions} (${accuracy}%) in ${timeSpent}s`)
      console.log(`🎯 Stored scores in localStorage:`, existingScores)

      // Show waiting state for other players
      setWaitingForResults(true)
      setBattleState("waiting_for_others")
      
      // Check for both players' scores every second
      const checkInterval = setInterval(() => {
        const storedScores = JSON.parse(localStorage.getItem(battleKey) || '{}')
        const scoreCount = Object.keys(storedScores).length
        
        console.log(`🎯 Checking scores: ${scoreCount} players completed`)
        setPlayerCount(scoreCount)
        
        if (scoreCount >= 2) {
          clearInterval(checkInterval)
          console.log("🎯 Both players completed, showing comparison")
          setPlayerScores(storedScores)
          setWaitingForResults(false)
          setBattleState("complete")
        }
      }, 1000)

      // Fallback: show results after 5 seconds even if only one player
      setTimeout(() => {
        clearInterval(checkInterval)
        const storedScores = JSON.parse(localStorage.getItem(battleKey) || '{}')
        if (Object.keys(storedScores).length === 1) {
          console.log("🎯 Fallback: showing results with single player")
          setPlayerScores(storedScores)
          setWaitingForResults(false)
          setBattleState("complete")
        }
      }, 5000)

    } catch (error) {
      console.error("❌ Error submitting score:", error)
      // Show error state to user
      alert(`Failed to submit score: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleManualCheck = () => {
    const battleKey = `battle_${roomId}`
    const storedScores = JSON.parse(localStorage.getItem(battleKey) || '{}')
    const scoreCount = Object.keys(storedScores).length
    
    console.log("🎯 Manual check - scores:", storedScores)
    setPlayerCount(scoreCount)
    
    if (scoreCount >= 2) {
      setPlayerScores(storedScores)
      setWaitingForResults(false)
      setBattleState("complete")
    }
  }

  const calculateFinalResults = () => {
    const scores = Object.values(playerScores)
    if (scores.length === 0) return

    console.log("🏆 Calculating final results:", scores)

    // Sort by score (highest first), then by time (fastest first), then by completion time
    const sortedScores = scores.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score
      }
      if (a.timeSpent !== b.timeSpent) {
        return a.timeSpent - b.timeSpent
      }
      return (a.completedAt || 0) - (b.completedAt || 0)
    })

    const winner = sortedScores[0]
    console.log(`🏆 Winner determined: ${winner.username} with ${winner.score}/${winner.totalQuestions} (${winner.accuracy}%) in ${winner.timeSpent}s`)
    
    // Call completion callback
    const scoreMap: { [userId: string]: number } = {}
    scores.forEach(score => {
      scoreMap[score.userId] = score.score
    })
    
    onBattleComplete?.(winner.userId, scoreMap)
    setBattleState("complete")
    resultsCalculatedRef.current = true
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (battleState === "waiting") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-400/20 rounded-full flex items-center justify-center mb-6"
        >
          <Target className="w-10 h-10 text-blue-400" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">Preparing Battle Quiz</h2>
        <p className="text-gray-400 text-lg">
          Get ready to test your knowledge on <strong>{topic}</strong>!
        </p>
        
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLimit)} time limit</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{battleData?.players?.length || 0} players</span>
          </div>
        </div>
      </motion.div>
    )
  }

  if (battleState === "quiz") {
    return (
      <div className="space-y-4">
        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2">
            <Clock className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-bold text-lg">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </motion.div>

        {/* Quiz Component */}
        {loadingQuiz ? (
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
              <p className="text-gray-400">Generating quiz questions...</p>
            </div>
          </motion.div>
        ) : quizData ? (
          <BattleQuiz
            quiz={quizData}
            onQuizComplete={handleQuizComplete}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center min-h-[400px]"
          >
            <div className="text-center space-y-4">
              <p className="text-red-400">Failed to load quiz. Please try again.</p>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  if (battleState === "waiting_for_others") {
    console.log("🎯 Rendering waiting_for_others state")
    
    if (waitingForResults && currentPlayerScore) {
      return (
        <WaitingForResults
          currentPlayerScore={currentPlayerScore}
          playerCount={playerCount}
          onManualCheck={handleManualCheck}
        />
      )
    }
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-8"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-400/20 rounded-full flex items-center justify-center mb-6"
        >
          <Trophy className="w-12 h-12 text-green-400" />
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
          <p className="text-gray-400 text-lg">
            Great job! Waiting for opponent to finish...
          </p>
        </div>

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-green-400 text-lg font-semibold"
        >
          Waiting for opponent...
        </motion.div>
      </motion.div>
    )
  }

  if (battleState === "complete") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-400/20 rounded-full flex items-center justify-center mb-6"
        >
          <Trophy className="w-10 h-10 text-green-400" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">Battle Complete!</h2>
        <p className="text-gray-400 text-lg">
          Thanks for participating in the {topic} battle!
        </p>
        
        <Button
          onClick={() => window.location.href = "/battle"}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
        >
          Back to Battle Lobby
        </Button>
      </motion.div>
    )
  }

  return null
}