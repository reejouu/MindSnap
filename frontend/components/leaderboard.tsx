"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "lucide-react";
import Navbar from "@/components/navbar";
import { useAccount } from "wagmi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { RewardDispenserABI, RewardDispenserAddress } from "@/contract";

interface LeaderboardUser {
  rank?: number;
  name: string;
  walletId: string;
  score: number;
  totalQuizzes: number;
  avgScore: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

export default function Leaderboard({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"monthly" | "weekly">("monthly");
  const { address, isConnected } = useAccount();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  const { data: hash, writeContract, isPending } = useWriteContract();

  function handleClaimReward() {
    writeContract({
      address: RewardDispenserAddress,
      abi: RewardDispenserABI,
      functionName: "claimReward",
      account: address,
    });
  }
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    console.log("isSuccess changed:", isSuccess);
    console.log("hash:", hash);
    console.log("isConfirming:", isConfirming);
    
    if (isSuccess && hash && !hasClaimed) {
      console.log("Transaction successful! Showing popup");
      setShowRewardPopup(true);
      setHasClaimed(true);
    }
  }, [isSuccess, hash, isConfirming, hasClaimed]);

  // Additional effect to handle hash changes
  useEffect(() => {
    if (hash && !isConfirming && !isPending && !hasClaimed) {
      console.log("Transaction hash detected and confirmed:", hash);
      // Small delay to ensure isSuccess has time to update
      setTimeout(() => {
        if (!showRewardPopup && !hasClaimed) {
          console.log("Manually triggering popup due to hash confirmation");
          setShowRewardPopup(true);
          setHasClaimed(true);
        }
      }, 1000);
    }
  }, [hash, isConfirming, isPending, showRewardPopup, hasClaimed]);

