"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Copy, Users, Clock, Wifi, CheckCircle, Share2, AlertCircle } from "lucide-react"
import { battleService, Battle, BattlePlayer } from "@/lib/battleService"

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
  const [socketPlayers, setSocketPlayers] = useState<BattlePlayer[]>([])
  const [opponentJoined, setOpponentJoined] = useState(false)
  const opponentJoinedRef = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setWaitingTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Periodic socket connection check
  useEffect(() => {
    const checkSocketConnection = () => {
      if (!battleService.isConnected()) {
        console.log("⚠️ Socket connection lost, attempting to reconnect...")
        const currentUser = battleService.getCurrentUser()
        if (currentUser) {
          battleService.connect(currentUser).then(() => {
            console.log("✅ Socket reconnected")
            // Rejoin the room after reconnection
            battleService.rejoinSocketRoom(roomId)
          })
        }
      }
    }

    // Check every 5 seconds
    const interval = setInterval(checkSocketConnection, 5000)
    
    return () => clearInterval(interval)
  }, [roomId])

  // Listen for socket events
  useEffect(() => {
    const handleOpponentJoined = (event: CustomEvent) => {
      console.log("🎯 Opponent joined event received:", event.detail)
      const { username, userId } = event.detail
      
      // Prevent duplicate triggers
      if (opponentJoinedRef.current) {
        console.log("🎯 Opponent already joined, ignoring duplicate event")
        return
      }
      
      // Create opponent player object
      const opponentPlayer: Player = {
        id: userId,
        name: username,
        avatar: "🧠",
        rank: Math.floor(Math.random() * 1000) + 500,
        wins: Math.floor(Math.random() * 50),
      }
      
      console.log("🎯 Setting opponent joined to true and calling onOpponentJoined")
      opponentJoinedRef.current = true
      setOpponentJoined(true)
      
      if (onOpponentJoined) {
        onOpponentJoined(opponentPlayer)
      }
    }

    const handleBattlePlayersUpdated = (event: CustomEvent) => {
      console.log("📊 Battle players updated event received:", event.detail)
      const { players, playerCount } = event.detail
      setSocketPlayers(players)
      
      console.log(`📊 Current players: ${playerCount}, opponentJoined: ${opponentJoinedRef.current}`)
      
      // If we have 2 players and haven't triggered opponent joined yet
      if (playerCount === 2 && !opponentJoinedRef.current && onOpponentJoined) {
        const currentUser = battleService.getCurrentUser()
        console.log("🔍 Current user:", currentUser)
        const opponent = players.find(p => p.userId !== currentUser?.id)
        
        if (opponent) {
          console.log("🎯 Found opponent in players list:", opponent)
          const opponentPlayer: Player = {
            id: opponent.userId,
            name: opponent.username,
            avatar: "🧠",
            rank: Math.floor(Math.random() * 1000) + 500,
            wins: Math.floor(Math.random() * 50),
          }
          opponentJoinedRef.current = true
          setOpponentJoined(true)
          onOpponentJoined(opponentPlayer)
        } else {
          console.log("❌ No opponent found in players list")
        }
      }
    }

    const handleBattleReady = (event: CustomEvent) => {
      console.log("🚀 Battle ready event received:", event.detail)
      const { players, battleId } = event.detail
      
      console.log(`🚀 Battle ready - players: ${players.length}, opponentJoined: ${opponentJoinedRef.current}`)
      
      // Ensure we have 2 players and haven't triggered opponent joined yet
      if (players.length === 2 && !opponentJoinedRef.current && onOpponentJoined) {
        const currentUser = battleService.getCurrentUser()
        console.log("🔍 Current user in battle ready:", currentUser)
        const opponent = players.find(p => p.userId !== currentUser?.id)
        
        if (opponent) {
          console.log("🚀 Battle ready - found opponent:", opponent)
          const opponentPlayer: Player = {
            id: opponent.userId,
            name: opponent.username,
            avatar: "🧠",
            rank: Math.floor(Math.random() * 1000) + 500,
            wins: Math.floor(Math.random() * 50),
          }
          opponentJoinedRef.current = true
          setOpponentJoined(true)
          onOpponentJoined(opponentPlayer)
        } else {
          console.log("❌ No opponent found in battle ready")
        }
      }
    }

    const handleBattleStarted = (event: CustomEvent) => {
      console.log("⚔️ Battle started event received:", event.detail)
      // This event can be used for additional synchronization if needed
    }

    const handleBattleUpdated = (event: CustomEvent) => {
      const updatedBattle = event.detail as Battle
      setBattle(updatedBattle)
    }

    const handleBattleEnded = (event: CustomEvent) => {
      console.log("🏁 Battle ended:", event.detail)
    }

    // Add event listeners
    window.addEventListener("opponentJoined", handleOpponentJoined as EventListener)
    window.addEventListener("battlePlayersUpdated", handleBattlePlayersUpdated as EventListener)
    window.addEventListener("battleReady", handleBattleReady as EventListener)
    window.addEventListener("battleStarted", handleBattleStarted as EventListener)
    window.addEventListener("battleUpdated", handleBattleUpdated as EventListener)
    window.addEventListener("battleEnded", handleBattleEnded as EventListener)

    // Fetch initial battle data
    const fetchBattleData = async () => {
      try {
        console.log("🔍 Fetching initial battle data for room:", roomId)
        const battleData = await battleService.getBattle(roomId)
        setBattle(battleData)
        
        console.log("📊 Initial battle data:", battleData)
        
        // If battle already has 2 players, trigger opponent joined
        if (battleData && battleData.players.length === 2 && !opponentJoinedRef.current && onOpponentJoined) {
          const currentUser = battleService.getCurrentUser()
          console.log("🔍 Current user in initial data:", currentUser)
          const opponent = battleData.players.find(p => p.userId !== currentUser?.id)
          
          if (opponent) {
            console.log("🎯 Found opponent in initial battle data:", opponent)
            const opponentPlayer: Player = {
              id: opponent.userId,
              name: opponent.username,
              avatar: "🧠",
              rank: Math.floor(Math.random() * 1000) + 500,
              wins: Math.floor(Math.random() * 50),
            }
            opponentJoinedRef.current = true
            setOpponentJoined(true)
            onOpponentJoined(opponentPlayer)
          } else {
            console.log("❌ No opponent found in initial battle data")
          }
        }
      } catch (err) {
        console.error("❌ Error fetching battle data:", err)
        setError("Failed to load battle data")
      }
    }

    fetchBattleData()

    return () => {
      window.removeEventListener("opponentJoined", handleOpponentJoined as EventListener)
      window.removeEventListener("battlePlayersUpdated", handleBattlePlayersUpdated as EventListener)
      window.removeEventListener("battleReady", handleBattleReady as EventListener)
      window.removeEventListener("battleStarted", handleBattleStarted as EventListener)
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

  // Use socket players if available, otherwise fall back to battle players
  const currentPlayers = socketPlayers.length > 0 ? socketPlayers : (battle?.players || [])
  const playerCount = currentPlayers.length
  const currentUser = battleService.getCurrentUser()

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
          {playerCount >= 2 ? "Ready to Start!" : "Waiting for Opponent"}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="text-emerald-400"
          >
            {playerCount >= 2 ? "" : "..."}
          </motion.span>
        </h2>
        <p className="text-gray-400">
          {playerCount >= 2 
            ? "Both players are ready! Battle will start soon." 
            : "Share your room code or wait for someone to join!"
          }
        </p>
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
                  .filter(p => p.userId !== currentUser?.id)
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

      {/* Debug Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30"
      >
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Debug Info</h4>
        <div className="text-xs space-y-1 text-gray-400">
          <p>Opponent Joined: {opponentJoined ? '✅ Yes' : '❌ No'}</p>
          <p>Socket Players: {socketPlayers.length}</p>
          <p>Battle Players: {battle?.players?.length || 0}</p>
          <p>Current User: {battleService.getCurrentUser()?.name || 'Unknown'}</p>
          <p>Socket Connected: {battleService.isConnected() ? '✅ Yes' : '❌ No'}</p>
        </div>
        
        {/* Manual trigger buttons */}
        <div className="mt-3 pt-3 border-t border-gray-700/30 space-y-2">
          <Button
            onClick={() => {
              console.log("🔧 Manual trigger: Refreshing battle data")
              battleService.refreshBattleData(roomId).then(updatedBattle => {
                console.log("🔧 Updated battle data:", updatedBattle)
                if (updatedBattle) {
                  setBattle(updatedBattle)
                }
              })
            }}
            className="w-full text-xs py-1 bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
          >
            🔄 Refresh Battle Data
          </Button>
          
          <Button
            onClick={() => {
              console.log("🔧 Manual trigger: Triggering battle ready")
              battleService.triggerBattleReady(roomId)
            }}
            className="w-full text-xs py-1 bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
          >
            🚀 Trigger Battle Ready
          </Button>
          
          <Button
            onClick={() => {
              console.log("🔧 Manual trigger: Rejoining socket room")
              battleService.rejoinSocketRoom(roomId)
            }}
            className="w-full text-xs py-1 bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30"
          >
            🔗 Rejoin Socket Room
          </Button>
          
          <Button
            onClick={() => {
              console.log("🔧 Manual trigger: Force opponent joined")
              if (battle && battle.players.length === 2 && onOpponentJoined) {
                const currentUser = battleService.getCurrentUser()
                const opponent = battle.players.find(p => p.userId !== currentUser?.id)
                if (opponent && !opponentJoinedRef.current) {
                  console.log("🔧 Force triggering opponent joined for:", opponent.username)
                  const opponentPlayer: Player = {
                    id: opponent.userId,
                    name: opponent.username,
                    avatar: "🧠",
                    rank: Math.floor(Math.random() * 1000) + 500,
                    wins: Math.floor(Math.random() * 50),
                  }
                  opponentJoinedRef.current = true
                  setOpponentJoined(true)
                  onOpponentJoined(opponentPlayer)
                }
              }
            }}
            className="w-full text-xs py-1 bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30"
          >
            🎯 Force Opponent Joined
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
