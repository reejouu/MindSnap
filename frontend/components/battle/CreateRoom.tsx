"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { generateRoomId } from "@/lib/utils"
import { Copy, Share2, Users, Clock, Crown, Sparkles, CheckCircle, AlertCircle, User } from "lucide-react"
import { battleService, User as BattleUser } from "@/lib/battleService"

interface CreateRoomProps {
  topic: string
  onRoomCreated: (roomId: string) => void
}

export function CreateRoom({ topic, onRoomCreated }: CreateRoomProps) {
  const [roomId, setRoomId] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string>("")
  const [roomCreated, setRoomCreated] = useState(false)

  useEffect(() => {
    // Generate room ID when component mounts
    const newRoomId = generateRoomId()
    setRoomId(newRoomId)
  }, [])

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy room ID:", err)
    }
  }

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      setError("Please enter your username")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      // Create user with actual username
      const user: BattleUser = {
        id: `user_${Date.now()}`,
        name: username.trim(),
      }

      // Connect to socket service
      battleService.connect(user)

      // Create battle in database
      const battle = await battleService.createBattle(topic, user)
      
      // Use the actual battle ID from database
      const actualRoomId = battle._id
      setRoomId(actualRoomId)
      setRoomCreated(true)

      // Notify parent component
      onRoomCreated(actualRoomId)
    } catch (err) {
      console.error("Error creating room:", err)
      setError("Failed to create room. Please try again.")
      setIsCreating(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Quiz Battle!",
          text: `Challenge me in a ${topic} quiz battle!`,
          url: `${window.location.origin}/battle?room=${roomId}`,
        })
      } catch (err) {
        console.error("Error sharing:", err)
      }
    } else {
      handleCopyRoomId()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/20 to-emerald-400/20 rounded-full flex items-center justify-center mb-4"
        >
          <Crown className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Create Battle Room</h2>
        <p className="text-gray-400">Share your room code with friends to start the battle!</p>
      </div>

      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span>Room Details</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{topic}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* Username Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Your Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Enter your username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-gradient-to-r from-gray-800/80 to-emerald-500/5 border-gray-600/50 text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                maxLength={20}
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Room ID Display - Only show after room is created */}
          {roomCreated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <label className="text-sm font-medium text-gray-300">Room Code</label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-lg">
                  <code className="text-2xl font-bold text-white tracking-wider">{roomId}</code>
                </div>
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
                  Room code copied to clipboard!
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Room Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-gray-300">Players</span>
              </div>
              <p className="text-lg font-bold text-white">1 / 2</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-gray-300">Time Limit</span>
              </div>
              <p className="text-lg font-bold text-white">30s / question</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {!roomCreated ? (
              <Button
                onClick={handleCreateRoom}
                disabled={isCreating || !username.trim()}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                {isCreating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isCreating ? "Creating Room..." : "Create & Wait for Opponent"}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full border-gray-600/50 text-gray-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Room Code
              </Button>
            )}
          </div>
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
          💡 <strong>Pro Tip:</strong> Share the room code with friends or let random players join!
        </p>
        <p className="text-xs text-gray-500">Room expires after 10 minutes of inactivity</p>
      </motion.div>
    </div>
  )
}
