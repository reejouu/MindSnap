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

export interface BattlePlayer {
  userId: string;
  username: string;
  socketId: string;
}

class BattleService {
  private socket: Socket | null = null;
  private currentBattle: Battle | null = null;
  private currentUser: User | null = null;

  // Initialize socket connection
  connect(user: User) {
    this.currentUser = user;
    console.log("🔌 Connecting to battle server for user:", user.name);
    
    // Check if socket is already connected
    this.socket = io("https://a288-203-171-240-122.ngrok-free.app", {
      transports: ["websocket", "polling"],
      autoConnect: true,
      timeout: 10000,
    });

    this.setupSocketListeners();
    
    // Wait for connection before proceeding
    return new Promise<void>((resolve) => {
      if (this.socket?.connected) {
        console.log("✅ Socket already connected");
        resolve();
      } else {
        this.socket?.on("connect", () => {
          console.log("✅ Connected to battle server");
          resolve();
        });
        
        this.socket?.on("connect_error", (error) => {
          console.error("❌ Socket connection error:", error);
          resolve(); // Resolve anyway to not block the flow
        });
      }
    });
  }

  // Setup socket event listeners
  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Connected to battle server");
    });

    this.socket.on("disconnect", () => {
      console.log("❌ Disconnected from battle server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    this.socket.on("opponent_joined", (data: { username: string; userId: string }) => {
      console.log("🎯 Opponent joined:", data.username);
      // Emit custom event for React components
      window.dispatchEvent(new CustomEvent("opponentJoined", { detail: data }));
    });

    this.socket.on("battle_players_updated", (data: { players: BattlePlayer[]; playerCount: number }) => {
      console.log("📊 Battle players updated:", data.players);
      window.dispatchEvent(new CustomEvent("battlePlayersUpdated", { detail: data }));
    });

    this.socket.on("battle_ready", (data: { players: BattlePlayer[]; battleId: string }) => {
      console.log("🚀 Battle ready with 2 players:", data.players);
      window.dispatchEvent(new CustomEvent("battleReady", { detail: data }));
    });

    this.socket.on("battle_started", (data: { battleId: string, quiz: any }) => {
      console.log("⚔️ Battle started:", data.battleId);
      window.dispatchEvent(new CustomEvent("battleStarted", { detail: data }));
    });

    this.socket.on("battle_countdown", (data: { battleId: string; countdown: number }) => {
      console.log("⏰ Battle countdown:", data.countdown);
      window.dispatchEvent(new CustomEvent("battleCountdown", { detail: data }));
    });

    this.socket.on("battle_updated", (battle: Battle) => {
      this.currentBattle = battle;
      window.dispatchEvent(new CustomEvent("battleUpdated", { detail: battle }));
    });

    this.socket.on("battle_ended", (data: { winner: string }) => {
      window.dispatchEvent(new CustomEvent("battleEnded", { detail: data }));
    });

    this.socket.on("quiz_completed", (data: { userId: string; username: string; score: number; totalQuestions: number; timeSpent: number; accuracy: number }) => {
      console.log("🎯 Quiz completed event received:", data);
      window.dispatchEvent(new CustomEvent("playerCompleted", { detail: data }));
    });

    // NEW: Handle battle results when both players complete
    this.socket.on("battle_results", (data: { 
      players: Array<{userId: string; username: string; score: number; totalQuestions: number}>; 
      winner: any; 
      isDraw: boolean;
      player1Accuracy: number;
      player2Accuracy: number;
    }) => {
      console.log("🏆 Battle results received:", data);
      window.dispatchEvent(new CustomEvent("battleResults", { detail: data }));
    });

    // NEW: Handle opponent completion notification
    this.socket.on("opponent_completed", (data: { 
      username: string; 
      score: number; 
      totalQuestions: number 
    }) => {
      console.log("⏳ Opponent completed quiz:", data);
      window.dispatchEvent(new CustomEvent("opponentCompleted", { detail: data }));
    });
  }

  // Create a new battle room
  async createBattle(topic: string, user: User): Promise<Battle> {
    try {
      console.log("🏗️ Creating battle for topic:", topic, "user:", user.name);
      
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
      console.log("✅ Battle created:", battle._id);

      // Ensure socket is connected before joining room
      if (!this.socket?.connected) {
        console.log("⚠️ Socket not connected, attempting to reconnect...");
        await this.ensureConnection();
      }

      // Join socket room with retry mechanism
      if (this.socket?.connected) {
        console.log("🔗 Emitting join_battle for creator:", user.name, "battle:", battle._id);
        this.socket.emit("join_battle", { 
          battleId: battle._id, 
          username: user.name,
          userId: user.id 
        });
        
        // Verify room join by checking socket rooms after a short delay
        setTimeout(() => {
          console.log("🔍 Verifying room join for creator...");
          this.socket?.emit("join_battle", { 
            battleId: battle._id, 
            username: user.name,
            userId: user.id 
          });
        }, 1000);
      } else {
        console.log("❌ Socket not connected for battle creation");
      }

      return battle;
    } catch (error) {
      console.error("❌ Error creating battle:", error);
      throw error;
    }
  }

  // Join an existing battle
  async joinBattle(battleId: string, user: User): Promise<Battle> {
    try {
      console.log("🎯 Joining battle:", battleId, "user:", user.name);
      
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
      console.log("✅ Battle joined:", battle._id);

      // Ensure socket is connected before joining room
      if (!this.socket?.connected) {
        console.log("⚠️ Socket not connected, attempting to reconnect...");
        await this.ensureConnection();
      }

      // Join socket room with retry mechanism
      if (this.socket?.connected) {
        console.log("🔗 Emitting join_battle for joiner:", user.name, "battle:", battle._id);
        this.socket.emit("join_battle", { 
          battleId: battle._id, 
          username: user.name,
          userId: user.id 
        });
        
        // Verify room join by checking socket rooms after a short delay
        setTimeout(() => {
          console.log("🔍 Verifying room join for joiner...");
          this.socket?.emit("join_battle", { 
            battleId: battle._id, 
            username: user.name,
            userId: user.id 
          });
        }, 1000);
      } else {
        console.log("❌ Socket not connected for battle joining");
      }

      return battle;
    } catch (error) {
      console.error("❌ Error joining battle:", error);
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
    if (this.socket?.connected) {
      console.log("🎯 Emitting question answered:", { battleId, questionId, isCorrect });
      this.socket.emit("question_answered", { battleId, questionId, isCorrect });
    }
  }

  // Emit battle end event
  emitBattleEnd(battleId: string, winner: string) {
    if (this.socket?.connected) {
      console.log("🏆 Emitting battle end:", { battleId, winner });
      this.socket.emit("battle_end", { battleId, winner });
    }
  }

  // Emit battle start event
  emitBattleStart(battleId: string, quiz: any) {
    console.log("🚀 emitBattleStart called with battleId:", battleId);
    console.log("🚀 emitBattleStart - Socket connected:", this.socket?.connected);
    console.log("🚀 emitBattleStart - Quiz data:", quiz ? "YES" : "NO");
    
    if (this.socket) {
      console.log("🚀 Emitting start_battle event to socket server");
      this.socket.emit("start_battle", { battleId, quiz });
      console.log("🚀 start_battle event emitted successfully");
    } else {
      console.error("❌ Socket not connected, cannot emit start_battle");
    }
  }

  // Emit battle countdown event
  emitBattleCountdown(battleId: string, countdown: number) {
    if (this.socket) {
      console.log("⏰ Emitting battle_countdown for battle:", battleId, "countdown:", countdown);
      this.socket.emit("battle_countdown", { battleId, countdown });
    } else {
      console.error("❌ Socket not connected, cannot emit battle_countdown");
    }
  }

  // NEW: Emit player quiz completion
  emitPlayerCompletedQuiz(battleId: string, userId: string, username: string, score: number, totalQuestions: number) {
    if (this.socket?.connected) {
      console.log("🎯 Emitting player_completed_quiz:", { battleId, userId, username, score, totalQuestions });
      this.socket.emit("player_completed_quiz", { 
        battleId, 
        userId, 
        username, 
        score, 
        totalQuestions 
      });
    }
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Ensure socket is connected, reconnect if needed
  async ensureConnection(): Promise<boolean> {
    if (this.socket?.connected) {
      return true;
    }
    
    if (this.currentUser) {
      console.log("🔄 Socket not connected, attempting to reconnect...");
      try {
        await this.connect(this.currentUser);
        return this.socket?.connected || false;
      } catch (error) {
        console.error("❌ Failed to reconnect socket:", error);
        return false;
      }
    }
    
    return false;
  }

  // Get current battle
  getCurrentBattle(): Battle | null {
    return this.currentBattle;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Set current battle (for external updates)
  setCurrentBattle(battle: Battle) {
    this.currentBattle = battle;
  }

  // Manually refresh battle data and update current battle
  async refreshBattleData(battleId: string): Promise<Battle | null> {
    try {
      console.log("🔄 Manually refreshing battle data for:", battleId);
      const updatedBattle = await this.getBattle(battleId);
      if (updatedBattle) {
        this.currentBattle = updatedBattle;
        console.log("🔄 Updated current battle:", updatedBattle);
        
        // Emit battle updated event
        window.dispatchEvent(new CustomEvent("battleUpdated", { detail: updatedBattle }));
        
        return updatedBattle;
      }
      return null;
    } catch (error) {
      console.error("❌ Error refreshing battle data:", error);
      return null;
    }
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