"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GenreModal } from "@/components/ui/genre-modal"
import Navbar from "@/components/navbar"
import {
  X,
  Upload,
  BookOpen,
  Trophy,
  Target,
  Clock,
  Star,
  Brain,
  Zap,
  FileText,
  User,
  ChevronRight,
  Play,
  BarChart3,
  Calendar,
  Bookmark,
  Loader2,
  Youtube,
  MessageSquare,
  ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  Highlighter,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function getVideoId(url: string): string {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1)
    }
    if (urlObj.hostname.includes("youtube.com")) {
      return new URLSearchParams(urlObj.search).get("v") || ""
    }
    throw new Error("Invalid YouTube URL")
  } catch (error) {
    throw new Error("Invalid YouTube URL")
  }
}

export default function Dashboard({
  userName = "John Doe",
  userEmail = "john@example.com",
}: {
  userName?: string
  userEmail?: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [youtubeLink, setYoutubeLink] = useState("")
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfPreview, setPdfPreview] = useState<{
    name: string
    size: string
  } | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<{
    name: string
    size: string
  } | null>(null)
  const [textInput, setTextInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingType, setLoadingType] = useState<"youtube" | "pdf" | "text" | "image" | null>(null)
  const router = useRouter()
  const [recentTopics, setRecentTopics] = useState<
    Array<{
      title: string
      progress: number
      cards: number
      timeSpent: string
      sessionId: string
      type: "youtube" | "pdf" | "text"
      timestamp: number
    }>
  >([])
  const [suggestedTopics] = useState([
    {
      title: "Machine Learning Fundamentals",
      difficulty: "Intermediate",
      time: "45 min",
      progress: 0,
    },
    {
      title: "React Hooks Deep Dive",
      difficulty: "Advanced",
      time: "60 min",
      progress: 0,
    },
    {
      title: "Data Structures & Algorithms",
      difficulty: "Beginner",
      time: "30 min",
      progress: 0,
    },
    {
      title: "System Design Basics",
      difficulty: "Intermediate",
      time: "50 min",
      progress: 0,
    },
  ])
  const [loadingTopic, setLoadingTopic] = useState<string | null>(null)
  const [stats, setStats] = useState([
    {
      label: "Cards Completed",
      value: "0",
      icon: BookOpen,
      color: "text-emerald-400",
      bgColor: "from-emerald-500/20 to-emerald-400/10",
    },
    {
      label: "Study Streak",
      value: "0 days",
      icon: Target,
      color: "text-cyan-400",
      bgColor: "from-cyan-500/20 to-cyan-400/10",
    },
    {
      label: "Time Studied",
      value: "0h 0m",
      icon: Clock,
      color: "text-purple-400",
      bgColor: "from-purple-500/20 to-purple-400/10",
    },
    {
      label: "Topics Mastered",
      value: "0",
      icon: Trophy,
      color: "text-yellow-400",
      bgColor: "from-yellow-500/20 to-yellow-400/10",
    },
  ])

  // Genre selection modal state
  const [showGenreModal, setShowGenreModal] = useState(false)
  const [selectedGenre, setSelectedGenre] = useState<"factual" | "conceptual" | "genz" | "story" | null>(null)
  const [pendingGeneration, setPendingGeneration] = useState<{
    type: "youtube" | "pdf" | "text" | "image"
    data: any
  } | null>(null)

  // Temporary fix: Direct navigation function
  const navigateToLearn = (sessionId: string) => {
    console.log("Navigating to learn:", sessionId)
    window.location.href = `/learn/${sessionId}`
  }

  const navigateToQuiz = (sessionId: string) => {
    console.log("Navigating to quiz:", sessionId)
    window.location.href = `/quiz/${sessionId}`
  }

  // Add useEffect to load recent topics
  useEffect(() => {
    const loadRecentTopics = () => {
      const topics = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith("flashcards_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}")
            if (data.cards && data.topic) {
              // Determine the type from the session ID
              const sessionId = key.replace("flashcards_", "")
              let type: "youtube" | "pdf" | "text" = "text"
              let timestamp = Date.now()

              if (sessionId.startsWith("pdf_")) {
                type = "pdf"
                timestamp = Number.parseInt(sessionId.split("_")[1])
              } else if (sessionId.startsWith("text_")) {
                type = "text"
                timestamp = Number.parseInt(sessionId.split("_")[1])
              } else {
                // YouTube video IDs don't have a prefix
                type = "youtube"
                // For YouTube, we'll use the current time as we don't store timestamps
                timestamp = Date.now()
              }

              // Calculate progress based on cards viewed
              const totalCards = data.cards.length
              const viewedCards = data.cards.filter((card: any) => card.timeSpent > 0).length
              const progress = Math.round((viewedCards / totalCards) * 100)

              // Format time spent
              const formatTimeSpent = (ms: number) => {
                const hours = Math.floor(ms / (1000 * 60 * 60))
                const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
                return `${hours}h ${minutes}m`
              }

              topics.push({
                title: data.topic,
                progress,
                cards: data.cards.length,
                timeSpent: formatTimeSpent(data.timeSpent || 0),
                sessionId,
                type,
                timestamp,
              })
            }
          } catch (error) {
            console.error("Error parsing flashcard data:", error)
          }
        }
      }
      // Sort by timestamp (most recent first) and take the last 3
      return topics.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3)
    }

    setRecentTopics(loadRecentTopics())

    // Listen for storage changes
    const handleStorageChange = () => {
      setRecentTopics(loadRecentTopics())
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Add useEffect to calculate stats
  useEffect(() => {
    const calculateStats = () => {
      let totalCards = 0
      let totalTopics = 0
      let totalProgress = 0
      let masteredTopics = 0
      let accumulatedCardTime = 0 // Accumulated time spent on all cards

      // Get all flashcard sessions
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith("flashcards_")) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || "{}")
            if (data.cards && data.topic) {
              totalTopics++
              totalCards += data.cards.length

              // Calculate progress
              const progress = Math.floor(Math.random() * 100)
              totalProgress += progress

              if (progress === 100) {
                masteredTopics++
              }

              // Accumulate time spent on all cards
              for (const card of data.cards) {
                if (card.timeSpent) {
                  accumulatedCardTime += card.timeSpent
                }
              }
            }
          } catch (error) {
            console.error("Error parsing flashcard data:", error)
          }
        }
      }

      // Format time spent
      const formatTimeSpent = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60))
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
        return `${hours}h ${minutes}m`
      }

      // Update stats
      setStats([
        {
          label: "Cards Completed",
          value: totalCards.toString(),
          icon: BookOpen,
          color: "text-emerald-400",
          bgColor: "from-emerald-500/20 to-emerald-400/10",
        },
        {
          label: "Study Streak",
          value: "0 days",
          icon: Target,
          color: "text-cyan-400",
          bgColor: "from-cyan-500/20 to-cyan-400/10",
        },
        {
          label: "Time Studied",
          value: formatTimeSpent(accumulatedCardTime),
          icon: Clock,
          color: "text-purple-400",
          bgColor: "from-purple-500/20 to-purple-400/10",
        },
        {
          label: "Topics Mastered",
          value: totalTopics.toString(),
          icon: Trophy,
          color: "text-yellow-400",
          bgColor: "from-yellow-500/20 to-yellow-400/10",
        },
      ])
    }

    calculateStats()

    // Listen for storage changes
    const handleStorageChange = () => {
      calculateStats()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setTextInput(transcript)
        setIsRecording(false)
        toast.success("Voice input captured!")
      }

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        setIsRecording(false)
        toast.error("Voice input failed. Please try again.")
      }

      recognitionInstance.onend = () => {
        setIsRecording(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  // Helper function to get source type icon and color
  const getSourceTypeInfo = (type: "youtube" | "pdf" | "text") => {
    switch (type) {
      case "youtube":
        return {
          icon: Youtube,
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          label: "YouTube",
        }
      case "pdf":
        return {
          icon: FileText,
          color: "text-blue-400",
          bgColor: "bg-blue-500/10",
          label: "PDF",
        }
      case "text":
        return {
          icon: MessageSquare,
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          label: "Text",
        }
    }
  }

  const handleGenerateCards = async () => {
    if (!youtubeLink) {
      toast.error("Please enter a YouTube link")
      return
    }

    // Show genre selection modal first
    setPendingGeneration({
      type: "youtube",
      data: { youtubeLink },
    })
    setShowGenreModal(true)
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      // Show preview instead of generating cards immediately
      setPdfPreview({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      })
    } else {
      toast.error("Please upload a valid PDF file")
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
      // Show preview instead of generating cards immediately
      setImagePreview({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      })
    } else {
      toast.error("Please upload a valid image file")
    }
  }

  const handleGenerateCardsFromPdf = async () => {
    if (!pdfFile) {
      toast.error("Please upload a PDF file first")
      return
    }

    // Show genre selection modal first
    setPendingGeneration({
      type: "pdf",
      data: { pdfFile },
    })
    setShowGenreModal(true)
  }

  const handleGenerateCardsFromImage = async () => {
    if (!imageFile) {
      toast.error("Please upload an image file first")
      return
    }

    // Show genre selection modal first
    setPendingGeneration({
      type: "image",
      data: { imageFile },
    })
    setShowGenreModal(true)
  }

  const handleGenerateCardsFromText = async () => {
    if (!textInput.trim()) {
      toast.error("Please enter some text")
      return
    }

    // Show genre selection modal first
    setPendingGeneration({
      type: "text",
      data: { text: textInput },
    })
    setShowGenreModal(true)
  }

  const handleVoiceInput = () => {
    if (!recognition) {
      toast.error("Speech recognition is not supported in your browser")
      return
    }

    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
    } else {
      try {
        recognition.start()
        setIsRecording(true)
        toast.info("Listening... Speak now!")
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        toast.error("Failed to start voice input")
      }
    }
  }

  const handleStartLearning = async (topic: string) => {
    setLoadingTopic(topic)
    try {
      const response = await fetch("/api/generate-flashcards-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: `Generate flashcards about ${topic}` }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate flashcards")
      }

      const data = await response.json()
      console.log("Text API Response:", JSON.stringify(data, null, 2))

      // Format the flashcards
      const formattedCards = data.flashcards.map((card: any) => ({
        id: card.id.toString(),
        title: card.content.split(".")[0] || `Flashcard ${card.id}`,
        content: card.content,
        type: "learning" as const,
      }))

      // Store the formatted data with timestamp
      const timestamp = Date.now()
      const sessionId = `text_${timestamp}`
      const sessionData = {
        cards: formattedCards,
        topic: topic,
        timestamp: timestamp,
      }

      localStorage.setItem(`flashcards_${sessionId}`, JSON.stringify(sessionData))
      window.location.href = `/learn/${sessionId}`
    } catch (error) {
      console.error("Error generating flashcards:", error)
      toast.error("Failed to generate flashcards")
    } finally {
      setLoadingTopic(null)
    }
  }

  // Function to handle genre selection and start generation
  const handleGenreSelection = async (genre: "factual" | "conceptual" | "genz" | "story") => {
    if (!pendingGeneration) return

    setSelectedGenre(genre)
    setShowGenreModal(false)
    setLoading(true)
    setLoadingType(pendingGeneration.type)

    try {
      let response
      let endpoint = ""

      switch (pendingGeneration.type) {
        case "youtube":
          endpoint = "/api/generate-flashcards"
          response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              youtubeLink: pendingGeneration.data.youtubeLink,
              genre: genre,
            }),
          })
          break

        case "pdf":
          endpoint = "/api/generate-flashcards-pdf"
          const formData = new FormData()
          formData.append("file", pendingGeneration.data.pdfFile)
          formData.append("genre", genre)
          response = await fetch(endpoint, {
            method: "POST",
            body: formData,
          })
          break

        case "image":
          endpoint = "/api/generate-flashcards-image"
          const imageFormData = new FormData()
          imageFormData.append("file", pendingGeneration.data.imageFile)
          imageFormData.append("genre", genre)
          response = await fetch(endpoint, {
            method: "POST",
            body: imageFormData,
          })
          break

        case "text":
          endpoint = "/api/generate-flashcards-text"
          response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: pendingGeneration.data.text,
              genre: genre,
            }),
          })
          break
      }

      if (!response.ok) {
        throw new Error("Failed to generate flashcards")
      }

      const data = await response.json()
      console.log(`${pendingGeneration.type.toUpperCase()} API Response:`, JSON.stringify(data, null, 2))

      // Format the flashcards
      const formattedCards = data.flashcards.map((card: any) => ({
        id: card.id.toString(),
        title: card.content.split(".")[0] || `Flashcard ${card.id}`,
        content: card.content,
        type: "learning" as const,
        timeSpent: 0,
      }))

      // Generate session ID and store data
      let sessionId = ""
      let topic = ""

      if (pendingGeneration.type === "youtube") {
        const videoId = getVideoId(pendingGeneration.data.youtubeLink)
        const timestamp = Date.now()
        sessionId = `youtube_${timestamp}_${videoId}`
        topic = formattedCards[0]?.content.split(".")[0].split(":")[0].trim().slice(0, 50) || "YouTube Video"
      } else if (pendingGeneration.type === "pdf") {
        sessionId = `pdf_${Date.now()}`
        topic = pendingGeneration.data.pdfFile.name.replace(".pdf", "")
      } else if (pendingGeneration.type === "image") {
        sessionId = `image_${Date.now()}`
        topic = pendingGeneration.data.imageFile.name.replace(/\.[^/.]+$/, "")
      } else {
        const timestamp = Date.now()
        sessionId = `text_${timestamp}`
        topic = formattedCards[0]?.content.split(".")[0].split(":")[0].trim().slice(0, 50) || "Text Content"
      }

      const sessionData = {
        cards: formattedCards,
        topic: topic,
        timestamp: Date.now(),
        timeSpent: 0,
        genre: genre,
      }

      localStorage.setItem(`flashcards_${sessionId}`, JSON.stringify(sessionData))

      // Clear states
      if (pendingGeneration.type === "pdf") {
        setPdfPreview(null)
        setPdfFile(null)
      } else if (pendingGeneration.type === "image") {
        setImagePreview(null)
        setImageFile(null)
      }

      window.location.href = `/learn/${sessionId}`
    } catch (error) {
      console.error("Error generating flashcards:", error)
      toast.error("Failed to generate flashcards")
    } finally {
      setLoading(false)
      setLoadingType(null)
      setPendingGeneration(null)
      setSelectedGenre(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-[#0a0f0a] via-[#0f1410] to-[#0a0f0a] border-r border-emerald-500/20 transform transition-all duration-500 ease-out backdrop-blur-sm ${
            sidebarOpen ? "translate-x-0 shadow-2xl shadow-emerald-500/10" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Profile
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white hover:bg-emerald-500/10 hover:scale-110 transition-all duration-200"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Make this section scrollable */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-hide">
              {/* Profile Section */}
              <div className="text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-emerald-500/30 via-cyan-400/20 to-emerald-400/10 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-emerald-500/20">
                  <User className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{userName}</h3>
                <p className="text-gray-400 mb-3">{userEmail}</p>
                <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-500/30 hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300">
                  Pro Learner ✨
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom duration-700 delay-200">
                <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-400/5 rounded-xl border border-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">156</div>
                  <div className="text-xs text-gray-400">Cards Today</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-400/5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/30 transition-all duration-300 hover:scale-105">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">89%</div>
                  <div className="text-xs text-gray-400">Accuracy</div>
                </div>
              </div>

              {/* Saved Topics */}
              <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/30 hover:border-emerald-500/30 transition-all animate-in slide-in-from-bottom duration-700 delay-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center">
                    <Bookmark className="w-4 h-4 mr-2 text-emerald-400" />
                    Saved Topics to Revise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
                  {recentTopics.length > 0 ? (
                    recentTopics.map((topic) => {
                      const sourceInfo = getSourceTypeInfo(topic.type)
                      const SourceIcon = sourceInfo.icon

                      return (
                        <div
                          key={topic.sessionId}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-800/50 to-emerald-500/5 rounded-lg border border-gray-700/30 hover:border-emerald-500/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer group flex-shrink-0"
                          onClick={() => navigateToLearn(topic.sessionId)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`p-1 rounded-lg ${sourceInfo.bgColor} flex-shrink-0`}>
                                <SourceIcon className={`w-3 h-3 ${sourceInfo.color}`} />
                              </div>
                              <span className="text-xs font-medium text-gray-400 flex-shrink-0">
                                {sourceInfo.label}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-white truncate mb-2">{topic.title}</div>
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>{topic.cards} cards</span>
                              <span>{topic.progress}%</span>
                            </div>
                            <Progress value={topic.progress} className="h-2 transition-all duration-500" />
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 ml-2" />
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-400">No saved topics yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance */}
              <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/30 hover:border-cyan-500/30 transition-all animate-in slide-in-from-bottom duration-700 delay-400">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2 text-cyan-400" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Weekly Goal</span>
                      <span className="text-sm font-bold text-white">75%</span>
                    </div>
                    <Progress value={75} className="h-3 transition-all duration-500" />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>15/20 hours</span>
                      <span className="text-cyan-400 font-medium">5h remaining</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 min-h-screen transition-all duration-500 ease-out ${sidebarOpen ? "ml-80" : ""}`}>
          <div className="p-6 lg:p-8 space-y-10">
            {/* Welcome Section */}
            <div className="flex items-center justify-between animate-in fade-in slide-in-from-top duration-700">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-white via-emerald-200 to-cyan-200 bg-clip-text text-transparent">
                    Welcome back, {userName.split(" ")[0]}
                  </span>
                  <span className="ml-2">👋</span>
                </h1>
                <p className="text-gray-300 text-lg">Ready to continue your learning journey?</p>
              </div>
              <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full border border-emerald-500/20">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-white">Today, {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            {/* My Learning Section */}
            <div className="space-y-8">
              <div className="flex justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full">
                  {/* Upload Content Card */}
                  <Card className="bg-[#151D1B] border-gray-700/30 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 animate-in slide-in-from-left duration-700 delay-200 group backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center text-white text-xl">
                        <div className="p-2 bg-emerald-500/20 rounded-lg mr-3 group-hover:bg-emerald-500/30 transition-all duration-300">
                          <Upload className="w-5 h-5 text-emerald-400" />
                        </div>
                        Upload Content
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-base mt-5">
                        Upload PDF files or paste YouTube links to create learning cards
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-5">
                        <div className="relative">
                          <Input
                            placeholder="Paste YouTube URL here..."
                            className="bg-gradient-to-r from-gray-800/80 to-emerald-500/5 border-gray-600/50 text-white pr-24 h-12 text-base focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 placeholder:text-gray-400"
                            value={youtubeLink}
                            onChange={(e) => setYoutubeLink(e.target.value)}
                          />
                          <Button
                            size="sm"
                            className="absolute right-2 top-2 bg-emerald-500 hover:bg-emerald-600 text-white h-8 px-4 font-medium hover:scale-105 transition-all duration-200"
                            onClick={handleGenerateCards}
                            disabled={loading || !youtubeLink}
                          >
                            {loading && loadingType === "youtube" ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              "Send"
                            )}
                          </Button>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-4 font-medium">or</div>
                          <div className="space-y-4">
                            <div className="flex gap-4">
                              <div className="relative flex-1">
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={handlePdfUpload}
                                  className="hidden"
                                  id="pdf-upload"
                                />
                                <Button
                                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white h-12 text-base font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                                  onClick={() => document.getElementById("pdf-upload")?.click()}
                                  disabled={loading}
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  Upload PDF
                                </Button>
                              </div>
                              <div className="relative flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  id="image-upload"
                                />
                                <Button
                                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white h-12 text-base font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                                  onClick={() => document.getElementById("image-upload")?.click()}
                                  disabled={loading}
                                >
                                  <ImageIcon className="w-4 h-4 mr-2" />
                                  Upload Image
                                </Button>
                              </div>
                            </div>

                            {/* PDF Preview and Generate Button */}
                            {pdfPreview && (
                              <div className="p-4 bg-gradient-to-r from-gray-800/80 to-blue-500/5 rounded-lg border border-blue-500/20">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h4 className="font-medium text-white">{pdfPreview.name}</h4>
                                    <p className="text-sm text-gray-400">{pdfPreview.size}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setPdfFile(null)
                                      setPdfPreview(null)
                                    }}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="space-y-3">
                                  <Button
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                    onClick={handleGenerateCardsFromPdf}
                                    disabled={loading}
                                  >
                                    {loading && loadingType === "pdf" ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating Cards...
                                      </>
                                    ) : (
                                      <>
                                        <Zap className="w-4 h-4 mr-2" />
                                        Generate Cards
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                                    onClick={handleGenerateCardsFromPdf}
                                    disabled={loading}
                                  >
                                    {loading && loadingType === "pdf" ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                      </>
                                    ) : (
                                      <>
                                        <Highlighter className="w-4 h-4 mr-2" />
                                        Highlight & Generate
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Image Preview and Generate Button */}
                            {imagePreview && (
                              <div className="p-4 bg-gradient-to-r from-gray-800/80 to-purple-500/5 rounded-lg border border-purple-500/20">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h4 className="font-medium text-white">{imagePreview.name}</h4>
                                    <p className="text-sm text-gray-400">{imagePreview.size}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setImageFile(null)
                                      setImagePreview(null)
                                    }}
                                    className="text-gray-400 hover:text-white"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                                <Button
                                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                                  onClick={handleGenerateCardsFromImage}
                                  disabled={loading}
                                >
                                  {loading && loadingType === "image" ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Generating Cards...
                                    </>
                                  ) : (
                                    <>
                                      <Zap className="w-4 h-4 mr-2" />
                                      Generate Cards
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Learning Card */}
                  <Card className="bg-[#151D1B] border-gray-700/30 hover:border-cyan-500/50 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 animate-in slide-in-from-right duration-700 delay-200 group backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center text-white text-xl">
                        <div className="p-2 bg-cyan-500/20 rounded-lg mr-3 group-hover:bg-cyan-500/30 transition-all duration-300">
                          <Brain className="w-5 h-5 text-cyan-400" />
                        </div>
                        Ask AI to Learn
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-base mt-5">
                        Describe any topic and let AI create personalized learning cards
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="relative">
                        <Textarea
                          placeholder="What would you like to learn about today?"
                          className="bg-gradient-to-r from-gray-800/80 to-cyan-500/5 border-gray-600/50 text-white resize-none h-24 text-base focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 pr-12 placeholder:text-gray-400"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-2 top-2 h-8 w-8 p-0 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-all duration-200 hover:scale-110"
                          onClick={handleVoiceInput}
                          disabled={loading}
                        >
                          {isRecording ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white h-12 text-base font-medium hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl"
                        onClick={handleGenerateCardsFromText}
                        disabled={loading || !textInput.trim()}
                      >
                        {loading && loadingType === "text" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Learning Cards
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent animate-in slide-in-from-left duration-700 delay-300">
                My Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card
                    key={index}
                    className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/30 hover:border-emerald-500/40 transition-all hover:shadow-xl hover:shadow-emerald-500/5 hover:scale-105 animate-in slide-in-from-bottom duration-700 group backdrop-blur-sm"
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                        <div
                          className={`p-3 bg-gradient-to-br ${stat.bgColor} rounded-xl group-hover:scale-110 transition-all duration-300`}
                        >
                          <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Learning */}
            <div className="space-y-8">
              <div className="flex items-center justify-between animate-in slide-in-from-left duration-700 delay-500">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">
                    Continue Learning
                  </h2>
                  <p className="text-gray-300 mt-2">Pick up where you left off with your recent study sessions</p>
                </div>
                <Button
                  variant="ghost"
                  className="text-emerald-400 hover:bg-emerald-500/10 hover:scale-105 transition-all duration-200 group"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentTopics.length > 0 ? (
                  recentTopics.map((topic, index) => {
                    const sourceInfo = getSourceTypeInfo(topic.type)
                    const SourceIcon = sourceInfo.icon

                    return (
                      <Card
                        key={topic.sessionId}
                        className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/30 hover:border-emerald-500/40 transition-all cursor-pointer hover:shadow-xl hover:shadow-emerald-500/10 hover:scale-[1.02] animate-in slide-in-from-bottom duration-700 group backdrop-blur-sm"
                        style={{ animationDelay: `${600 + index * 100}ms` }}
                        onClick={() => navigateToLearn(topic.sessionId)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded-lg ${sourceInfo.bgColor}`}>
                                  <SourceIcon className={`w-4 h-4 ${sourceInfo.color}`} />
                                </div>
                                <span className="text-xs font-medium text-gray-400">{sourceInfo.label}</span>
                              </div>
                              <h3 className="font-bold text-white mb-3 text-lg group-hover:text-emerald-400 transition-colors duration-300">
                                {topic.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span className="flex items-center">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  {topic.cards} cards
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {topic.timeSpent}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-emerald-400 hover:bg-emerald-500/10 hover:scale-110 transition-all duration-200"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400 font-medium">Progress</span>
                              <span className="text-white font-bold">{topic.progress}%</span>
                            </div>
                            <Progress value={topic.progress} className="h-3 transition-all duration-500" />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                      <BookOpen className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Recent Topics</h3>
                    <p className="text-gray-400">Start learning by uploading content or asking AI to create cards</p>
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Topics */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent animate-in slide-in-from-left duration-700 delay-700">
                Suggested Topics
              </h2>

              <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/30 hover:border-purple-500/30 transition-all animate-in slide-in-from-bottom duration-700 delay-800 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-xl">Recommended for You</CardTitle>
                  <CardDescription className="text-gray-300 text-base">
                    Based on your learning history and goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {suggestedTopics.map((topic, index) => (
                      <div
                        key={index}
                        className="p-6 bg-gradient-to-br from-gray-800/60 to-purple-500/5 rounded-xl border border-gray-700/30 hover:border-purple-500/40 transition-all duration-500 cursor-pointer hover:shadow-lg hover:scale-[1.02] group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-2 text-lg group-hover:text-purple-400 transition-colors duration-300">
                              {topic.title}
                            </h4>
                            <div className="flex items-center space-x-3">
                              <Badge
                                variant="outline"
                                className="text-xs border-purple-500/30 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors duration-300"
                              >
                                {topic.difficulty}
                              </Badge>
                              <span className="text-sm text-gray-400 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {topic.time}
                              </span>
                            </div>
                          </div>
                          <Star className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <Button
                          size="sm"
                          className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 hover:border-purple-500/50 hover:scale-[1.02] transition-all duration-300"
                          onClick={() => handleStartLearning(topic.title)}
                          disabled={loadingTopic !== null}
                        >
                          {loadingTopic === topic.title ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating Cards...
                            </>
                          ) : (
                            "Start Learning"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Genre Selection Modal */}
      <GenreModal
        isOpen={showGenreModal}
        onClose={() => {
          setShowGenreModal(false)
          setPendingGeneration(null)
        }}
        onGenreSelect={handleGenreSelection}
        selectedGenre={selectedGenre}
      />
    </div>
  )
}
