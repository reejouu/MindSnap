import { NextRequest, NextResponse } from "next/server";
import { joinBattle } from "@/lib/battle";

export async function POST(request: NextRequest) {
  try {
    const { battleId, user } = await request.json();
    
    if (!battleId || !user) {
      return NextResponse.json(
        { error: "Missing battleId or user" },
        { status: 400 }
      );
    }

    const battle = await joinBattle(battleId, user);
    
    if (!battle) {
      return NextResponse.json(
        { error: "Battle not found or not available" },
        { status: 404 }
      );
    }

    return NextResponse.json(battle);
  } catch (error) {
    console.error("Error joining battle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
