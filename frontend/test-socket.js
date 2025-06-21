const io = require('socket.io-client');

// Test socket connection
const socket = io('https://a288-203-171-240-122.ngrok-free.app');

socket.on('connect', () => {
  console.log('✅ Connected to socket server');
  
  // Test battle events
  socket.emit('join_battle', {
    battleId: 'test-battle-123',
    username: 'TestUser',
    userId: 'user-123'
  });
  
  socket.emit('battle_countdown', {
    battleId: 'test-battle-123',
    countdown: 3
  });
  
  socket.emit('battle_start', {
    battleId: 'test-battle-123'
  });
  
  // Test the new player_completed_quiz event
  setTimeout(() => {
    console.log('🎯 Testing player_completed_quiz event...');
    socket.emit('player_completed_quiz', {
      battleId: 'test-battle-123',
      userId: 'user-123',
      username: 'TestUser',
      score: 8,
      totalQuestions: 10
    });
  }, 1000);
  
  // Test second player completing
  setTimeout(() => {
    console.log('🎯 Testing second player completion...');
    socket.emit('player_completed_quiz', {
      battleId: 'test-battle-123',
      userId: 'user-456',
      username: 'OpponentUser',
      score: 7,
      totalQuestions: 10
    });
  }, 2000);
  
  setTimeout(() => {
    console.log('✅ Socket test completed');
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Socket connection error:', error);
  process.exit(1);
});

socket.on('battle_countdown', (data) => {
  console.log('⏰ Received countdown:', data);
});

socket.on('battle_started', (data) => {
  console.log('⚔️ Received battle started:', data);
});

// NEW: Listen for opponent completion
socket.on('opponent_completed', (data) => {
  console.log('⏳ Opponent completed quiz:', data);
});

// NEW: Listen for battle results
socket.on('battle_results', (data) => {
  console.log('🏆 Battle results received:', data);
  console.log('🏆 Winner:', data.winner ? data.winner.username : 'DRAW');
  console.log('🏆 Is Draw:', data.isDraw);
  console.log('🏆 Player 1 Accuracy:', data.player1Accuracy?.toFixed(1) + '%');
  console.log('🏆 Player 2 Accuracy:', data.player2Accuracy?.toFixed(1) + '%');
});

setTimeout(() => {
  console.error('❌ Socket test timeout');
  process.exit(1);
}, 10000); 