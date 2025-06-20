// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  await dbConnect();

  const leaderboard = await User.find()
    .sort({ averageScore: -1 }) // or use totalScore if that's your main metric
    .select('username walletAddress averageScore quizCount totalScore') // include totalScore
    .limit(10);

  // Optional: Format data before sending it (e.g. round averageScore, shorten wallet)
  const formatted = leaderboard.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    walletAddress: user.walletAddress,
    quizCount: user.quizCount,
    averageScore: Math.round(user.averageScore * 100) / 100, // 2 decimal places
    totalScore: user.totalScore,
  }));

  return NextResponse.json(formatted);
}
