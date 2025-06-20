import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const walletAddress = searchParams.get("walletAddress");

  if (!walletAddress) {
    return NextResponse.json(
      { error: "walletAddress is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const user = await User.findOne({
      walletAddress: { $regex: new RegExp(`^${walletAddress}$`, "i") },
    }).select("username walletAddress averageScore quizCount totalScore");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formattedUser = {
      username: user.username,
      walletAddress: user.walletAddress,
      quizCount: user.quizCount,
      averageScore: Math.round(user.averageScore * 100) / 100, // 2 decimal places
      totalScore: user.totalScore,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 