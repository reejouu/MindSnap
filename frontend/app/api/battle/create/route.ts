import { NextRequest, NextResponse } from "next/server";
import { createBattle } from "@/lib/battle";

export async function POST(request: NextRequest) {
  try {
    const { topic, user } = await request.json();
    
    if (!topic || !user) {
      return NextResponse.json(
        { error: "Missing topic or user" },
        { status: 400 }
      );
    }

    const battle = await createBattle(topic, user);
    return NextResponse.json(battle);
  } catch (error) {
    console.error("Error creating battle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
