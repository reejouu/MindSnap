"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
// Update the import path if the file is located elsewhere, for example:
import { TopicSelector } from "../../components/battle/TopicSelector"
// Or, if the file does not exist, create 'TopicSelector.tsx' in 'src/components/battle/' with a default export.
import { CreateRoom } from "../../components/battle/CreateRoom"
import { JoinRoom } from "../../components/battle/JoinRoom"
import { MatchWaiting } from "../../components/battle/MatchWaiting"
import { VSIntro } from "../../components/battle/VSIntro"
import { QuizTopicInput } from "../../components/battle/QuizTopicInput"
import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Swords, Trophy, Users, Zap, Target, Crown, ArrowLeft } from "lucide-react"
import { battleService, User } from "@/lib/battleService"
import { BattleQuiz } from "../../components/battle/BattleQuiz"
import { BattleResultsModal } from "../../components/battle/BattleResultsModal"
import { toast } from "sonner"

type BattleState =
  | "mode-selection"
  | "quiz-topic-input"
  | "create-room"
  | "join-room"
  | "waiting"
  | "match-found"
  | "vs-intro"
  | "battle-quiz"

interface Player {
  id: string
  name: string
  avatar: string
  rank: number
  wins: number
}

export default function BattleRoyalePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [battleState, setBattleState] = useState<BattleState>("mode-selection")
  const [selectedTopic, setSelectedTopic] = useState<string>("")
  const [roomId, setRoomId] = useState<string>("")
  const [isRoomCreator, setIsRoomCreator] = useState(false)
  const [opponent, setOpponent] = useState<Player | null>(null)
  const [quiz, setQuiz] = useState<any>(null)
  const [currentPlayer] = useState<Player>({
    id: "player1",
    name: "You",
    avatar: "🎯",
    rank: 1247,
    wins: 23,
  })
  const battleStartedTriggeredRef = useRef(false)
  const [battleResults, setBattleResults] = useState<any>(null)
  const [opponentCompleted, setOpponentCompleted] = useState<any>(null)
  const [opponentCompletedStatus, setOpponentCompletedStatus] = useState<any>(null)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizScore, setQuizScore] = useState<any>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      battleService.disconnect()
    }
  }, [])

  // Reset battle started ref when battle state changes
  useEffect(() => {
    if (battleState === "mode-selection" || battleState === "waiting") {
      console.log("🔄 Main page - Resetting battle started ref")
      battleStartedTriggeredRef.current = false
    }
  }, [battleState])

  // Handle opponent joining
  const handleOpponentJoined = (newOpponent: Player) => {
    console.log("🎯 Main page - Opponent joined:", newOpponent)
    setOpponent(newOpponent)
    setBattleState("match-found")
  }

  // Listen for battle ready event to synchronize all players
  useEffect(() => {
    const handleBattleReady = (event: CustomEvent) => {
      console.log("🚀 Battle ready event received in main page:", event.detail)
      const { players, battleId } = event.detail
      
      // Find the opponent from the players list
      const currentUser = battleService.getCurrentUser()
      console.log("🔍 Current user in main page:", currentUser)
      const foundOpponent = players.find((p: { userId: string; username: string }) => p.userId !== currentUser?.id)
      
      console.log(`🎯 Found opponent: ${foundOpponent ? foundOpponent.username : 'none'}, current opponent state: ${opponent ? opponent.name : 'none'}`)
      
      // Only set opponent and match-found if we don't already have an opponent
      if (foundOpponent && !opponent) {
        console.log("🎯 Setting opponent and transitioning to match-found")
        const opponentPlayer: Player = {
          id: foundOpponent.userId,
          name: foundOpponent.username,
          avatar: "🧠",
          rank: Math.floor(Math.random() * 1000) + 500,
          wins: Math.floor(Math.random() * 50),
        }
        setOpponent(opponentPlayer)
        setBattleState("match-found")
      } else {
        console.log("❌ Not setting opponent - already exists or no opponent found")
      }
    }

    // Listen for battle started event to receive quiz data
    const handleBattleStarted = (event: CustomEvent) => {
      console.log("⚔️ Battle started event received in main page:", event.detail)
      
      // Prevent duplicate state transitions
      if (battleStartedTriggeredRef.current) {
        console.log("⚔️ Main page - Battle already started, ignoring duplicate event")
        return
      }
      
      const { quiz } = event.detail
      console.log("⚔️ Main page - Quiz data received:", quiz ? "YES" : "NO")
      if (quiz) {
        console.log("📝 Quiz received in main page, transitioning to battle-quiz")
        console.log("📝 Current battle state:", battleState)
        battleStartedTriggeredRef.current = true
        setQuiz(quiz)
        setBattleState("battle-quiz")
      } else {
        console.error("❌ No quiz data received in battle started event")
      }
    }

    window.addEventListener("battleReady", handleBattleReady as EventListener)
    window.addEventListener("battleStarted", handleBattleStarted as EventListener)

    // NEW: Handle battle results when both players complete
    const handleBattleResults = (event: CustomEvent) => {
      console.log("🏆 Battle results received:", event.detail)
      setBattleResults(event.detail)
      setQuizCompleted(false) // Reset quiz completed state
    }

    // NEW: Handle opponent completion notification
    const handleOpponentCompleted = (event: CustomEvent) => {
      console.log("⏳ Opponent completed quiz:", event.detail)
      setOpponentCompleted(event.detail)
      setOpponentCompletedStatus(event.detail) // Persistent status for BattleQuiz
      
      // Store opponent data for potential fallback use
      const opponentData = {
        userId: 'opponent',
        username: event.detail.username,
        score: event.detail.score,
        totalQuestions: event.detail.totalQuestions
      };
      localStorage.setItem('battle_opponent_data', JSON.stringify(opponentData));
      
      // Auto-dismiss the notification after 5 seconds
      setTimeout(() => {
        setOpponentCompleted(null)
      }, 5000)
    }

    window.addEventListener("battleResults", handleBattleResults as EventListener)
    window.addEventListener("opponentCompleted", handleOpponentCompleted as EventListener)

    return () => {
      window.removeEventListener("battleReady", handleBattleReady as EventListener)
      window.removeEventListener("battleStarted", handleBattleStarted as EventListener)
      window.removeEventListener("battleResults", handleBattleResults as EventListener)
      window.removeEventListener("opponentCompleted", handleOpponentCompleted as EventListener)
    }
  }, [opponent])

  // Fallback timeout for battle results (in case socket events fail)
  useEffect(() => {
    if (quizCompleted && quizScore && !battleResults) {
      const timeout = setTimeout(() => {
        console.log("⏰ Fallback timeout triggered - showing individual results")
        // Create a fallback result showing individual performance
        setBattleResults({
          players: [
            {
              userId: currentPlayer.id,
              username: currentPlayer.name,
              score: quizScore.score,
              totalQuestions: quizScore.totalQuestions
            }
          ],
          winner: null,
          isDraw: false,
          player1Accuracy: (quizScore.score / quizScore.totalQuestions) * 100,
          player2Accuracy: 0,
          isFallback: true
        })
      }, 15000) // 15 seconds timeout

      return () => clearTimeout(timeout)
    }
  }, [quizCompleted, quizScore, battleResults, currentPlayer])

  // Auto transition to VS intro after match found
  useEffect(() => {
    if (battleState === "match-found") {
      const timer = setTimeout(() => {
        setBattleState("vs-intro")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [battleState])

  const handleTopicSubmit = (topic: string) => {
    setSelectedTopic(topic)
    setBattleState("create-room")
  }

  const handleBattleStart = useCallback((generatedQuiz: any) => {
    setQuiz(generatedQuiz)
    setBattleState("battle-quiz")
  }, [])

  const handleCreateRoom = (generatedRoomId: string) => {
    setRoomId(generatedRoomId)
    setIsRoomCreator(true)
    setBattleState("waiting")
  }

  const handleJoinRoom = (enteredRoomId: string) => {
    setRoomId(enteredRoomId)
    setIsRoomCreator(false)
    setBattleState("waiting")
  }

  const handleBack = () => {
    switch (battleState) {
      case "quiz-topic-input":
        setBattleState("mode-selection")
        setSelectedTopic("")
        break
      case "create-room":
        setBattleState("quiz-topic-input")
        break
      case "join-room":
        setBattleState("mode-selection")
        break
      case "waiting":
        setBattleState(isRoomCreator ? "create-room" : "mode-selection")
        setRoomId("")
        setOpponent(null)
        battleService.disconnect()
        break
      case "vs-intro":
        setBattleState("mode-selection")
        setSelectedTopic("")
        setRoomId("")
        setOpponent(null)
        battleService.disconnect()
        break
      default:
        setBattleState("mode-selection")
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showSidebarToggle={false} />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header and Back Button */}
        <AnimatePresence mode="wait">
          {battleState === "mode-selection" && (
            <motion.div
              key="header-mode-selection"
              className="text-center mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-5 rounded-full shadow-lg">
                  <Swords className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1
                className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-8 pt-2"
                style={{ position: "relative", top: "-8px", paddingBottom: "8px" }}
              >
                Battle Royale Quiz
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Challenge players worldwide in real-time quiz battles. Test your knowledge and climb the ranks!
              </p>
            </motion.div>
          )}

          {battleState !== "mode-selection" && (
            <motion.div
              key="back-button"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-6"
            >
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-gray-300 hover:text-white hover:bg-emerald-500/10 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {battleState === "mode-selection" && (
            <motion.div
              key="mode-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ModeSelection
                onCreateRoom={() => setBattleState("quiz-topic-input")}
                onJoinRoom={() => setBattleState("join-room")}
              />
            </motion.div>
          )}

          {battleState === "quiz-topic-input" && (
            <motion.div
              key="quiz-topic-input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuizTopicInput onTopicSubmit={handleTopicSubmit} />
            </motion.div>
          )}

          {battleState === "create-room" && (
            <motion.div
              key="create-room"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CreateRoom topic={selectedTopic} onRoomCreated={handleCreateRoom} />
            </motion.div>
          )}

          {battleState === "join-room" && (
            <motion.div
              key="join-room"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <JoinRoom onRoomJoined={handleJoinRoom} />
            </motion.div>
          )}

          {battleState === "waiting" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <MatchWaiting
                roomId={roomId}
                topic={selectedTopic}
                player={currentPlayer}
                onOpponentJoined={handleOpponentJoined}
              />
            </motion.div>
          )}

          {battleState === "match-found" && (
            <motion.div
              key="match-found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <MatchFound opponent={opponent!} />
            </motion.div>
          )}

          {battleState === "vs-intro" && opponent && (
            <motion.div
              key={`vs-intro-${roomId || 'default'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <VSIntro
                player1={currentPlayer}
                player2={opponent}
                topic={selectedTopic}
                roomId={roomId}
                onBattleStart={handleBattleStart}
              />
            </motion.div>
          )}

          {battleState === "battle-quiz" && (!quiz || !quiz.quiz || quiz.quiz.length === 0) && (
            <motion.div
              key="battle-quiz-loading"
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
                <p className="text-gray-400">Loading quiz questions...</p>
              </div>
            </motion.div>
          )}

          {battleState === "battle-quiz" && quiz && (
            <motion.div
              key={`battle-quiz-${roomId || 'default'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BattleQuiz
                quiz={quiz}
                battleId={roomId}
                currentUserId={currentPlayer.id}
                currentUsername={currentPlayer.name}
                opponentCompleted={opponentCompletedStatus}
                onQuizComplete={(score, totalQuestions) => {
                  console.log("🎯 Quiz completed with score:", score, "/", totalQuestions)
                  setQuizCompleted(true)
                  setQuizScore({ score, totalQuestions })
                }}
              />
            </motion.div>
          )}

          {/* Battle Results Modal */}
          {battleResults && (
            <BattleResultsModal
              isOpen={true}
              onClose={() => {
                setBattleResults(null)
                setOpponentCompleted(null)
                setOpponentCompletedStatus(null)
                setQuizCompleted(false)
                setQuizScore(null)
              }}
              results={battleResults}
              currentUserId={currentPlayer.id}
              onPlayAgain={() => {
                setBattleResults(null)
                setOpponentCompleted(null)
                setOpponentCompletedStatus(null)
                setQuizCompleted(false)
                setQuizScore(null)
                setBattleState("mode-selection")
                setSelectedTopic("")
                setRoomId("")
                setOpponent(null)
                setQuiz(null)
                battleService.disconnect()
              }}
              onBackToLobby={() => {
                setBattleResults(null)
                setOpponentCompleted(null)
                setOpponentCompletedStatus(null)
                setQuizCompleted(false)
                setQuizScore(null)
                setBattleState("mode-selection")
                setSelectedTopic("")
                setRoomId("")
                setOpponent(null)
                setQuiz(null)
                battleService.disconnect()
              }}
            />
          )}

          {/* Opponent Completed Notification - Non-blocking banner */}
          {opponentCompleted && !battleResults && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
            >
              <div className="bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm rounded-xl border border-blue-400/30 p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">⏳</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">Opponent Finished!</h3>
                      <p className="text-blue-100 text-xs">
                        {opponentCompleted.username} completed with {opponentCompleted.score}/{opponentCompleted.totalQuestions} correct
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpponentCompleted(null)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Mode Selection Component
function ModeSelection({
  onCreateRoom,
  onJoinRoom,
}: {
  onCreateRoom: () => void
  onJoinRoom: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Choose Battle Mode</h2>
        <p className="text-gray-400">
          Create a new battle room or join an existing one
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 border-emerald-500/30 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group"
            onClick={onCreateRoom}
          >
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/20 to-emerald-400/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Crown className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Create Battle Room</h3>
              <p className="text-gray-400">Start a new battle and set your own quiz topic</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  1v1
                </span>
                <span className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  Custom Topic
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="bg-gradient-to-br from-cyan-500/10 to-cyan-400/5 border-cyan-500/30 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
            onClick={onJoinRoom}
          >
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500/20 to-cyan-400/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Join Battle Room</h3>
              <p className="text-gray-400">Enter a room code to join an existing battle</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Trophy className="w-4 h-4 mr-1" />
                  Competitive
                </span>
                <span className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  Instant
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

// Match Found Component
function MatchFound({ opponent }: { opponent: Player }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
      >
        <Trophy className="w-10 h-10 text-white" />
      </motion.div>

      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Match Found!</h2>
        <p className="text-gray-400">
          Opponent: <span className="text-cyan-400 font-semibold">{opponent.name}</span>
        </p>
      </div>

      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        className="text-emerald-400 text-lg font-semibold"
      >
        Preparing battle arena...
      </motion.div>
    </motion.div>
  )
}
