"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Atom, Globe, Code, Palette, Calculator, BookOpen, Gamepad2, Music, Dna } from "lucide-react"

interface Topic {
  id: string
  name: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  difficulty: string
  questions: number
}

const topics: Topic[] = [
  {
    id: "science",
    name: "Science",
    icon: Atom,
    color: "text-blue-400",
    bgColor: "from-blue-500/10 to-blue-400/5 border-blue-500/30",
    difficulty: "Medium",
    questions: 150,
  },
  {
    id: "history",
    name: "History",
    icon: Globe,
    color: "text-amber-400",
    bgColor: "from-amber-500/10 to-amber-400/5 border-amber-500/30",
    difficulty: "Hard",
    questions: 200,
  },
  {
    id: "technology",
    name: "Technology",
    icon: Code,
    color: "text-emerald-400",
    bgColor: "from-emerald-500/10 to-emerald-400/5 border-emerald-500/30",
    difficulty: "Medium",
    questions: 180,
  },
  {
    id: "arts",
    name: "Arts & Culture",
    icon: Palette,
    color: "text-purple-400",
    bgColor: "from-purple-500/10 to-purple-400/5 border-purple-500/30",
    difficulty: "Easy",
    questions: 120,
  },
  {
    id: "mathematics",
    name: "Mathematics",
    icon: Calculator,
    color: "text-cyan-400",
    bgColor: "from-cyan-500/10 to-cyan-400/5 border-cyan-500/30",
    difficulty: "Hard",
    questions: 160,
  },
  {
    id: "literature",
    name: "Literature",
    icon: BookOpen,
    color: "text-rose-400",
    bgColor: "from-rose-500/10 to-rose-400/5 border-rose-500/30",
    difficulty: "Medium",
    questions: 140,
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: Gamepad2,
    color: "text-orange-400",
    bgColor: "from-orange-500/10 to-orange-400/5 border-orange-500/30",
    difficulty: "Easy",
    questions: 100,
  },
  {
    id: "music",
    name: "Music",
    icon: Music,
    color: "text-pink-400",
    bgColor: "from-pink-500/10 to-pink-400/5 border-pink-500/30",
    difficulty: "Medium",
    questions: 110,
  },
  {
    id: "biology",
    name: "Biology",
    icon: Dna,
    color: "text-green-400",
    bgColor: "from-green-500/10 to-green-400/5 border-green-500/30",
    difficulty: "Hard",
    questions: 170,
  },
]

interface TopicSelectorProps {
  onTopicSelect: (topic: string) => void
}

export function TopicSelector({ onTopicSelect }: TopicSelectorProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("")

  const handleTopicClick = (topicId: string) => {
    setSelectedTopic(topicId)
    setTimeout(() => onTopicSelect(topicId), 300)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Hard":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Battle Topic</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Select a topic to challenge other players. Each topic has different difficulty levels and question pools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic, index) => {
          const Icon = topic.icon
          const isSelected = selectedTopic === topic.id

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`bg-gradient-to-br ${topic.bgColor} hover:border-opacity-70 transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                  isSelected ? "ring-2 ring-emerald-400 shadow-lg shadow-emerald-400/20" : ""
                }`}
                onClick={() => handleTopicClick(topic.id)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topic.bgColor.split(" ")[0]} ${topic.bgColor.split(" ")[1]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`w-6 h-6 ${topic.color}`} />
                    </div>
                    <Badge className={`text-xs ${getDifficultyColor(topic.difficulty)}`}>{topic.difficulty}</Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-sm text-gray-400">{topic.questions} questions available</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center">
                      <Brain className="w-3 h-3 mr-1" />
                      Battle Ready
                    </span>
                    <span>⚡ Live</span>
                  </div>
                </CardContent>

                {/* Selection overlay */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-emerald-400/10 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-sm">✓</span>
                    </motion.div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
