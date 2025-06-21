"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { generateRoomId } from "@/lib/utils"
import { Copy, Share2, Users, Clock, Crown, Sparkles, CheckCircle, AlertCircle, User, Target, Plus, Loader2 } from "lucide-react"
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

      // Connect to socket service and wait for connection
      console.log("🔌 Connecting to socket service...")
      await battleService.connect(user)
      console.log("✅ Socket connected, creating battle...")

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

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
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

      <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 border-gray-700/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center justify-between text-white">
            <span className="text-2xl font-bold">Create Room</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1 font-semibold">Host Battle</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
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
          <div className="space-y-4">
            <label className="text-base font-semibold text-gray-200 flex items-center">
              <User className="w-5 h-5 mr-3 text-emerald-400" />
              Your Username
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter your username..."
                value={username}
                onChange={handleUsernameChange}
                className="pl-12 bg-gradient-to-r from-gray-800/80 to-emerald-500/5 border-gray-600/50 text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 h-12 text-lg font-medium"
                maxLength={20}
                disabled={isCreating}
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Room Code Display - Only show after room is created */}
          {roomCreated && (
            <div className="space-y-4">
              <label className="text-base font-semibold text-gray-200 flex items-center">
                <Target className="w-5 h-5 mr-3 text-emerald-400" />
                Room Code
              </label>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-gray-800/80 to-emerald-500/5 border border-gray-600/50 rounded-lg p-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white tracking-wider mb-2">{roomId}</p>
                    <p className="text-sm text-gray-400 font-medium">Share this code with your opponent</p>
                  </div>
                </div>
                <Button
                  onClick={handleCopyRoomId}
                  variant="outline"
                  className="w-full border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Room Code
                </Button>
              </div>
            </div>
          )}

          {/* Room Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="w-5 h-5 text-emerald-400" />
                <span className="text-base font-semibold text-gray-200">Max Players</span>
              </div>
              <p className="text-2xl font-bold text-white">2 Players</p>
            </div>
            <div className="p-5 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="text-base font-semibold text-gray-200">Time Limit</span>
              </div>
              <p className="text-2xl font-bold text-white">30s / Q</p>
            </div>
          </div>

          {/* Create Button */}
          <div className="pt-4">
            <Button
              onClick={handleCreateRoom}
              disabled={isCreating || !username.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 text-lg shadow-lg hover:shadow-emerald-500/25"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  Creating Room...
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 mr-3" />
                  Create Battle Room
                </>
              )}
            </Button>
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
