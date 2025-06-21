"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Copy, Users, Clock, Wifi, CheckCircle, Share2, AlertCircle } from "lucide-react"
import { battleService, Battle } from "@/lib/battleService"

interface Player {
  id: string
  name: string
  avatar: string
  rank: number
  wins: number
}

interface MatchWaitingProps {
  roomId: string
  topic: string
  player: Player
  onOpponentJoined?: (opponent: Player) => void
}

export function MatchWaiting({ roomId, topic, player, onOpponentJoined }: MatchWaitingProps) {
  const [copied, setCopied] = useState(false)
  const [waitingTime, setWaitingTime] = useState(0)
  const [battle, setBattle] = useState<Battle | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const timer = setInterval(() => {
      setWaitingTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Listen for socket events
  useEffect(() => {
    const handleOpponentJoined = (event: CustomEvent) => {
      console.log("Opponent joined:", event.detail)
      // You can add logic here to handle opponent joining
    }

    const handleBattleUpdated = (event: CustomEvent) => {
      const updatedBattle = event.detail as Battle
      setBattle(updatedBattle)
      
      // Check if opponent joined
      if (updatedBattle.players.length === 2 && onOpponentJoined) {
        const opponent = updatedBattle.players.find(p => p.userId !== battleService.getCurrentUser()?.id)
        if (opponent) {
          const opponentPlayer: Player = {
            id: opponent.userId,
            name: opponent.username,
            avatar: "🧠",
            rank: Math.floor(Math.random() * 1000) + 500,
            wins: Math.floor(Math.random() * 50),
          }
          onOpponentJoined(opponentPlayer)
        }
      }
    }

    const handleBattleEnded = (event: CustomEvent) => {
      console.log("Battle ended:", event.detail)
    }

    // Add event listeners
    window.addEventListener("opponentJoined", handleOpponentJoined as EventListener)
    window.addEventListener("battleUpdated", handleBattleUpdated as EventListener)
    window.addEventListener("battleEnded", handleBattleEnded as EventListener)

    // Fetch initial battle data
    const fetchBattleData = async () => {
      try {
        const battleData = await battleService.getBattle(roomId)
        setBattle(battleData)
      } catch (err) {
        console.error("Error fetching battle data:", err)
        setError("Failed to load battle data")
      }
    }

    fetchBattleData()

    return () => {
      window.removeEventListener("opponentJoined", handleOpponentJoined as EventListener)
      window.removeEventListener("battleUpdated", handleBattleUpdated as EventListener)
      window.removeEventListener("battleEnded", handleBattleEnded as EventListener)
    }
  }, [roomId, onOpponentJoined])

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy room ID:", err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentPlayers = battle?.players || []
  const playerCount = currentPlayers.length

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </motion.div>
      )}

      {/* Waiting Animation */}
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mb-6 border-4 border-emerald-500/30"
        >
          <Users className="w-10 h-10 text-emerald-400" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">
          Waiting for Opponent
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="text-emerald-400"
          >
            ...
          </motion.span>
        </h2>
        <p className="text-gray-400">Share your room code or wait for someone to join!</p>
      </div>

      {/* Room Info Card */}
      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 backdrop-blur-sm">
        <CardContent className="p-8 space-y-6">
          {/* Room Details */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-lg px-4 py-2">
                {topic}
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                <Wifi className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-400">Room Code</p>
              <div className="flex items-center justify-center space-x-3">
                <code className="text-3xl font-bold text-white tracking-wider bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 px-6 py-3 rounded-lg border border-emerald-500/30">
                  {roomId}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyRoomId}
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              {copied && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-emerald-400"
                >
                  Room code copied!
                </motion.p>
              )}
            </div>
          </div>

          {/* Players List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white text-center">Players in Room</h3>
            <div className="space-y-3">
              {/* Current player */}
              <div className="flex items-center space-x-4 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <Avatar className="w-12 h-12 border-2 border-emerald-500/30">
                  <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-lg">
                    {player.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-white">{player.name}</p>
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">You</Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    Rank #{player.rank} • {player.wins} wins
                  </p>
                </div>
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>

              {/* Opponent slot */}
              {currentPlayers.length > 1 ? (
                // Show actual opponent
                currentPlayers
                  .filter(p => p.userId !== battleService.getCurrentUser()?.id)
                  .map((opponent, index) => (
                    <motion.div
                      key={opponent.userId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center space-x-4 p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20"
                    >
                      <Avatar className="w-12 h-12 border-2 border-cyan-500/30">
                        <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-lg">
                          🧠
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-white">{opponent.username}</p>
                          <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">Opponent</Badge>
                        </div>
                        <p className="text-sm text-gray-400">Ready to battle!</p>
                      </div>
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                    </motion.div>
                  ))
              ) : (
                // Show waiting slot
                <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 border-dashed">
                  <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-500">Waiting for opponent...</p>
                    <p className="text-sm text-gray-600">Room is open for anyone to join</p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                    className="w-3 h-3 bg-gray-500 rounded-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-sm text-gray-400">Waiting</p>
              <p className="font-bold text-white">{formatTime(waitingTime)}</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-sm text-gray-400">Players</p>
              <p className="font-bold text-white">{playerCount} / 2</p>
            </div>
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <Wifi className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-sm text-gray-400">Status</p>
              <p className="font-bold text-emerald-400">Live</p>
            </div>
          </div>

          {/* Share Button */}
          <Button
            variant="outline"
            onClick={handleCopyRoomId}
            className="w-full border-gray-600/50 text-gray-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Room Code
          </Button>
        </CardContent>
      </Card>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-2"
      >
        <p className="text-sm text-gray-400">
          🎯 <strong>Quick Tip:</strong> Share the room code with friends or wait for random players to join!
        </p>
        <p className="text-xs text-gray-500">Battle will start automatically when both players are ready</p>
      </motion.div>
    </div>
  )
}
