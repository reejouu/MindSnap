import { NextRequest, NextResponse } from "next/server";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { getBattle } from "@/lib/battle";

type NextApiResponseWithSocket = NextResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

let io: SocketIOServer | undefined;

function initializeSocket(res: NextApiResponseWithSocket) {
  if (!io) {
    console.log("🔌 Initializing Socket.IO server...");

    const httpServer: NetServer = res.socket.server as any;

    io = new SocketIOServer(httpServer, {
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      console.log("🧠 Client connected: " + socket.id);

      socket.on("join_battle", async (data: { battleId: string; username: string }) => {
        const { battleId, username } = data;
        socket.join(battleId);
        
        // Notify other players in the room
        socket.to(battleId).emit("opponent_joined", { username });
        console.log(`User ${username} joined battle ${battleId}`);

        // Get updated battle data and emit to all players
        try {
          const battle = await getBattle(battleId);
          if (battle) {
            io?.to(battleId).emit("battle_updated", battle);
          }
        } catch (error) {
          console.error("Error fetching battle data:", error);
        }
      });

      socket.on("question_answered", (data: { battleId: string; user: string; questionId: string; isCorrect: boolean }) => {
        const { battleId, user, questionId, isCorrect } = data;
        socket.to(battleId).emit("opponent_answered", { user, questionId, isCorrect });
        console.log(`User ${user} answered question ${questionId} correctly: ${isCorrect}`);
      });

      socket.on("submit_score", async (data: { battleId: string; user: string; score: number }) => {
        const { battleId, user, score } = data;
        socket.to(battleId).emit("opponent_score", { user, score });
        console.log(`User ${user} submitted score ${score} for battle ${battleId}`);

        // Get updated battle data and emit to all players
        try {
          const battle = await getBattle(battleId);
          if (battle) {
            io?.to(battleId).emit("battle_updated", battle);
          }
        } catch (error) {
          console.error("Error fetching battle data:", error);
        }
      });

      socket.on("end_battle", async (data: { battleId: string; winner: string }) => {
        const { battleId, winner } = data;
        io?.to(battleId).emit("battle_ended", { winner });
        console.log(`Battle ${battleId} ended with winner: ${winner}`);

        // Get final battle data and emit to all players
        try {
          const battle = await getBattle(battleId);
          if (battle) {
            io?.to(battleId).emit("battle_updated", battle);
          }
        } catch (error) {
          console.error("Error fetching battle data:", error);
        }
      });

      socket.on("disconnect", () => {
        console.log("🧠 Client disconnected: " + socket.id);
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("✅ Socket.IO server already running");
  }
}

export async function GET(request: NextRequest, res: NextApiResponseWithSocket) {
  initializeSocket(res);
  return new NextResponse("Socket.IO server running", { status: 200 });
}

export async function POST(request: NextRequest, res: NextApiResponseWithSocket) {
  initializeSocket(res);
  return new NextResponse("Socket.IO server running", { status: 200 });
} 