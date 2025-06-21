"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Target, Users, Clock, AlertCircle, Loader2 } from "lucide-react"
import { battleService, User } from "@/lib/battleService"

interface JoinRoomProps {
  topic: string
  onRoomJoined: (roomId: string) => void
}

export function JoinRoom({ topic, onRoomJoined }: JoinRoomProps) {
  const [roomId, setRoomId] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError("Please enter a room code")
      return
    }

    if (roomId.length < 6) {
      setError("Room code must be at least 6 characters")
      return
    }

    setError("")
    setIsJoining(true)

    try {
      // Create a mock user for now - in a real app, this would come from auth
      const user: User = {
        id: `user_${Date.now()}`,
        name: `Player_${Math.floor(Math.random() * 1000)}`,
      }

      // Connect to socket service
      battleService.connect(user)

      // First check if battle exists
      const existingBattle = await battleService.getBattle(roomId)
      if (!existingBattle) {
        throw new Error("Room not found or no longer available")
      }

      // Join the battle
      const battle = await battleService.joinBattle(roomId, user)
      
      // Notify parent component
      onRoomJoined(battle._id)
    } catch (err) {
      console.error("Error joining room:", err)
      setError(err instanceof Error ? err.message : "Failed to join room. Please try again.")
      setIsJoining(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setRoomId(value)
    if (error) setError("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJoinRoom()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mb-4"
        >
          <Target className="w-8 h-8 text-cyan-400" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-2">Join Battle Room</h2>
        <p className="text-gray-400">Enter the room code to join an existing battle!</p>
      </div>

      <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <span>Enter Room Details</span>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{topic}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Room Code Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">Room Code</label>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter room code..."
                value={roomId}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="bg-gradient-to-r from-gray-800/80 to-cyan-500/5 border-gray-600/50 text-white text-center text-xl font-bold tracking-wider h-14 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                maxLength={24}
                disabled={isJoining}
              />
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Expected Room Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-gray-300">Expected Players</span>
              </div>
              <p className="text-lg font-bold text-white">2 Players</p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-gray-300">Time Limit</span>
              </div>
              <p className="text-lg font-bold text-white">30s / question</p>
            </div>
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoinRoom}
            disabled={isJoining || !roomId.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Joining Room...
              </>
            ) : (
              <>
                <Target className="w-5 h-5 mr-2" />
                Join Battle Room
              </>
            )}
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
          🎯 <strong>Quick Tip:</strong> Room codes are case-insensitive and can be up to 24 characters long
        </p>
        <p className="text-xs text-gray-500">Make sure you and your opponent selected the same topic!</p>
      </motion.div>
    </div>
  )
}
