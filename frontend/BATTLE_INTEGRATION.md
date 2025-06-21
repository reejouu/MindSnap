# Battle Royale Integration Guide

This document explains how the battle system is integrated with MongoDB and Socket.IO for real-time functionality.

## Architecture Overview

The battle system consists of several key components:

### 1. Database Layer (`/lib/battle.ts`)
- MongoDB integration using Mongoose
- Battle model with players, scores, and status tracking
- CRUD operations for battles

### 2. Real-time Communication (`/sockets/`)
- Socket.IO server for real-time updates
- Client-side socket service for connection management
- Event handling for player actions

### 3. API Routes (`/app/api/battle/`)
- RESTful endpoints for battle operations
- Next.js App Router format
- Proper error handling and validation

### 4. UI Components (`/components/battle/`)
- React components for different battle states
- Real-time updates integration
- Smooth animations and transitions

## Key Features

### Real-time Battle Creation
- Players can create battle rooms with topics
- Room codes are generated and shared
- MongoDB stores battle data with proper indexing

### Live Player Matching
- Socket.IO handles real-time player connections
- Automatic opponent detection and notification
- Battle state updates across all connected players

### Score Tracking
- Real-time score submission and validation
- Automatic winner determination
- Battle completion handling

## Setup Instructions

### 1. Environment Configuration
Create a `.env.local` file in the frontend directory:

```env
# Socket.IO Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mindsnap
```

### 2. Database Setup
Ensure MongoDB is running and the connection is properly configured in `/lib/mongodb.ts`.

### 3. Socket.IO Server
The socket server is automatically initialized when the first client connects to `/api/socket_io`.

### 4. Battle Service
The `battleService` singleton manages all battle-related operations and socket connections.

## Usage Flow

1. **Topic Selection**: Player chooses a quiz topic
2. **Mode Selection**: Player chooses to create or join a room
3. **Room Creation/Joining**: 
   - Creator: Generates room code, waits for opponent
   - Joiner: Enters room code, joins existing battle
4. **Waiting Room**: Real-time updates show opponent joining
5. **Battle Start**: Automatic transition to quiz interface
6. **Score Submission**: Real-time score tracking and winner determination

## API Endpoints

- `POST /api/battle/create` - Create new battle
- `POST /api/battle/join` - Join existing battle
- `GET /api/battle/[id]` - Get battle status
- `POST /api/battle/submit` - Submit battle score
- `GET /api/socket_io` - Socket.IO endpoint

## Socket Events

### Client to Server
- `join_battle` - Join a battle room
- `question_answered` - Submit question answer
- `submit_score` - Submit final score
- `end_battle` - End battle manually

### Server to Client
- `opponent_joined` - Notify when opponent joins
- `battle_updated` - Send updated battle data
- `opponent_answered` - Notify opponent's answer
- `opponent_score` - Notify opponent's score
- `battle_ended` - Notify battle completion

## Error Handling

- Network errors are caught and displayed to users
- Invalid room codes show appropriate error messages
- Socket disconnections are handled gracefully
- Database errors are logged and handled appropriately

## Performance Considerations

- Socket connections are properly cleaned up on component unmount
- Battle data is cached locally to reduce API calls
- Real-time updates are debounced to prevent spam
- MongoDB indexes are used for efficient queries

## Security Notes

- Room codes are validated server-side
- User authentication should be implemented for production
- Input validation prevents malicious data
- Rate limiting should be added for production use 