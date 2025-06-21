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

  // Track which rooms this socket is in
  socket.on("join_battle", async (data) => {
    const { battleId, username, userId } = data;
    console.log(`🔗 User ${username} (${userId}) attempting to join battle ${battleId}`);
    console.log(`🔗 Socket ID: ${socket.id}, Socket connected: ${socket.connected}`);
    
    // Check if socket is already in this room
    const rooms = Array.from(socket.rooms);
    console.log(`🔗 Socket ${socket.id} current rooms:`, rooms);
    
    socket.join(battleId);
    console.log(`🔗 Socket ${socket.id} joined room ${battleId}`);
    
    // Verify room join
    const updatedRooms = Array.from(socket.rooms);
    console.log(`🔗 Socket ${socket.id} rooms after join:`, updatedRooms);
    
    // Store player info
    if (!activeBattles.has(battleId)) {
      activeBattles.set(battleId, []);
      console.log(`📝 Created new battle entry for ${battleId}`);
    }
    
    const battlePlayers = activeBattles.get(battleId);
    const existingPlayer = battlePlayers.find(p => p.userId === userId);
    
    if (!existingPlayer) {
      battlePlayers.push({ userId, username, socketId: socket.id });
      activeBattles.set(battleId, battlePlayers);
      console.log(`✅ User ${username} joined battle ${battleId}`);
    } else {
      // Update socket ID if player reconnects
      existingPlayer.socketId = socket.id;
      console.log(`🔄 User ${username} reconnected to battle ${battleId}`);
    }
    
    // Always emit updated player list to ALL players in the room (including the joiner)
    console.log(`📊 Emitting battle_players_updated to all players in ${battleId}:`, battlePlayers.map(p => p.username));
    console.log(`📊 Room ${battleId} has ${socket.adapter.rooms.get(battleId)?.size || 0} sockets`);
    console.log(`📊 Sockets in room:`, Array.from(socket.adapter.rooms.get(battleId) || []));
    
    // Use io.to() to ensure all players in the room receive the event
    io.to(battleId).emit("battle_players_updated", {
      players: battlePlayers,
      playerCount: battlePlayers.length
    });
    
    console.log(`📊 Battle ${battleId} now has ${battlePlayers.length} players:`, battlePlayers.map(p => p.username));
    
    // If this is not the first player, notify other players about the new joiner
    if (battlePlayers.length > 1) {
      console.log(`🎉 Emitting opponent_joined for ${username} to other players in ${battleId}`);
      console.log(`🎉 Other players in room:`, battlePlayers.filter(p => p.userId !== userId).map(p => p.username));
      
      // Use socket.to() to emit to all players except the sender
      socket.to(battleId).emit("opponent_joined", { username, userId });
      
      // Also emit to the sender to ensure they know the event was sent
      console.log(`🎉 Emitting opponent_joined confirmation to ${username}`);
      socket.emit("opponent_joined", { username, userId });
    }
    
    // If we have exactly 2 players, trigger battle start for all players
    if (battlePlayers.length === 2) {
      console.log(`🚀 Battle ${battleId} is ready to start with 2 players!`);
      console.log(`🚀 Emitting battle_ready to ALL players in ${battleId}:`, battlePlayers.map(p => p.username));
      
      // Use io.to() to ensure all players receive the battle ready event
      io.to(battleId).emit("battle_ready", {
        players: battlePlayers,
        battleId: battleId
      });
    }
  });

  socket.on("ensure_players_connected", (data) => {
    const { battleId, players } = data;
    console.log(`🔧 Ensuring all players are connected to battle ${battleId}:`, players.map(p => p.username));
    
    // Force emit battle_players_updated to all players in the room
    const battlePlayers = activeBattles.get(battleId) || [];
    console.log(`🔧 Current battle players:`, battlePlayers.map(p => p.username));
    
    if (battlePlayers.length === 2) {
      console.log(`🔧 Emitting battle_players_updated to ensure synchronization`);
      io.to(battleId).emit("battle_players_updated", {
        players: battlePlayers,
        playerCount: battlePlayers.length
      });
      
      console.log(`🔧 Emitting battle_ready to ensure all players are ready`);
      io.to(battleId).emit("battle_ready", {
        players: battlePlayers,
        battleId: battleId
      });
    }
  });

  socket.on("battle_start", (data) => {
    const { battleId } = data;
    console.log(`⚔️ Battle ${battleId} starting for all players`);
    io.to(battleId).emit("battle_started", { battleId });
  });

  socket.on("battle_countdown", (data) => {
    const { battleId, countdown } = data;
    console.log(`⏰ Battle countdown ${countdown} for battle ${battleId}`);
    io.to(battleId).emit("battle_countdown", { battleId, countdown });
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
        console.log(`👋 User ${removedPlayer.username} left battle ${battleId}`);
        
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