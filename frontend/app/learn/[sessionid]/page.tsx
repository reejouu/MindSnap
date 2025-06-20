"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import FlashcardSystem from "@/components/flashcard-system"
import { toast } from "sonner"

interface FlashcardData {
  id: string
  title: string
  content: string
  type: "learning" | "quiz"
  teaser?: string
}

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([])
  const [loading, setLoading] = useState(true)
  const [topic, setTopic] = useState("")

  useEffect(() => {
    // Get session ID from URL
    const sessionId = typeof window !== 'undefined' 
      ? window.location.pathname.split('/').pop()
      : params?.sessionId

    console.log('Loading session:', sessionId)
    
    if (!sessionId) {
      console.error("No session ID provided")
      toast.error("Invalid session")
      router.push("/dashboard")
      return
    }

    const storedData = localStorage.getItem(`flashcards_${sessionId}`)
    console.log('Retrieved from localStorage:', storedData)
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        console.log('Parsed data:', data)
        if (data.cards && Array.isArray(data.cards)) {
          setFlashcards(data.cards)
          setTopic(data.topic || "Learning Session")
        } else {
          throw new Error("Invalid flashcard data structure")
        }
      } catch (error) {
        console.error("Error parsing flashcard data:", error)
        toast.error("Failed to load flashcards")
        router.push("/dashboard")
      }
    } else {
      console.error("No data found for session:", sessionId)
      toast.error("No flashcards found for this session")
      router.push("/dashboard")
    }
    setLoading(false)
  }, [params?.sessionId, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Flashcards Found</h2>
          <p className="mb-4">There are no flashcards available for this session.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Get sessionId for navigation (same logic as useEffect)
  const sessionId = typeof window !== 'undefined' 
    ? window.location.pathname.split('/').pop()
    : params?.sessionId

  return (
    <FlashcardSystem
      sessionId={sessionId as string}
      topic={topic}
      mode="learning"
      cards={flashcards}
      userName={"Guest"}
      onExit={() => router.push("/dashboard")}
      onFinishLearning={() => {
        if (sessionId) {
          router.push(`/quiz/${sessionId}`)
        } else {
          toast.error("Session ID missing. Cannot start quiz.")
          router.push("/dashboard")
        }
      }}
      onSkipQuiz={() => router.push("/dashboard")}
    />
  )
}
