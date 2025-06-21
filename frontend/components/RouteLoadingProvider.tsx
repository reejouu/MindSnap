"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import LoadingOverlay from "@/components/LoadingOverlay"

export function RouteLoadingProvider() {
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null
    const handleStart = () => {
      timeout = setTimeout(() => setShow(true), 120)
      setLoading(true)
    }
    const handleStop = () => {
      if (timeout) clearTimeout(timeout)
      setLoading(false)
      setTimeout(() => setShow(false), 400)
    }
    // Listen for browser navigation events
    const handlePush = () => handleStart()
    window.addEventListener("beforeunload", handlePush)
    return () => {
      window.removeEventListener("beforeunload", handlePush)
      if (timeout) clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    setLoading(false)
    setTimeout(() => setShow(false), 400)
  }, [pathname])

  return <LoadingOverlay show={loading || show} />
}
