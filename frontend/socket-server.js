const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🧠 Client connected: " + socket.id);

  socket.on("join_battle", async (data) => {
    const { battleId, username } = data;
    socket.join(battleId);
    
    // Notify other players in the room
    socket.to(battleId).emit("opponent_joined", { username });
    console.log(`User ${username} joined battle ${battleId}`);
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
  });

  socket.on("disconnect", () => {
    console.log("🧠 Client disconnected: " + socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🔌 Socket.IO server running on port ${PORT}`);
}); 