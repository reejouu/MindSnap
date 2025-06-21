# Battle Royale Troubleshooting Guide

## Issue: Room Creator Cannot Start Battle

### Symptoms
- Room creator sees "START BATTLE!" button but clicking it doesn't work
- Joining player is stuck waiting for battle to start
- No countdown appears
- Socket connection issues

### Solutions

#### 1. Start the Socket Server
The battle system requires a separate Socket.IO server to run. Make sure it's started:

```bash
# In the frontend directory
node socket-server.js
```

You should see: `🔌 Socket.IO server running on port 3001`

#### 2. Test Socket Connection
Run the test script to verify the socket server is working:

```bash
# Install socket.io-client if not already installed
npm install socket.io-client

# Run the test
node test-socket.js
```

You should see: `✅ Connected to socket server`

#### 3. Check Browser Console
Open browser developer tools and check the console for:
- Socket connection errors
- Battle creation/joining errors
- Room creator detection issues

#### 4. Manual Debugging
The VSIntro component includes debug buttons:
- **Manual Trigger Battle Ready**: Forces the battle ready event
- **Force Refresh Battle Data**: Refreshes battle data from server
- **Manual Reconnect Socket**: Reconnects to socket server
- **Force Start Battle**: Manually starts the battle (room creator only)

#### 5. Common Issues

**Socket Not Connected**
- Ensure socket-server.js is running on port 3001
- Check if port 3001 is available
- Verify CORS settings in socket-server.js

**Room Creator Detection Fails**
- Check if battle data is properly loaded
- Verify user IDs match between frontend and database
- Use "Force Refresh Battle Data" button

**Battle Start Events Not Received**
- Check socket event listeners in browser console
- Verify both players are in the same socket room
- Use "Manual Trigger Battle Ready" button

#### 6. Database Issues
If battles aren't being created or joined properly:
- Check MongoDB connection
- Verify Battle model is properly defined
- Check API routes (/api/battle/create, /api/battle/join)

#### 7. Network Issues
- Ensure both players are on the same network or can reach localhost:3001
- Check firewall settings
- Verify WebSocket connections are allowed

## Debug Information

The VSIntro component displays debug information:
- Room Creator status
- Waiting for Creator status
- Current User
- Battle Players count
- Socket Connected status
- Battle Status

## Manual Testing Steps

1. Start socket server: `node socket-server.js`
2. Start frontend: `npm run dev`
3. Create a battle room
4. Join with another browser/tab
5. Check debug info in VSIntro component
6. Try manual buttons if automatic start fails

## Logs to Monitor

**Socket Server Logs:**
- Client connections/disconnections
- Battle join events
- Battle start events
- Player updates

**Frontend Console Logs:**
- Socket connection status
- Battle creation/joining
- Room creator detection
- Event emissions and receptions 