  // Debug function to manually test popup
  const testPopup = () => {
    console.log("Testing popup manually");
    setShowRewardPopup(true);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/leaderboard?period=${activeTab}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch leaderboard");
        }
        return res.json();
      })
      .then((data) => {
        // Map API data to LeaderboardUser interface
        let leaderboardData: LeaderboardUser[] = data.map((user: any) => {
          const isCurrentUser =
            address &&
            user.walletAddress?.toLowerCase() === address.toLowerCase();
          return {
            name: user.username,
            walletId: user.walletAddress,
            score: user.totalScore,
            totalQuizzes: user.quizCount,
            avgScore: user.averageScore,
            isCurrentUser: isCurrentUser,
          };
        });
        // No dummy users, only use API data
        // Sort by score descending
        leaderboardData.sort(
          (a: LeaderboardUser, b: LeaderboardUser) => b.score - a.score
        );
        // Assign ranks
        leaderboardData = leaderboardData.map(
          (user: LeaderboardUser, idx: number) => ({
            ...user,
            rank: idx + 1,
          })
        );
        setLeaderboard(leaderboardData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch leaderboard");
        setLoading(false);
      });
  }, [address, activeTab]);

  if (!isConnected) {
    return <p>Wallet not connected</p>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Leaderboard Error</h2>
          <p className="mb-4">{error}</p>
        </div>
      </div>
    );
  }

  // Check if leaderboard is empty
  if (leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-background text-text">
        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          showSidebarToggle={false}
        />
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No Leaderboard Data</h2>
            <p className="mb-4">
              Complete a quiz to appear on the leaderboard!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Find current user in leaderboard
  const currentUser = leaderboard.find((user) => user.isCurrentUser);
  // Get top 10 users
  const topTen = leaderboard.slice(0, 10);

  // Get current user's section (5 above and 5 below if not in top 10)
  const getUserSection = () => {
    if (
      !currentUser ||
      currentUser.rank === undefined ||
      currentUser.rank <= 10
    )
      return [];
    const userIndex = leaderboard.findIndex((user) => user.isCurrentUser);
    const start = Math.max(0, userIndex - 5);
    const end = Math.min(leaderboard.length, userIndex + 6);
    return leaderboard.slice(start, end);
  };

  const userSection = getUserSection();
  const showGap = currentUser && (currentUser.rank ?? 0) > 15;

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
  }); // Debug render

  // Helper function to shorten wallet address
  const shortenWalletAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Award className="w-5 h-5 text-text/60" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-black";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-black";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  const TopThreeCard = ({
    user,
    index,
  }: {
    user: LeaderboardUser;
    index: number;
  }) => (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
        index === 0
          ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 dark:from-yellow-900/20 dark:to-yellow-800/20 dark:border-yellow-600"
          : index === 1
          ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 dark:from-gray-800/20 dark:to-gray-700/20 dark:border-gray-500"
          : "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 dark:from-amber-900/20 dark:to-amber-800/20 dark:border-amber-600"
      } ${user.isCurrentUser ? "ring-2 ring-accent shadow-lg" : ""}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            {getRankIcon(user.rank ?? 0)}
            <Badge
              className={`absolute -top-2 -right-2 text-xs font-bold ${getRankBadgeColor(
                user.rank ?? 0
              )}`}
            >
              #{user.rank ?? 0}
            </Badge>
          </div>

          <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
            <AvatarFallback className="text-lg font-bold bg-primary/20 text-primary">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <h3 className="font-bold text-lg text-text">{user.name}</h3>
            <code className="text-xs text-text/70 bg-black/10 px-2 py-1 rounded">
              {shortenWalletAddress(user.walletId)}
            </code>
            {user.isCurrentUser && (
              <Badge className="bg-accent/20 text-accent text-xs">You</Badge>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 w-full text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <Star className="w-4 h-4 text-accent mr-1" />
                <span className="font-bold text-text">
                  {user.score.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-text/60">Total Points</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-500 mr-1" />
                <span className="font-bold text-text">{user.totalQuizzes}</span>
              </div>
              <p className="text-xs text-text/60">Quizzes</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center">
                <Target className="w-4 h-4 text-green-500 mr-1" />
                <span className="font-bold text-text">{user.avgScore}%</span>
              </div>
              <p className="text-xs text-text/60">Avg Score</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        showSidebarToggle={false}
      />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-full">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Top Learners
          </h1>
          <p className="text-xl text-text/70 max-w-2xl mx-auto">
            Discover the most dedicated learners in our community. Compete,
            learn, and climb the ranks!
          </p>
        </div>

        {/* Current User Stats */}
        {currentUser && (
          <Card className="mb-12 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/30 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20 border-4 border-accent shadow-lg">
                      <AvatarFallback className="text-xl font-bold bg-accent/20 text-accent">
                        {currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
                      You
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-text">
                      {currentUser.name}
                    </h3>
                    <code className="text-sm text-text/70 bg-background/50 px-3 py-1 rounded-lg">
                      {shortenWalletAddress(currentUser.walletId)}
                    </code>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        <span className="text-3xl font-bold text-text">
                          #{currentUser.rank}
                        </span>
                      </div>
                      <p className="text-text/60 font-medium">Your Rank</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="w-5 h-5 text-accent" />
                        <span className="text-3xl font-bold text-text">
                          {currentUser.score.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-text/60 font-medium">Total Points</p>
                    </div>
                  </div>
                  {currentUser.rank === 1 && (
                    <Button
                      onClick={handleClaimReward}
                      disabled={isPending || isConfirming}
                      className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-semibold shadow-md hover:shadow-xl hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
                    >
                      <Award className="w-5 h-5 text-black group-hover:scale-110 transition-transform duration-300" />
                      <span className="tracking-wide">
                        {isPending || isConfirming
                          ? "Claiming..."
                          : "Claim Your Tokens"}
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
          <h2 className="text-3xl font-bold text-center mb-8 text-text">
            🏆 Hall of Fame
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {topTen.slice(0, 3).map((user, index) => (
              <TopThreeCard key={user.rank} user={user} index={index} />
            ))}
          </div>
        </div>
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-12">
          <div className="bg-card rounded-xl p-2 border border-primary/20 shadow-lg">
            <Button
              variant={activeTab === "monthly" ? "default" : "ghost"}
              onClick={() => setActiveTab("monthly")}
              className={`px-8 py-3 rounded-lg transition-all font-medium ${
                activeTab === "monthly"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-text hover:bg-primary/10"
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
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-text hover:bg-primary/10"
              }`}
            >
              <Clock className="w-5 h-5 mr-2" />
              Weekly Leaders
            </Button>
          </div>
        </div>
        {/* Leaderboard Table */}
        <Card className="bg-card border-primary/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-primary/20">
            <CardTitle className="text-2xl text-text flex items-center">
              <Trophy className="w-6 h-6 mr-3 text-accent" />
              {activeTab === "monthly" ? "Monthly" : "Weekly"} Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-6 border-b border-primary/10 bg-primary/5 font-semibold text-text">
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
                  className={`grid grid-cols-12 gap-4 p-6 border-b border-primary/5 hover:bg-primary/5 transition-all duration-200 ${
                    user.isCurrentUser ? "bg-accent/10 border-accent/30" : ""
                  }`}
                >
                  <div className="col-span-1 flex items-center space-x-3">
                    {getRankIcon(user.rank ?? 0)}
                    <Badge className={getRankBadgeColor(user.rank ?? 0)}>
                      #{user.rank ?? 0}
                    </Badge>
                  </div>
                  <div className="col-span-3 flex items-center space-x-4">
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarFallback className="text-primary font-semibold bg-primary/10">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-text">{user.name}</p>
                      {user.isCurrentUser && (
                        <Badge className="text-xs bg-accent/20 text-accent mt-1">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <code className="text-sm text-text/80 bg-background/50 px-3 py-2 rounded-lg font-mono">
                      {shortenWalletAddress(user.walletId)}
                    </code>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-text">
                        {user.totalQuizzes}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="font-bold text-text">
                        {user.avgScore}%
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-2 bg-accent/10 px-3 py-2 rounded-lg">
                        <Star className="w-4 h-4 text-accent" />
                        <span className="font-bold text-xl text-text">
                          {user.score.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Gap Indicator */}
              {showGap && (
                <div className="flex items-center justify-center py-8 border-b border-primary/10">
                  <div className="flex items-center space-x-4 text-text/40">
                    <div className="w-16 border-t-2 border-dotted border-text/40"></div>
                    <div className="bg-text/10 px-4 py-2 rounded-full">
                      <span className="text-sm font-medium">...</span>
                    </div>
                    <div className="w-16 border-t-2 border-dotted border-text/40"></div>
                  </div>
                </div>
              )}

              {/* User Section (if not in top 10) */}
              {userSection.length > 0 && (
                <>
                  {userSection.map((user, index) => (
                    <div
                      key={`user-${user.rank}`}
                      className={`grid grid-cols-12 gap-4 p-6 border-b border-primary/5 hover:bg-primary/5 transition-all duration-200 ${
                        user.isCurrentUser
                          ? "bg-accent/10 border-accent/30"
                          : ""
                      }`}
                    >
                      <div className="col-span-1 flex items-center space-x-3">
                        {getRankIcon(user.rank ?? 0)}
                        <Badge className={getRankBadgeColor(user.rank ?? 0)}>
                          #{user.rank ?? 0}
                        </Badge>
                      </div>
                      <div className="col-span-3 flex items-center space-x-4">
                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                          <AvatarFallback className="text-primary font-semibold bg-primary/10">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-text">{user.name}</p>
                          {user.isCurrentUser && (
                            <Badge className="text-xs bg-accent/20 text-accent mt-1">
                              You
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <code className="text-sm text-text/80 bg-background/50 px-3 py-2 rounded-lg font-mono">
                          {shortenWalletAddress(user.walletId)}
                        </code>
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span className="font-bold text-text">
                            {user.totalQuizzes}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                          <Target className="w-4 h-4 text-green-500" />
                          <span className="font-bold text-text">
                            {user.avgScore}%
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <div className="text-right">
                          <div className="flex items-center justify-end space-x-2 bg-accent/10 px-3 py-2 rounded-lg">
                            <Star className="w-4 h-4 text-accent" />
                            <span className="font-bold text-xl text-text">
                              {user.score.toLocaleString()}
                            </span>
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
          <div className="flex items-center justify-center space-x-8 text-text/60">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Rankings</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Updates Every Hour</span>
            </div>
          </div>
          <p className="text-sm text-text/60 max-w-2xl mx-auto">
            Rankings are based on total points earned through quiz completion,
            accuracy, and learning streaks. Keep learning to climb higher! 🚀
          </p>
        </div>

        {/* Reward Success Popup */}
        {showRewardPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-accent/30 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-text">🎉 Reward Claimed!</h3>
                  <p className="text-text/70">
                    Congratulations! Your tokens have been sent to your wallet. 
                    Check your wallet to see your reward!
                  </p>
                </div>

                <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-text">
                      Transaction Hash: {hash?.slice(0, 10)}...{hash?.slice(-8)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowRewardPopup(false)}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-lg"
                >
                  Awesome! 🚀
                </Button>
              </div>
              
              <button
                onClick={() => setShowRewardPopup(false)}
                className="absolute top-4 right-4 text-text/50 hover:text-text transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
