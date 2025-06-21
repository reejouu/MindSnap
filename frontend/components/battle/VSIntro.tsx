"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Swords, Trophy, Target, Zap, Crown, Star, Timer, Clock } from "lucide-react"
import { battleService } from "@/lib/battleService"

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
  onBattleStart: (quiz: any) => void
}

export function VSIntro({ player1, player2, topic, roomId, onBattleStart }: VSIntroProps) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const [battleStarted, setBattleStarted] = useState(false)
  const [isRoomCreator, setIsRoomCreator] = useState(false)
  const [waitingForCreator, setWaitingForCreator] = useState(false)
  const [error, setError] = useState<string>("")
  const battleReadyTriggeredRef = useRef(false)

  // Check if current user is the room creator (first player)
  useEffect(() => {
    const currentUser = battleService.getCurrentUser()
    const currentBattle = battleService.getCurrentBattle()
    
    console.log("🔍 VSIntro - Current user:", currentUser)
    console.log("🔍 VSIntro - Current battle:", currentBattle)
    
    if (currentUser && currentBattle) {
      // Room creator is the first player in the battle
      const isCreator = currentBattle.players[0]?.userId === currentUser.id
      setIsRoomCreator(isCreator)
      setWaitingForCreator(!isCreator)
      console.log(`🎯 User ${currentUser.name} is ${isCreator ? 'room creator' : 'joiner'}`)
      console.log(`🎯 Battle players:`, currentBattle.players)
      
      // If we have 2 players but no opponent is set in the main page, trigger opponent joined
      if (currentBattle.players.length === 2 && !battleReadyTriggeredRef.current) {
        const opponent = currentBattle.players.find(p => p.userId !== currentUser.id)
        if (opponent) {
          console.log("🎯 VSIntro - Found opponent in battle data:", opponent.username)
          console.log("🎯 VSIntro - Triggering battle ready event")
          battleReadyTriggeredRef.current = true
          // Dispatch battle ready event to trigger opponent setting in main page
          window.dispatchEvent(new CustomEvent("battleReady", { 
            detail: { 
              players: currentBattle.players.map(p => ({ userId: p.userId, username: p.username })),
              battleId: currentBattle._id
            }
          }))
        }
      }
    } else {
      console.log("❌ Could not determine room creator status")
      console.log("❌ Current user:", currentUser)
      console.log("❌ Current battle:", currentBattle)
      // Fallback: if we can't determine, assume current user is creator
      setIsRoomCreator(true)
      setWaitingForCreator(false)
    }
  }, [])

  // Refresh battle data periodically to ensure we have latest player info
  useEffect(() => {
    const refreshBattleData = async () => {
      try {
        console.log("🔄 VSIntro - Refreshing battle data for room:", roomId)
        const updatedBattle = await battleService.getBattle(roomId)
        if (updatedBattle) {
          console.log("🔄 VSIntro - Updated battle data:", updatedBattle)
          const currentUser = battleService.getCurrentUser()
          if (currentUser && updatedBattle.players.length >= 2) {
            const isCreator = updatedBattle.players[0]?.userId === currentUser.id
            setIsRoomCreator(isCreator)
            setWaitingForCreator(!isCreator)
            console.log(`🔄 VSIntro - Updated: User ${currentUser.name} is ${isCreator ? 'room creator' : 'joiner'}`)
            
            // Update the current battle in the service
            battleService.setCurrentBattle(updatedBattle)
            
            // If we have 2 players but haven't triggered battle ready yet, trigger it
            if (updatedBattle.players.length === 2 && !battleReadyTriggeredRef.current) {
              const opponent = updatedBattle.players.find(p => p.userId !== currentUser.id)
              if (opponent) {
                console.log("🎯 VSIntro - Found opponent in refresh, triggering battle ready")
                battleReadyTriggeredRef.current = true
                window.dispatchEvent(new CustomEvent("battleReady", { 
                  detail: { 
                    players: updatedBattle.players.map(p => ({ userId: p.userId, username: p.username })),
                    battleId: updatedBattle._id
                  }
                }))
              }
            }
          }
        }
      } catch (error) {
        console.error("❌ VSIntro - Error refreshing battle data:", error)
      }
    }

    // Only refresh if we haven't triggered battle ready yet
    if (!battleReadyTriggeredRef.current) {
      // Refresh immediately and then every 5 seconds (reduced frequency)
      refreshBattleData()
      const interval = setInterval(() => {
        if (!battleReadyTriggeredRef.current) {
          refreshBattleData()
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [roomId, battleReadyTriggeredRef])

  // Listen for countdown events from socket
  useEffect(() => {
    const handleBattleCountdown = (event: CustomEvent) => {
      console.log("⏰ VSIntro - Received countdown event:", event.detail)
      const { countdown } = event.detail
      setCountdown(countdown)
      setWaitingForCreator(false)
    }

    const handleBattleStarted = (event: CustomEvent) => {
      console.log("⚔️ VSIntro - Battle started event received:", event.detail)
      const { quiz } = event.detail
      console.log("⚔️ VSIntro - Quiz data received:", quiz ? "YES" : "NO")
      setBattleStarted(true)
      setCountdown(null)
      setWaitingForCreator(false)
      if (quiz) {
        console.log("⚔️ VSIntro - Calling onBattleStart with quiz data")
        onBattleStart(quiz)
      } else {
        console.error("❌ VSIntro - No quiz data in battle started event")
      }
    }

    const handleBattlePlayersUpdated = (event: CustomEvent) => {
      console.log("📊 VSIntro - Battle players updated:", event.detail)
      // Update battle data if needed
      const currentBattle = battleService.getCurrentBattle()
      if (currentBattle) {
        console.log("📊 VSIntro - Current battle players:", currentBattle.players)
      }
    }

    const handleBattleReady = (event: CustomEvent) => {
      console.log("🚀 VSIntro - Battle ready event received:", event.detail)
      // Ensure we're not waiting for creator if battle is ready
      setWaitingForCreator(false)
      // Mark that battle ready has been triggered to stop refresh loop
      battleReadyTriggeredRef.current = true
    }

    window.addEventListener("battleCountdown", handleBattleCountdown as EventListener)
    window.addEventListener("battleStarted", handleBattleStarted as EventListener)
    window.addEventListener("battlePlayersUpdated", handleBattlePlayersUpdated as EventListener)
    window.addEventListener("battleReady", handleBattleReady as EventListener)

    return () => {
      window.removeEventListener("battleCountdown", handleBattleCountdown as EventListener)
      window.removeEventListener("battleStarted", handleBattleStarted as EventListener)
      window.removeEventListener("battlePlayersUpdated", handleBattlePlayersUpdated as EventListener)
      window.removeEventListener("battleReady", handleBattleReady as EventListener)
    }
  }, [onBattleStart])

  const handleStartBattle = async () => {
    console.log("🚀 Room creator starting battle")
    setError("") // Clear any previous errors

    // Prevent multiple countdowns from being started
    if (countdown !== null || battleStarted) {
      console.warn("Countdown or battle already started, ignoring duplicate start.")
      return
    }

    // Ensure socket is connected
    const isConnected = await battleService.ensureConnection()
    if (!isConnected) {
      console.error("❌ Socket not connected, cannot start battle")
      setError("Socket connection failed. Please try again.")
      return
    }

    // Double-check we are the room creator
    const currentUser = battleService.getCurrentUser()
    const currentBattle = battleService.getCurrentBattle()

    if (!currentUser || !currentBattle) {
      console.error("❌ Missing user or battle data")
      setError("Missing user or battle data. Please refresh the page.")
      return
    }

    const isCreator = currentBattle.players[0]?.userId === currentUser.id
    if (!isCreator) {
      console.error("❌ User is not the room creator")
      setError("You are not the room creator. Only the room creator can start the battle.")
      return
    }

    console.log("✅ Confirmed room creator, starting countdown...")
    setCountdown(3)

    try {
      // Emit countdown to all players
      battleService.emitBattleCountdown(roomId, 3)

      // Use a ref to ensure only one countdown interval is running
      let countdownRunning = true

      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (!countdownRunning) return prev
          if (prev && prev > 1) {
            const newCountdown = prev - 1
            console.log(`⏰ Countdown: ${newCountdown}`)
            battleService.emitBattleCountdown(roomId, newCountdown)
            return newCountdown
          } else {
            countdownRunning = false
            clearInterval(countdownTimer)
            console.log("⚔️ Countdown finished, generating quiz...")

            // Generate quiz
            fetch("/api/generate-battle-quiz", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ topic }),
            })
              .then(res => {
                if (!res.ok) throw new Error("Failed to generate quiz")
                return res.json()
              })
              .then(quiz => {
                console.log("✅ Quiz generated, starting battle...")
                battleService.emitBattleStart(roomId, quiz)
                setBattleStarted(true)
              })
              .catch(error => {
                console.error("❌ Error generating quiz:", error)
                setError("Failed to generate quiz. Please try again.")
              })

            return null
          }
        })
      }, 1000)
    } catch (error) {
      console.error("❌ Error starting battle:", error)
      setCountdown(null)
      setError("Failed to start battle. Please try again.")
    }
  }

  const handleForceRefresh = async () => {
    console.log("🔄 Force refreshing battle data")
    try {
      const updatedBattle = await battleService.getBattle(roomId)
      if (updatedBattle) {
        console.log("🔄 Updated battle data:", updatedBattle)
        const currentUser = battleService.getCurrentUser()
        if (currentUser && updatedBattle.players.length >= 2) {
          const isCreator = updatedBattle.players[0]?.userId === currentUser.id
          setIsRoomCreator(isCreator)
          setWaitingForCreator(!isCreator)
          
          // Update the current battle in the service
          battleService.setCurrentBattle(updatedBattle)
        }
      }
    } catch (error) {
      console.error("❌ Error force refreshing:", error)
    }
  }

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
          <p className="text-gray-400">Good luck to both players! ��</p>
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

  if (waitingForCreator) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-cyan-500/20 to-blue-400/20 rounded-full flex items-center justify-center mb-6"
        >
          <Clock className="w-10 h-10 text-cyan-400" />
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">Waiting for Battle Start</h2>
        <p className="text-gray-400 text-lg">
          Room creator will start the battle soon...
        </p>
        
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="text-cyan-400 text-lg font-semibold"
        >
          Get ready! ⚔️
        </motion.div>
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

      {/* Start Battle Button - Only show for room creator */}
      {isRoomCreator && (
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
          <p className="text-gray-400 mt-4">You control the battle start. Let the battle begin! ⚔️</p>
        </motion.div>
      )}

      {/* Waiting message for non-creators */}
      {!isRoomCreator && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-6">
            <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <p className="text-cyan-400 font-semibold text-lg">Waiting for Room Creator</p>
            <p className="text-gray-400 mt-2">The room creator will start the battle when ready</p>
          </div>
        </motion.div>
      )}

      {/* Room Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center text-sm text-gray-500"
      >
        Room ID: <code className="bg-gray-800/50 px-2 py-1 rounded">{roomId}</code>
        
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
          >
            <p className="text-red-400 text-sm font-medium">⚠️ {error}</p>
            {isRoomCreator && (
              <Button
                onClick={handleStartBattle}
                className="mt-2 w-full text-xs py-1 bg-red-500/30 text-red-300 border-red-500/50 hover:bg-red-500/40"
              >
                🔄 Retry Starting Battle
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Debug Info - Only show in development */}
      {process.env.NODE_ENV === "development" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-sm text-gray-500"
        >
          <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <p className="text-xs text-gray-400 mb-2">Debug Info:</p>
            <div className="text-xs space-y-1">
              <p>Room Creator: {isRoomCreator ? 'Yes' : 'No'}</p>
              <p>Waiting for Creator: {waitingForCreator ? 'Yes' : 'No'}</p>
              <p>Current User: {battleService.getCurrentUser()?.name || 'Unknown'}</p>
              <p>Battle Players: {battleService.getCurrentBattle()?.players?.length || 0}</p>
              <p>Socket Connected: {battleService.isConnected() ? 'Yes' : 'No'}</p>
              <p>Battle Ready Triggered: {battleReadyTriggeredRef.current ? 'Yes' : 'No'}</p>
            </div>
            
            {/* Manual trigger button for testing */}
            <div className="mt-3 pt-3 border-t border-gray-700/30 space-y-2">
              <Button
                onClick={() => {
                  const currentBattle = battleService.getCurrentBattle()
                  if (currentBattle && currentBattle.players.length === 2) {
                    window.dispatchEvent(new CustomEvent("battleReady", { 
                      detail: { 
                        players: currentBattle.players.map(p => ({ userId: p.userId, username: p.username })),
                        battleId: currentBattle._id
                      }
                    }))
                  }
                }}
                className="w-full text-xs py-1 bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
              >
                🔧 Manual Trigger Battle Ready
              </Button>
              <Button
                onClick={handleForceRefresh}
                className="w-full text-xs py-1 bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
              >
                🔄 Force Refresh Battle Data
              </Button>
              <Button
                onClick={() => {
                  const currentBattle = battleService.getCurrentBattle()
                  if (currentBattle && currentBattle.players.length === 2) {
                    console.log("🔧 Manual trigger: Dispatching battle ready event")
                    window.dispatchEvent(new CustomEvent("battleReady", { 
                      detail: { 
                        players: currentBattle.players.map(p => ({ userId: p.userId, username: p.username })),
                        battleId: currentBattle._id
                      }
                    }))
                  }
                }}
                className="w-full text-xs py-1 bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30"
              >
                🚀 Manual Trigger Battle Ready Event
              </Button>
              
              <Button
                onClick={async () => {
                  console.log("🔧 Manual trigger: Checking and fixing socket connection")
                  const success = await battleService.ensureConnection()
                  console.log("🔧 Socket check result:", success)
                }}
                className="w-full text-xs py-1 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"
              >
                🔧 Check & Fix Socket Connection
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
