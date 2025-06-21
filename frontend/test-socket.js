const io = require('socket.io-client');

// Test socket connection
const socket = io('http://localhost:3001');

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
  
  setTimeout(() => {
    console.log('✅ Socket test completed');
    socket.disconnect();
    process.exit(0);
  }, 2000);
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

setTimeout(() => {
  console.error('❌ Socket test timeout');
  process.exit(1);
}, 5000); 