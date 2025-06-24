"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  Calendar,
  Clock,
  BookOpen,
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  X,
  Sparkles,
} from "lucide-react"
import Navbar from "@/components/navbar"
import { useAccount } from "wagmi"
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { RewardDispenserABI, RewardDispenserAddress } from "@/contract"

interface LeaderboardUser {
  rank?: number
  name: string
  walletId: string
  score: number
  totalQuizzes: number
  avgScore: number
  avatar?: string
  isCurrentUser?: boolean
}

export default function Leaderboard({
  userName,
  userEmail,
}: {
  userName: string
  userEmail: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"monthly" | "weekly">("monthly")
  const { address, isConnected } = useAccount()
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRewardPopup, setShowRewardPopup] = useState(false)
  const [hasClaimed, setHasClaimed] = useState(false)
  const [rewardAmount, setRewardAmount] = useState<number | null>(null)

  const { data: hash, writeContract, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Load claimed status from localStorage on component mount
  useEffect(() => {
    if (address) {
      const claimedKey = `reward_claimed_${address.toLowerCase()}_${activeTab}`
      const claimed = localStorage.getItem(claimedKey) === 'true'
      setHasClaimed(claimed)
    }
  }, [address, activeTab])

  useEffect(() => {
    console.log("isSuccess changed:", isSuccess)
    console.log("hash:", hash)
    console.log("isConfirming:", isConfirming)

    if (isSuccess && hash && !hasClaimed) {
      console.log("Transaction successful! Showing popup")
      setShowRewardPopup(true)
      setHasClaimed(true)
      
      // Persist claimed status to localStorage
      if (address) {
        const claimedKey = `reward_claimed_${address.toLowerCase()}_${activeTab}`
        localStorage.setItem(claimedKey, 'true')
      }
    }
  }, [isSuccess, hash, isConfirming, hasClaimed, address, activeTab])

  // Additional effect to handle hash changes
  useEffect(() => {
    if (hash && !isConfirming && !isPending && !hasClaimed) {
      console.log("Transaction hash detected and confirmed:", hash)
      // Small delay to ensure isSuccess has time to update
      setTimeout(() => {
        if (!showRewardPopup && !hasClaimed) {
          console.log("Manually triggering popup due to hash confirmation")
          setShowRewardPopup(true)
          setHasClaimed(true)
          
          // Persist claimed status to localStorage
          if (address) {
            const claimedKey = `reward_claimed_${address.toLowerCase()}_${activeTab}`
            localStorage.setItem(claimedKey, 'true')
          }
        }
      }, 1000)
    }
  }, [hash, isConfirming, isPending, showRewardPopup, hasClaimed, address, activeTab])

  // Debug function to manually test popup
  const testPopup = () => {
    console.log("Testing popup manually")
    setShowRewardPopup(true)
  }

  function handleClaimReward() {
    writeContract({
      address: RewardDispenserAddress,
      abi: RewardDispenserABI,
      functionName: "claimReward",
      account: address,
    })
  }

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/leaderboard?period=${activeTab}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || "Failed to fetch leaderboard")
        }
        return res.json()
      })
      .then((data) => {
        // Map API data to LeaderboardUser interface
        let leaderboardData: LeaderboardUser[] = data.map((user: any) => {
          const isCurrentUser = address && user.walletAddress?.toLowerCase() === address.toLowerCase()
          return {
            name: user.username,
            walletId: user.walletAddress,
            score: user.totalScore,
            totalQuizzes: user.quizCount,
            avgScore: user.averageScore,
            isCurrentUser: isCurrentUser,
          }
        })
        // No dummy users, only use API data
        // Sort by score descending
        leaderboardData.sort((a: LeaderboardUser, b: LeaderboardUser) => b.score - a.score)
        // Assign ranks
        leaderboardData = leaderboardData.map((user: LeaderboardUser, idx: number) => ({
          ...user,
          rank: idx + 1,
        }))
        setLeaderboard(leaderboardData)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch leaderboard")
        setLoading(false)
      })
  }, [address, activeTab])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Not Connected</h2>
          <p className="text-gray-400">Please connect your wallet to view the leaderboard</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-300">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500/20 to-red-400/20 rounded-full flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Leaderboard Error</h2>
          <p className="mb-4 text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  // Check if leaderboard is empty
  if (leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] text-white">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showSidebarToggle={false} />
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 rounded-full flex items-center justify-center mb-6">
              <Trophy className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">No Leaderboard Data</h2>
            <p className="mb-4 text-gray-400">Complete a quiz to appear on the leaderboard!</p>
          </div>
        </div>
      </div>
    )
  }

  // Find current user in leaderboard
  const currentUser = leaderboard.find((user) => user.isCurrentUser)
  // Get top 10 users
  const topTen = leaderboard.slice(0, 10)

  // Get current user's section (5 above and 5 below if not in top 10)
  const getUserSection = () => {
    if (!currentUser || currentUser.rank === undefined || currentUser.rank <= 10) return []
    const userIndex = leaderboard.findIndex((user) => user.isCurrentUser)
    const start = Math.max(0, userIndex - 5)
    const end = Math.min(leaderboard.length, userIndex + 6)
    return leaderboard.slice(start, end)
  }

  const userSection = getUserSection()
  const showGap = currentUser && (currentUser.rank ?? 0) > 15

  console.log("Rendering leaderboard with:", {
    leaderboard: leaderboard.map((u) => ({
      name: u.name,
      rank: u.rank,
      score: u.score,
      isCurrentUser: u.isCurrentUser,
    })),
    topTen: topTen.map((u) => ({
      name: u.name,
      rank: u.rank,
      score: u.score,
      isCurrentUser: u.isCurrentUser,
    })),
    currentUser: currentUser
      ? {
          name: currentUser.name,
          rank: currentUser.rank,
          score: currentUser.score,
        }
      : null,
    userSection,
  }) // Debug render

  // Helper function to shorten wallet address
  const shortenWalletAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Trophy className="w-6 h-6 text-gray-300" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-500" />
      default:
        return <Award className="w-5 h-5 text-gray-400" />
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-black font-bold"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold"
      default:
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
    }
  }

  const TopThreeCard = ({ user, index }: { user: LeaderboardUser; index: number }) => (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:scale-105 backdrop-blur-sm ${
        index === 0
          ? "bg-gradient-to-br from-yellow-500/10 to-yellow-400/5 border-yellow-500/30 shadow-lg shadow-yellow-500/10"
          : index === 1
            ? "bg-gradient-to-br from-gray-500/10 to-gray-400/5 border-gray-500/30 shadow-lg shadow-gray-500/10"
            : "bg-gradient-to-br from-amber-500/10 to-amber-400/5 border-amber-500/30 shadow-lg shadow-amber-500/10"
      } ${user.isCurrentUser ? "ring-2 ring-cyan-400 shadow-xl shadow-cyan-400/20" : ""}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            {getRankIcon(user.rank ?? 0)}
            <Badge className={`absolute -top-2 -right-2 text-xs ${getRankBadgeColor(user.rank ?? 0)}`}>
              #{user.rank ?? 0}
            </Badge>
          </div>

          <Avatar className="w-16 h-16 border-4 border-emerald-500/30 shadow-lg">
            <AvatarFallback className="text-lg font-bold bg-emerald-500/20 text-emerald-400">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white">{user.name}</h3>
            <code className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded border border-gray-700/50">
              {shortenWalletAddress(user.walletId)}
            </code>
            {user.isCurrentUser && (
              <Badge className="bg-cyan-500/20 text-cyan-400 text-xs border border-cyan-500/30">You</Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 w-full text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <Star className="w-4 h-4 text-emerald-400 mr-1" />
                <span className="font-bold text-white">{user.score.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400">Total Points</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-400 mr-1" />
                <span className="font-bold text-white">{user.totalQuizzes}</span>
              </div>
              <p className="text-xs text-gray-400">Quizzes</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <Target className="w-4 h-4 text-cyan-400 mr-1" />
                <span className="font-bold text-white">{user.avgScore}%</span>
              </div>
              <p className="text-xs text-gray-400">Avg Score</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showSidebarToggle={false} />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 p-5 rounded-full shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1
            className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4"
            style={{ position: "relative", top: "-8px", paddingBottom: "8px" }} // increased lift
          >
            Top Learners
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover the most dedicated learners in our community. Compete, learn, and climb the ranks!
          </p>
        </div>

        {/* Current User Stats */}
        {currentUser && (
          <Card className="mb-12 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 border-emerald-500/30 shadow-xl backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-4 border-cyan-400 shadow-lg">
                      <AvatarFallback className="text-xl font-bold bg-cyan-500/20 text-cyan-400">
                        {currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white">
                      You
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">{currentUser.name}</h3>
                    <code className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-lg border border-gray-700/50">
                      {shortenWalletAddress(currentUser.walletId)}
                    </code>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <span className="text-3xl font-bold text-white">#{currentUser.rank}</span>
                      </div>
                      <p className="text-gray-400 font-medium">Your Rank</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="w-5 h-5 text-emerald-400" />
                        <span className="text-3xl font-bold text-white">{currentUser.score.toLocaleString()}</span>
                      </div>
                      <p className="text-gray-400 font-medium">Total Points</p>
                    </div>
                  </div>
                  {currentUser.rank === 1 && (
                    <Button
                      onClick={handleClaimReward}
                      disabled={isPending || isConfirming || hasClaimed}
                      className={`group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 ${
                        hasClaimed
                          ? "bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-not-allowed opacity-75"
                          : "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black hover:shadow-xl hover:from-yellow-500 hover:to-yellow-700 hover:scale-105 focus:ring-yellow-400/50"
                      }`}
                    >
                      {hasClaimed ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Award className="w-5 h-5 text-black group-hover:scale-110 transition-transform duration-300" />
                      )}
                      <span className="tracking-wide">
                        {hasClaimed 
                          ? "Reward Claimed" 
                          : isPending || isConfirming 
                            ? "Claiming..." 
                            : "Claim Your Tokens"
                        }
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">🏆 Hall of Fame</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {topTen.slice(0, 3).map((user, index) => (
              <TopThreeCard key={user.rank} user={user} index={index} />
            ))}
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-800/50 rounded-xl p-2 border border-emerald-500/20 shadow-lg backdrop-blur-sm">
            <Button
              variant={activeTab === "monthly" ? "default" : "ghost"}
              onClick={() => setActiveTab("monthly")}
              className={`px-8 py-3 rounded-lg transition-all font-medium ${
                activeTab === "monthly"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-300 hover:bg-emerald-500/10 hover:text-white"
              }`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Monthly Champions
            </Button>
            <Button
              variant={activeTab === "weekly" ? "default" : "ghost"}
              onClick={() => setActiveTab("weekly")}
              className={`px-8 py-3 rounded-lg transition-all font-medium ${
                activeTab === "weekly"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-gray-300 hover:bg-emerald-500/10 hover:text-white"
              }`}
            >
              <Clock className="w-5 h-5 mr-2" />
              Weekly Leaders
            </Button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border-gray-700/50 shadow-xl backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border-b border-emerald-500/20">
            <CardTitle className="text-2xl text-white flex items-center">
              <Trophy className="w-6 h-6 mr-3 text-emerald-400" />
              {activeTab === "monthly" ? "Monthly" : "Weekly"} Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-6 border-b border-gray-700/30 bg-emerald-500/5 font-semibold text-gray-300">
                <div className="col-span-1">Rank</div>
                <div className="col-span-3">Learner</div>
                <div className="col-span-3">Wallet Address</div>
                <div className="col-span-1 text-center">Quizzes</div>
                <div className="col-span-2 text-center">Avg Score</div>
                <div className="col-span-2 text-right">Total Points</div>
              </div>

              {/* All Top 10 Users */}
              {topTen.map((user, index) => (
                <div
                  key={`top-${user.rank}`}
                  className={`grid grid-cols-12 gap-4 p-6 border-b border-gray-700/20 hover:bg-emerald-500/5 transition-all duration-200 ${
                    user.isCurrentUser ? "bg-cyan-500/10 border-cyan-500/30" : ""
                  }`}
                >
                  <div className="col-span-1 flex items-center space-x-3">
                    {getRankIcon(user.rank ?? 0)}
                    <Badge className={getRankBadgeColor(user.rank ?? 0)}>#{user.rank ?? 0}</Badge>
                  </div>
                  <div className="col-span-3 flex items-center space-x-4">
                    <Avatar className="w-12 h-12 border-2 border-emerald-500/20">
                      <AvatarFallback className="text-emerald-400 font-semibold bg-emerald-500/10">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{user.name}</p>
                      {user.isCurrentUser && (
                        <Badge className="text-xs bg-cyan-500/20 text-cyan-400 mt-1 border border-cyan-500/30">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <code className="text-sm text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg font-mono border border-gray-700/50">
                      {shortenWalletAddress(user.walletId)}
                    </code>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="flex items-center space-x-2 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-white">{user.totalQuizzes}</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center space-x-2 bg-cyan-500/10 px-3 py-2 rounded-lg border border-cyan-500/20">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white">{user.avgScore}%</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-2 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                        <Star className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-xl text-white">{user.score.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Gap Indicator */}
              {showGap && (
                <div className="flex items-center justify-center py-8 border-b border-gray-700/20">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <div className="w-16 border-t-2 border-dotted border-gray-500"></div>
                    <div className="bg-gray-700/50 px-4 py-2 rounded-full">
                      <span className="text-sm font-medium">...</span>
                    </div>
                    <div className="w-16 border-t-2 border-dotted border-gray-500"></div>
                  </div>
                </div>
              )}

              {/* User Section (if not in top 10) */}
              {userSection.length > 0 && (
                <>
                  {userSection.map((user, index) => (
                    <div
                      key={`user-${user.rank}`}
                      className={`grid grid-cols-12 gap-4 p-6 border-b border-gray-700/20 hover:bg-emerald-500/5 transition-all duration-200 ${
                        user.isCurrentUser ? "bg-cyan-500/10 border-cyan-500/30" : ""
                      }`}
                    >
                      <div className="col-span-1 flex items-center space-x-3">
                        {getRankIcon(user.rank ?? 0)}
                        <Badge className={getRankBadgeColor(user.rank ?? 0)}>#{user.rank ?? 0}</Badge>
                      </div>
                      <div className="col-span-3 flex items-center space-x-4">
                        <Avatar className="w-12 h-12 border-2 border-emerald-500/20">
                          <AvatarFallback className="text-emerald-400 font-semibold bg-emerald-500/10">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          {user.isCurrentUser && (
                            <Badge className="text-xs bg-cyan-500/20 text-cyan-400 mt-1 border border-cyan-500/30">
                              You
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <code className="text-sm text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg font-mono border border-gray-700/50">
                          {shortenWalletAddress(user.walletId)}
                        </code>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="flex items-center space-x-2 bg-blue-500/10 px-3 py-2 rounded-lg border border-blue-500/20">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          <span className="font-bold text-white">{user.totalQuizzes}</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="flex items-center space-x-2 bg-cyan-500/10 px-3 py-2 rounded-lg border border-cyan-500/20">
                          <Target className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold text-white">{user.avgScore}%</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-2 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                            <Star className="w-4 h-4 text-emerald-400" />
                            <span className="font-bold text-xl text-white">{user.score.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Rankings</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Updates Every Hour</span>
            </div>
          </div>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Rankings are based on total points earned through quiz completion, accuracy, and learning streaks. Keep
            learning to climb higher! 🚀
          </p>
        </div>

        {/* Reward Success Popup */}
        {showRewardPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/90 border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 backdrop-blur-sm">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">🎉 Reward Claimed!</h3>
                  <p className="text-gray-300">
                    Congratulations! Your tokens have been sent to your wallet. Check your wallet to see your reward!
                  </p>
                  {rewardAmount && (
                    <div className="text-lg font-semibold text-emerald-400">Amount Received: {rewardAmount} ETH</div>
                  )}
                </div>

                <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                  <div className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-white">
                      Transaction Hash: {hash?.slice(0, 10)}...{hash?.slice(-8)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowRewardPopup(false)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  Awesome! 🚀
                </Button>
              </div>

              <button
                onClick={() => setShowRewardPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors hover:bg-red-500/10 rounded-lg p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
