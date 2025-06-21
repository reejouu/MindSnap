import { io, Socket } from "socket.io-client";

export interface Battle {
  _id: string;
  topic: string;
  status: "waiting" | "active" | "finished";
  players: Array<{
    userId: string;
    username: string;
    score?: number;
  }>;
  winnerId?: string;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
}

class BattleService {
  private socket: Socket | null = null;
  private currentBattle: Battle | null = null;
  private currentUser: User | null = null;

  // Initialize socket connection
  connect(user: User) {
    this.currentUser = user;
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      path: "/api/socket_io",
    });

    this.setupSocketListeners();
  }

  // Setup socket event listeners
  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to battle server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from battle server");
    });

    this.socket.on("opponent_joined", (data: { username: string }) => {
      console.log("Opponent joined:", data.username);
      // Emit custom event for React components
      window.dispatchEvent(new CustomEvent("opponentJoined", { detail: data }));
    });

    this.socket.on("battle_updated", (battle: Battle) => {
      this.currentBattle = battle;
      window.dispatchEvent(new CustomEvent("battleUpdated", { detail: battle }));
    });

    this.socket.on("battle_ended", (data: { winner: string }) => {
      window.dispatchEvent(new CustomEvent("battleEnded", { detail: data }));
    });
  }

  // Create a new battle room
  async createBattle(topic: string, user: User): Promise<Battle> {
    try {
      const response = await fetch("/api/battle/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, user }),
      });

      if (!response.ok) {
        throw new Error("Failed to create battle");
      }

      const battle = await response.json();
      this.currentBattle = battle;

      // Join socket room
      if (this.socket) {
        this.socket.emit("join_battle", { battleId: battle._id, username: user.name });
      }

      return battle;
    } catch (error) {
      console.error("Error creating battle:", error);
      throw error;
    }
  }

  // Join an existing battle
  async joinBattle(battleId: string, user: User): Promise<Battle> {
    try {
      const response = await fetch("/api/battle/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ battleId, user }),
      });

      if (!response.ok) {
        throw new Error("Failed to join battle");
      }

      const battle = await response.json();
      this.currentBattle = battle;

      // Join socket room
      if (this.socket) {
        this.socket.emit("join_battle", { battleId: battle._id, username: user.name });
      }

      return battle;
    } catch (error) {
      console.error("Error joining battle:", error);
      throw error;
    }
  }

  // Get battle status
  async getBattle(battleId: string): Promise<Battle | null> {
    try {
      const response = await fetch(`/api/battle/${battleId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to get battle");
      }

      const battle = await response.json();
      this.currentBattle = battle;
      return battle;
    } catch (error) {
      console.error("Error getting battle:", error);
      throw error;
    }
  }

  // Submit score
  async submitScore(battleId: string, userId: string, score: number): Promise<Battle> {
    try {
      const response = await fetch("/api/battle/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ battleId, userId, score }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit score");
      }

      const battle = await response.json();
      this.currentBattle = battle;

      // Emit score submission to socket
      if (this.socket) {
        this.socket.emit("submit_score", { battleId, user: userId, score });
      }

      return battle;
    } catch (error) {
      console.error("Error submitting score:", error);
      throw error;
    }
  }

  // Emit question answered event
  emitQuestionAnswered(battleId: string, questionId: string, isCorrect: boolean) {
    if (this.socket && this.currentUser) {
      this.socket.emit("question_answered", {
        battleId,
        user: this.currentUser.id,
        questionId,
        isCorrect,
      });
    }
  }

  // Emit battle end event
  emitBattleEnd(battleId: string, winner: string) {
    if (this.socket) {
      this.socket.emit("end_battle", { battleId, winner });
    }
  }

  // Get current battle
  getCurrentBattle(): Battle | null {
    return this.currentBattle;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentBattle = null;
    this.currentUser = null;
  }
}

// Export singleton instance
export const battleService = new BattleService(); 