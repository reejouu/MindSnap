"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function LearnRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get session from URL params or default to javascript-fundamentals
    const session = searchParams?.get("session") || "javascript-fundamentals"
    router.replace(`/learn/${session}`)
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text mb-2">Redirecting...</h1>
        <p className="text-text/60">Taking you to your learning session</p>
      </div>
    </div>
  )
}
