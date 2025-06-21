"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
// Update the import path if the file is located elsewhere, for example:
import { TopicSelector } from "../../components/battle/TopicSelector"
// Or, if the file does not exist, create 'TopicSelector.tsx' in 'src/components/battle/' with a default export.
import { CreateRoom } from "../../components/battle/CreateRoom"
import { JoinRoom } from "../../components/battle/JoinRoom"
import { MatchWaiting } from "../../components/battle/MatchWaiting"
import { VSIntro } from "../../components/battle/VSIntro"
import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Swords, Trophy, Users, Zap, Target, Crown, ArrowLeft } from "lucide-react"
import { battleService, User } from "@/lib/battleService"

type BattleState =
  | "topic-selection"
  | "mode-selection"
  | "create-room"
  | "join-room"
  | "waiting"
  | "match-found"
  | "vs-intro"

interface Player {
  id: string
  name: string
  avatar: string
  rank: number
  wins: number
}

export default function BattleRoyalePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [battleState, setBattleState] = useState<BattleState>("topic-selection")
  const [selectedTopic, setSelectedTopic] = useState<string>("")
  const [roomId, setRoomId] = useState<string>("")
  const [currentPlayer] = useState<Player>({
    id: "player1",
    name: "You",
    avatar: "🎯",
    rank: 1247,
    wins: 23,
  })
  const [opponent, setOpponent] = useState<Player | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      battleService.disconnect()
    }
  }, [])

  // Handle opponent joining
  const handleOpponentJoined = (newOpponent: Player) => {
    setOpponent(newOpponent)
    setBattleState("match-found")
  }

  // Auto transition to VS intro after match found
  useEffect(() => {
    if (battleState === "match-found") {
      const timer = setTimeout(() => {
        setBattleState("vs-intro")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [battleState])

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic)
    setBattleState("mode-selection")
  }

  const handleCreateRoom = (generatedRoomId: string) => {
    setRoomId(generatedRoomId)
    setBattleState("waiting")
  }

  const handleJoinRoom = (enteredRoomId: string) => {
    setRoomId(enteredRoomId)
    setBattleState("waiting")
  }

  const handleBack = () => {
    switch (battleState) {
      case "mode-selection":
        setBattleState("topic-selection")
        setSelectedTopic("")
        break
      case "create-room":
      case "join-room":
        setBattleState("mode-selection")
        break
      case "waiting":
        setBattleState("mode-selection")
        setRoomId("")
        setOpponent(null)
        battleService.disconnect()
        break
      case "vs-intro":
        setBattleState("topic-selection")
        setSelectedTopic("")
        setRoomId("")
        setOpponent(null)
        battleService.disconnect()
        break
      default:
        setBattleState("topic-selection")
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showSidebarToggle={false} />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-3 rounded-full shadow-lg">
              <Swords className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Battle Royale Quiz
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Challenge players worldwide in real-time quiz battles. Test your knowledge and climb the ranks!
          </p>
        </motion.div>

        {/* Back Button */}
        <AnimatePresence>
          {battleState !== "topic-selection" && (
            <motion.div
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
          {battleState === "topic-selection" && (
            <motion.div
              key="topic-selection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <TopicSelector onTopicSelect={handleTopicSelect} />
            </motion.div>
          )}

          {battleState === "mode-selection" && (
            <motion.div
              key="mode-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ModeSelection
                selectedTopic={selectedTopic}
                onCreateRoom={() => setBattleState("create-room")}
                onJoinRoom={() => setBattleState("join-room")}
              />
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
              <JoinRoom topic={selectedTopic} onRoomJoined={handleJoinRoom} />
            </motion.div>
          )}

          {battleState === "waiting" && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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

          {battleState === "vs-intro" && (
            <motion.div
              key="vs-intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <VSIntro player1={currentPlayer} player2={opponent!} topic={selectedTopic} roomId={roomId} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Mode Selection Component
function ModeSelection({
  selectedTopic,
  onCreateRoom,
  onJoinRoom,
}: {
  selectedTopic: string
  onCreateRoom: () => void
  onJoinRoom: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Choose Battle Mode</h2>
        <p className="text-gray-400">
          Topic: <span className="text-emerald-400 font-semibold">{selectedTopic}</span>
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
              <p className="text-gray-400">Start a new battle and wait for challengers to join</p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  1v1
                </span>
                <span className="flex items-center">
                  <Zap className="w-4 h-4 mr-1" />
                  Fast-paced
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
