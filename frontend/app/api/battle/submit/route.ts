import { NextRequest, NextResponse } from "next/server";
import { submitScore } from "@/lib/battle";

export async function POST(request: NextRequest) {
  try {
    const { battleId, userId, score } = await request.json();
    
    if (!battleId || !userId || score === undefined) {
      return NextResponse.json(
        { error: "Missing battleId, userId, or score" },
        { status: 400 }
      );
    }

    const result = await submitScore(battleId, userId, score);
    
    if (!result) {
      return NextResponse.json(
        { error: "Battle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error submitting score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
