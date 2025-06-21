"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BattleQuiz } from "./BattleQuiz"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Target, 
  Users, 
  Clock,
  Zap,
  Crown
} from "lucide-react"
import { battleService } from "@/lib/battleService"
import { battleQuizService } from "@/lib/battleQuizService"

interface BattleQuizIntegrationProps {
  roomId: string
  topic: string
  onBattleComplete?: (winner: string, scores: { [userId: string]: number }) => void
}

interface PlayerScore {
  userId: string
  username: string
  score: number
  timeSpent: number
}

export function BattleQuizIntegration({ 
  roomId, 
  topic, 
  onBattleComplete 
}: BattleQuizIntegrationProps) {
  const [battleState, setBattleState] = useState<"waiting" | "quiz" | "results" | "complete">("waiting")
  const [playerScores, setPlayerScores] = useState<{ [userId: string]: PlayerScore }>({})
  const [currentUser, setCurrentUser] = useState(battleService.getCurrentUser())
  const [battleData, setBattleData] = useState(battleService.getCurrentBattle())
  const [timeLimit, setTimeLimit] = useState(300) // 5 minutes
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)

  useEffect(() => {
    // Listen for battle start event
    const handleBattleStarted = (event: CustomEvent) => {
      console.log("⚔️ Battle started, beginning quiz phase")
      setBattleState("quiz")
      setTimeRemaining(timeLimit)
    }

    window.addEventListener("battleStarted", handleBattleStarted as EventListener)

    return () => {
      window.removeEventListener("battleStarted", handleBattleStarted as EventListener)
    }
  }, [timeLimit])

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

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    if (!currentUser) return

    const timeSpent = timeLimit - timeRemaining
    const playerScore: PlayerScore = {
      userId: currentUser.id,
      username: currentUser.name,
      score,
      timeSpent
    }

    setPlayerScores(prev => ({
      ...prev,
      [currentUser.id]: playerScore
    }))

    // Emit score to other players
    battleService.emitQuestionAnswered(roomId, "quiz_complete", true)
    
    // Wait a bit for other players to finish, then show results
    setTimeout(() => {
      setBattleState("results")
      calculateFinalResults()
    }, 3000)
  }

  const calculateFinalResults = () => {
    const scores = Object.values(playerScores)
    if (scores.length === 0) return

    // Sort by score (highest first), then by time (fastest first)
    const sortedScores = scores.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score
      }
      return a.timeSpent - b.timeSpent
    })

    const winner = sortedScores[0]
    
    // Emit battle end
    battleService.emitBattleEnd(roomId, winner.userId)
    
    // Call completion callback
    const scoreMap: { [userId: string]: number } = {}
    scores.forEach(score => {
      scoreMap[score.userId] = score.score
    })
    
    onBattleComplete?.(winner.userId, scoreMap)
    setBattleState("complete")
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
        <BattleQuiz
          topic={topic}
          difficulty="intermediate"
          numQuestions={5}
          onQuizComplete={handleQuizComplete}
          onQuizError={(error) => console.error("Quiz error:", error)}
        />
      </div>
    )
  }

  if (battleState === "results") {
    const scores = Object.values(playerScores)
    const sortedScores = scores.sort((a, b) => b.score - a.score)
    const winner = sortedScores[0]

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        {/* Winner Announcement */}
        <div className="text-center space-y-4">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{ duration: 1 }}
            className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
          >
            <Crown className="w-12 h-12 text-white" />
          </motion.div>
          
          <h2 className="text-4xl font-bold text-white">Battle Results</h2>
          <p className="text-xl text-gray-400">
            Winner: <span className="text-yellow-400 font-bold">{winner?.username}</span>
          </p>
        </div>

        {/* Scoreboard */}
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Final Standings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedScores.map((player, index) => (
                <motion.div
                  key={player.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 
                      ? "bg-yellow-500/20 border border-yellow-500/30" 
                      : "bg-gray-800/30 border border-gray-700/30"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 
                        ? "bg-yellow-500 text-white" 
                        : "bg-gray-600 text-gray-300"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{player.username}</div>
                      <div className="text-gray-400 text-sm">
                        Time: {formatTime(player.timeSpent)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{player.score}/5</div>
                    <div className="text-gray-400 text-sm">
                      {Math.round((player.score / 5) * 100)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
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