import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { nanoid } from "nanoid"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateRoomId(): string {
  // Generate a 6-character room ID using nanoid
  return nanoid(6).toUpperCase()
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function shortenAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getRandomAvatar(): string {
  const avatars = ["🎯", "🧠", "⚡", "🔥", "💎", "🚀", "🎮", "🏆", "⭐", "🎪"]
  return avatars[Math.floor(Math.random() * avatars.length)]
}

export function generateMockPlayer(name: string): {
  id: string
  name: string
  avatar: string
  rank: number
  wins: number
} {
  return {
    id: nanoid(),
    name,
    avatar: getRandomAvatar(),
    rank: Math.floor(Math.random() * 2000) + 100,
    wins: Math.floor(Math.random() * 50) + 5,
  }
}
