import { motion } from "framer-motion"
import { Trophy, Clock, Users, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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

export function WaitingForResults({ 
  currentPlayerScore, 
  playerCount,
  onManualCheck 
}: WaitingForResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full"
      >
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
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

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Quiz Completed!</h1>
              <p className="text-gray-400 text-lg">
                {playerCount === 1 
                  ? "Waiting for opponent to finish..." 
                  : "Both players completed! Preparing results..."
                }
              </p>
            </div>
          </div>

          {/* Current Player Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-bold text-white">Your Score</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {currentPlayerScore.score}/{currentPlayerScore.totalQuestions}
                      </div>
                      <div className="text-sm text-gray-400">Correct</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {currentPlayerScore.accuracy}%
                      </div>
                      <div className="text-sm text-gray-400">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {formatTime(currentPlayerScore.timeSpent)}
                      </div>
                      <div className="text-sm text-gray-400">Time</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center space-x-2 text-green-400 text-lg font-semibold">
              <Users className="w-5 h-5" />
              <span>{playerCount}/2 Players Completed</span>
            </div>
            
            <div className="flex items-center justify-center space-x-2 text-blue-400">
              <Clock className="w-4 h-4" />
              <span>Checking for results...</span>
            </div>
          </motion.div>

          {/* Manual Check Button */}
          {onManualCheck && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <button
                onClick={onManualCheck}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
              >
                <Target className="w-4 h-4 inline mr-2" />
                Check Results Now
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
} 