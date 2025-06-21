"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Swords, Trophy, Target, Zap, Crown, Star, Timer } from "lucide-react"

interface Player {
  id: string
  name: string
  avatar: string
  rank: number
  wins: number
}

interface VSIntroProps {
  player1: Player
  player2: Player
  topic: string
  roomId: string
}

export function VSIntro({ player1, player2, topic, roomId }: VSIntroProps) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [battleStarted, setBattleStarted] = useState(false)

  const handleStartBattle = () => {
    setCountdown(3)
  }

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setBattleStarted(true)
    }
  }, [countdown])

  if (battleStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{ duration: 1 }}
          className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
        >
          <Zap className="w-12 h-12 text-white" />
        </motion.div>

        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Battle Started!</h2>
          <p className="text-gray-400">Good luck to both players! 🚀</p>
        </div>

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-emerald-400 text-lg font-semibold"
        >
          Loading first question...
        </motion.div>
      </motion.div>
    )
  }

  if (countdown !== null) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8"
      >
        <h2 className="text-3xl font-bold text-white">Get Ready!</h2>

        <motion.div
          key={countdown}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="w-32 h-32 mx-auto bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl"
        >
          <span className="text-6xl font-bold text-white">{countdown}</span>
        </motion.div>

        <p className="text-gray-400 text-lg">Battle starts in...</p>
      </motion.div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* VS Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500/20 to-orange-400/20 rounded-full flex items-center justify-center mb-4"
        >
          <Swords className="w-8 h-8 text-red-400" />
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-2">Battle Arena</h1>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-lg px-4 py-2">{topic}</Badge>
      </motion.div>

      {/* Players VS Section */}
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Player 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <div className="space-y-4">
                <Avatar className="w-24 h-24 mx-auto lg:mx-0 border-4 border-emerald-500/30 shadow-lg">
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-3xl">
                    {player1.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{player1.name}</h3>
                  <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">You</Badge>
                    <Badge className="bg-gray-700/50 text-gray-300 text-xs">
                      <Crown className="w-3 h-3 mr-1" />#{player1.rank}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <Trophy className="w-3 h-3 mr-1" />
                      {player1.wins} wins
                    </span>
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Expert
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* VS Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl mb-4"
              >
                <span className="text-3xl font-bold text-white">VS</span>
              </motion.div>
              <p className="text-gray-400 font-semibold">BATTLE ROYALE</p>
            </motion.div>

            {/* Player 2 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center lg:text-right"
            >
              <div className="space-y-4">
                <Avatar className="w-24 h-24 mx-auto lg:ml-auto lg:mr-0 border-4 border-cyan-500/30 shadow-lg">
                  <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-3xl">{player2.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{player2.name}</h3>
                  <div className="flex items-center justify-center lg:justify-end space-x-2 mb-2">
                    <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">Opponent</Badge>
                    <Badge className="bg-gray-700/50 text-gray-300 text-xs">
                      <Crown className="w-3 h-3 mr-1" />#{player2.rank}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center lg:justify-end space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <Trophy className="w-3 h-3 mr-1" />
                      {player2.wins} wins
                    </span>
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Master
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Battle Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/30">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <Target className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-sm text-gray-400">Questions</p>
                <p className="font-bold text-white">10</p>
              </div>
              <div className="space-y-2">
                <Timer className="w-6 h-6 text-cyan-400 mx-auto" />
                <p className="text-sm text-gray-400">Time per Q</p>
                <p className="font-bold text-white">30s</p>
              </div>
              <div className="space-y-2">
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto" />
                <p className="text-sm text-gray-400">Winner Gets</p>
                <p className="font-bold text-white">+50 XP</p>
              </div>
              <div className="space-y-2">
                <Zap className="w-6 h-6 text-purple-400 mx-auto" />
                <p className="text-sm text-gray-400">Difficulty</p>
                <p className="font-bold text-white">Expert</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Start Battle Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Button
          onClick={handleStartBattle}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold px-12 py-4 text-xl rounded-2xl shadow-2xl hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
        >
          <Swords className="w-6 h-6 mr-3" />
          START BATTLE!
        </Button>
        <p className="text-gray-400 mt-4">Both players are ready. Let the battle begin! ⚔️</p>
      </motion.div>

      {/* Room Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center text-sm text-gray-500"
      >
        Room ID: <code className="bg-gray-800/50 px-2 py-1 rounded">{roomId}</code>
      </motion.div>
    </div>
  )
}
