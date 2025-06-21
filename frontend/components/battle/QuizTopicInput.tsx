"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Brain, Target, AlertCircle, Sparkles } from "lucide-react"

interface QuizTopicInputProps {
  onTopicSubmit: (topic: string) => void
}

export function QuizTopicInput({ onTopicSubmit }: QuizTopicInputProps) {
  const [topic, setTopic] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (!topic.trim()) {
      setError("Please enter a quiz topic")
      return
    }

    if (topic.trim().length < 3) {
      setError("Topic must be at least 3 characters long")
      return
    }

    setError("")
    onTopicSubmit(topic.trim())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTopic(e.target.value)
    if (error) setError("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mb-4"
        >
          <Brain className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Set Quiz Topic
        </h2>
        <p className="text-lg text-gray-400">
          Choose any topic for your battle quiz. Be creative and specific!
        </p>
      </div>

      <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 border-gray-700/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center justify-between text-white">
            <span className="text-2xl font-bold">Quiz Configuration</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1 font-semibold">
              Custom Topic
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-3 p-4 bg-red-500/15 border border-red-500/40 rounded-xl backdrop-blur-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-base font-medium">{error}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <label className="text-base font-semibold text-gray-200 flex items-center">
              <Target className="w-5 h-5 mr-3 text-emerald-400" />
              Quiz Topic
            </label>
            <Input
              type="text"
              placeholder="e.g., JavaScript Fundamentals, Python Programming..."
              value={topic}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="bg-gray-800/50 border-gray-600/50 text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 h-12 text-lg font-medium"
              maxLength={100}
            />
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              Be specific! The more detailed your topic, the better the quiz questions will be.
            </p>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!topic.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:hover:scale-100 text-lg shadow-lg hover:shadow-emerald-500/25"
            >
              <Sparkles className="w-6 h-6 mr-3" />
              Create Battle Room
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 