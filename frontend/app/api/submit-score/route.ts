// app/api/submit-score/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  const { username, walletAddress, score } = await req.json();

  await dbConnect();

  try {
    const user = await User.findOne({ walletAddress });

    if (user) {
      user.totalScore += score;
      user.quizCount += 1;
      user.averageScore = user.totalScore / user.quizCount;
      await user.save();
    } else {
      await User.create({
        username,
        walletAddress,
        totalScore: score,
        quizCount: 1,
        averageScore: score,
      });
    }

    return NextResponse.json({ message: 'Score updated' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
