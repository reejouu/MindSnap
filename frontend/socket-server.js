const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store active battles and their players
const activeBattles = new Map();

io.on("connection", (socket) => {
  console.log("🧠 Client connected: " + socket.id);

  socket.on("join_battle", async (data) => {
    const { battleId, username, userId } = data;
    socket.join(battleId);
    
    // Store player info
    if (!activeBattles.has(battleId)) {
      activeBattles.set(battleId, []);
    }
    
    const battlePlayers = activeBattles.get(battleId);
    const existingPlayer = battlePlayers.find(p => p.userId === userId);
    
    if (!existingPlayer) {
      battlePlayers.push({ userId, username, socketId: socket.id });
      activeBattles.set(battleId, battlePlayers);
      console.log(`User ${username} joined battle ${battleId}`);
    } else {
      // Update socket ID if player reconnects
      existingPlayer.socketId = socket.id;
      console.log(`User ${username} reconnected to battle ${battleId}`);
    }
    
    // Notify other players in the room about the new joiner
    socket.to(battleId).emit("opponent_joined", { username, userId });
    
    // Emit updated player list to ALL players in the room (including the joiner)
    io.to(battleId).emit("battle_players_updated", {
      players: battlePlayers,
      playerCount: battlePlayers.length
    });
    
    console.log(`Battle ${battleId} now has ${battlePlayers.length} players:`, battlePlayers.map(p => p.username));
    
    // If we have exactly 2 players, trigger battle start for all players
    if (battlePlayers.length === 2) {
      console.log(`Battle ${battleId} is ready to start with 2 players!`);
      io.to(battleId).emit("battle_ready", {
        players: battlePlayers,
        battleId: battleId
      });
    }
  });

  socket.on("battle_start", (data) => {
    const { battleId } = data;
    console.log(`Battle ${battleId} starting for all players`);
    io.to(battleId).emit("battle_started", { battleId });
  });

  socket.on("question_answered", (data) => {
    const { battleId, user, questionId, isCorrect } = data;
    socket.to(battleId).emit("opponent_answered", { user, questionId, isCorrect });
    console.log(`User ${user} answered question ${questionId} correctly: ${isCorrect}`);
  });

  socket.on("submit_score", async (data) => {
    const { battleId, user, score } = data;
    socket.to(battleId).emit("opponent_score", { user, score });
    console.log(`User ${user} submitted score ${score} for battle ${battleId}`);
  });

  socket.on("end_battle", async (data) => {
    const { battleId, winner } = data;
    io.to(battleId).emit("battle_ended", { winner });
    console.log(`Battle ${battleId} ended with winner: ${winner}`);
    
    // Clean up battle data
    activeBattles.delete(battleId);
  });

  socket.on("disconnect", () => {
    console.log("🧠 Client disconnected: " + socket.id);
    
    // Remove player from active battles
    for (const [battleId, players] of activeBattles.entries()) {
      const playerIndex = players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        const removedPlayer = players.splice(playerIndex, 1)[0];
        console.log(`User ${removedPlayer.username} left battle ${battleId}`);
        
        // Update remaining players
        if (players.length > 0) {
          io.to(battleId).emit("battle_players_updated", {
            players: players,
            playerCount: players.length
          });
        } else {
          // No players left, clean up
          activeBattles.delete(battleId);
        }
        break;
      }
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🔌 Socket.IO server running on port ${PORT}`);
}); 