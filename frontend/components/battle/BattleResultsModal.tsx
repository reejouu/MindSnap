"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  Trophy, 
  Crown, 
  Medal, 
  Star, 
  Award, 
  Zap, 
  Users,
  Target,
  Brain,
  CheckCircle,
  XCircle,
  ArrowLeft
} from "lucide-react"

interface BattleResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    players: Array<{
      userId: string;
      username: string;
      score: number;
      totalQuestions: number;
    }>;
    winner: any;
    isDraw: boolean;
    player1Accuracy: number;
    player2Accuracy: number;
    isFallback?: boolean;
  };
  currentUserId: string;
  onPlayAgain?: () => void;
  onBackToLobby?: () => void;
}

export function BattleResultsModal({ 
  isOpen, 
  onClose, 
  results, 
  currentUserId,
  onPlayAgain,
  onBackToLobby 
}: BattleResultsModalProps) {
  // Debug logging
  console.log("🏆 BattleResultsModal - Results:", results);
  console.log("🏆 BattleResultsModal - CurrentUserId:", currentUserId);
  console.log("🏆 BattleResultsModal - Players:", results.players);
  
  // Enhanced fallback logic with better player identification
  const currentPlayer = results.players.find(p => p.userId === currentUserId) || 
                       results.players.find(p => p.username === 'You') || 
                       results.players[0];
  
  const opponent = results.players.find(p => p.userId !== currentUserId && p.username !== 'You') || 
                   results.players[1] || 
                   (results.players.length === 1 ? null : results.players[0]);
  
  // Fallback: if we only have one player but we know there should be two,
  // create a placeholder for the opponent using any available data
  let finalOpponent = opponent;
  if (!finalOpponent && results.players.length === 1) {
    // Try to get opponent data from localStorage or sessionStorage if available
    const storedOpponentData = localStorage.getItem('battle_opponent_data') || 
                               sessionStorage.getItem('battle_opponent_data');
    if (storedOpponentData) {
      try {
        const parsedData = JSON.parse(storedOpponentData);
        finalOpponent = {
          userId: parsedData.userId || 'opponent',
          username: parsedData.username || 'Opponent',
          score: parsedData.score || 0,
          totalQuestions: parsedData.totalQuestions || 10
        };
      } catch (e) {
        console.log('Failed to parse stored opponent data');
      }
    }
  }
  
  const fallbackCurrentPlayer = currentPlayer?.username || 'You';
  const fallbackOpponent = finalOpponent?.username || 'Opponent';
  
  // Determine winner with enhanced logic
  let winner = null;
  let isWinner = false;
  
  if (currentPlayer && finalOpponent) {
    const currentAccuracy = (currentPlayer.score / currentPlayer.totalQuestions) * 100;
    const opponentAccuracy = (finalOpponent.score / finalOpponent.totalQuestions) * 100;
    
    if (currentAccuracy > opponentAccuracy) {
      winner = currentPlayer;
      isWinner = true;
    } else if (opponentAccuracy > currentAccuracy) {
      winner = finalOpponent;
      isWinner = false;
    } else {
      // Same accuracy, check score
      if (currentPlayer.score > finalOpponent.score) {
        winner = currentPlayer;
        isWinner = true;
      } else if (finalOpponent.score > currentPlayer.score) {
        winner = finalOpponent;
        isWinner = false;
      } else {
        // Draw
        winner = null;
        isWinner = false;
      }
    }
  }
  
  const currentPlayerAccuracy = currentPlayer ? (currentPlayer.score / currentPlayer.totalQuestions) * 100 : 0;
  const opponentAccuracy = finalOpponent ? (finalOpponent.score / finalOpponent.totalQuestions) * 100 : 0;
  const isFallback = results.isFallback || results.players.length === 1;
  
  if (!isOpen) return null;

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
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 space-y-8">
            {/* Winner Display */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              {isFallback ? (
                <div className="space-y-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <Trophy className="w-16 h-16 text-white" />
                  </motion.div>
                  <div className="text-4xl font-bold text-blue-400">🎯 Quiz Complete! 🎯</div>
                  <p className="text-xl text-gray-400">Great job completing the quiz!</p>
                </div>
              ) : results.isDraw ? (
                <div className="space-y-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <Medal className="w-16 h-16 text-white" />
                  </motion.div>
                  <div className="text-4xl font-bold text-yellow-400">🤝 It's a Draw! 🤝</div>
                  <p className="text-xl text-gray-400">Both players performed equally well!</p>
                </div>
              ) : isWinner ? (
                <div className="space-y-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <Crown className="w-16 h-16 text-white" />
                  </motion.div>
                  <div className="text-4xl font-bold text-green-400">🏆 You Won! 🏆</div>
                  <p className="text-xl text-gray-400">Congratulations! You're the champion!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <Trophy className="w-16 h-16 text-white" />
                  </motion.div>
                  <div className="text-4xl font-bold text-red-400">😔 You Lost 😔</div>
                  <p className="text-xl text-gray-400">Better luck next time! Keep practicing!</p>
                </div>
              )}
            </motion.div>

            {/* Score Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Current Player */}
              <div className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                isWinner ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20' : 
                results.isDraw ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20' : 
                'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
              }`}>
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Target className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">You</h3>
                    {isWinner && <Crown className="w-5 h-5 text-yellow-400" />}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-center">
                      {currentPlayer?.score}/{currentPlayer?.totalQuestions}
                    </div>
                    <div className="text-center text-gray-400">
                      {currentPlayerAccuracy.toFixed(1)}% Accuracy
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">{currentPlayer?.score} Correct</span>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">{currentPlayer ? currentPlayer.totalQuestions - currentPlayer.score : 0} Wrong</span>
                  </div>
                </div>
              </div>

              {/* Opponent or Placeholder */}
              {finalOpponent ? (
                <div className={`p-6 rounded-lg border-2 transition-all duration-300 ${
                  !isWinner && !results.isDraw ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20' : 
                  results.isDraw ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/20' : 
                  'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                }`}>
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Brain className="w-6 h-6 text-purple-400" />
                      <h3 className="text-xl font-bold text-white">{finalOpponent.username}</h3>
                      {!isWinner && !results.isDraw && <Crown className="w-5 h-5 text-yellow-400" />}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-center">
                        {finalOpponent.score}/{finalOpponent.totalQuestions}
                      </div>
                      <div className="text-center text-gray-400">
                        {opponentAccuracy.toFixed(1)}% Accuracy
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">{finalOpponent.score} Correct</span>
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">{finalOpponent.totalQuestions - finalOpponent.score} Wrong</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-lg border-2 border-gray-600/50 bg-gray-800/30">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Users className="w-6 h-6 text-gray-400" />
                      <h3 className="text-xl font-bold text-gray-400">Opponent</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-center text-gray-500">
                        Not Available
                      </div>
                      <div className="text-center text-gray-500">
                        Opponent may have disconnected
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Performance Summary */}
            {!isFallback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center p-6 bg-gray-800/30 rounded-lg border border-gray-700/30"
              >
                <h3 className="text-xl font-bold text-white mb-4">Battle Summary</h3>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.max(currentPlayer?.score || 0, finalOpponent?.score || 0)}
                    </div>
                    <div className="text-gray-400">Highest Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.max(currentPlayerAccuracy, opponentAccuracy).toFixed(1)}%
                    </div>
                    <div className="text-gray-400">Best Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {currentPlayer?.totalQuestions || finalOpponent?.totalQuestions || 10}
                    </div>
                    <div className="text-gray-400">Questions</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-8">
              <Button
                onClick={onPlayAgain}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
              >
                <Zap className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button
                onClick={onBackToLobby}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 font-semibold py-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Lobby
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 