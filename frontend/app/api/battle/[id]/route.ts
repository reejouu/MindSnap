import { NextRequest, NextResponse } from "next/server";
import { getBattle } from "@/lib/battle";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Missing battle ID" },
        { status: 400 }
      );
    }

    const battle = await getBattle(id);
    
    if (!battle) {
      return NextResponse.json(
        { error: "Battle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(battle);
  } catch (error) {
    console.error("Error getting battle:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
