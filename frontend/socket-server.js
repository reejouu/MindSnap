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
      setTimeout(() => {
        io.to(battleId).emit("battle_ready", {
          players: battlePlayers,
          battleId: battleId
        });
      }, 500); // Small delay to ensure clients are ready
    }
  });

  socket.on("start_battle", (data) => {
    const { battleId, quiz } = data;
    console.log(`⚔️ Battle ${battleId} starting for all players with quiz:`, quiz ? "YES" : "NO");
    console.log(`⚔️ Quiz data details:`, quiz);
    console.log(`⚔️ Broadcasting to room ${battleId}`);
    
    // Check how many sockets are in the room
    const roomSockets = io.sockets.adapter.rooms.get(battleId);
    console.log(`⚔️ Sockets in room ${battleId}:`, roomSockets ? roomSockets.size : 0);
    
    io.to(battleId).emit("battle_started", { battleId, quiz });
    console.log(`⚔️ Battle started event emitted to room ${battleId}`);
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

  // NEW: Handle player quiz completion
  socket.on("player_completed_quiz", (data) => {
    const { battleId, userId, username, score, totalQuestions } = data;
    console.log(`🎯 Player ${username} completed quiz with score ${score}/${totalQuestions}`);
    
    // Store the score temporarily
    if (!activeBattles.has(battleId)) {
      activeBattles.set(battleId, []);
      console.log(`📝 Created new battle entry for ${battleId}`);
    }
    
    const battle = activeBattles.get(battleId);
    let player = battle.find(p => p.userId === userId);
    
    // If player not found, add them to the battle
    if (!player) {
      console.log(`📝 Player ${username} not found in battle, adding them...`);
      player = { userId, username, socketId: socket.id };
      battle.push(player);
    }
    
    // Update player score
    player.score = score;
    player.totalQuestions = totalQuestions;
    console.log(`📊 Updated player ${username} score: ${score}/${totalQuestions}`);
    
    // Check if both players completed
    const completedPlayers = battle.filter(p => p.score !== undefined);
    console.log(`📊 Completed players: ${completedPlayers.length}/2`);
    console.log(`📊 All players in battle:`, battle.map(p => ({ username: p.username, score: p.score })));
    
    if (completedPlayers.length === 2) {
      // Both players completed - determine winner
      const [player1, player2] = completedPlayers;
      const player1Accuracy = (player1.score / player1.totalQuestions) * 100;
      const player2Accuracy = (player2.score / player2.totalQuestions) * 100;
      
      let winner = null;
      let isDraw = false;
      
      if (player1Accuracy > player2Accuracy) {
        winner = player1;
      } else if (player2Accuracy > player1Accuracy) {
        winner = player2;
      } else {
        // If accuracy is the same, check total score
        if (player1.score > player2.score) {
          winner = player1;
        } else if (player2.score > player1.score) {
          winner = player2;
        } else {
          isDraw = true;
        }
      }
      
      console.log(`🏆 Battle ${battleId} completed!`);
      console.log(`🏆 Player 1 (${player1.username}): ${player1.score}/${player1.totalQuestions} (${player1Accuracy.toFixed(1)}%)`);
      console.log(`🏆 Player 2 (${player2.username}): ${player2.score}/${player2.totalQuestions} (${player2Accuracy.toFixed(1)}%)`);
      console.log(`🏆 Winner: ${isDraw ? 'DRAW' : winner.username}`);
      
      // Ensure we have both players' complete data
      const finalPlayers = [
        {
          userId: player1.userId,
          username: player1.username,
          score: player1.score,
          totalQuestions: player1.totalQuestions
        },
        {
          userId: player2.userId,
          username: player2.username,
          score: player2.score,
          totalQuestions: player2.totalQuestions
        }
      ];
      
      // Double-check: ensure all players with scores are included
      const allPlayersWithScores = battle.filter(p => p.score !== undefined).map(p => ({
        userId: p.userId,
        username: p.username,
        score: p.score,
        totalQuestions: p.totalQuestions
      }));
      
      // Use the more complete data
      const finalPlayersData = allPlayersWithScores.length >= 2 ? allPlayersWithScores : finalPlayers;
      
      console.log(`🏆 Final players data:`, finalPlayersData);
      
      // Create the results object with detailed logging
      const resultsData = {
        players: finalPlayersData,
        winner: winner,
        isDraw: isDraw,
        player1Accuracy: player1Accuracy,
        player2Accuracy: player2Accuracy
      };
      
      console.log(`🏆 Sending battle results to room ${battleId}:`, JSON.stringify(resultsData, null, 2));
      
      // Emit results to both players
      io.to(battleId).emit("battle_results", resultsData);
      
      // Clean up battle data after a delay
      setTimeout(() => {
        activeBattles.delete(battleId);
        console.log(`🧹 Cleaned up battle ${battleId}`);
      }, 30000); // 30 seconds delay
    } else {
      // First player completed - notify opponent
      console.log(`⏳ First player completed, waiting for opponent...`);
      socket.to(battleId).emit("opponent_completed", {
        username: username,
        score: score,
        totalQuestions: totalQuestions
      });
    }
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