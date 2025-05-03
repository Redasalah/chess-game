// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// Serve the React app for any request that doesn't match an API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Store active games
const games = {};

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  let currentGameId = null;
  
  // Handle move made by a player
  socket.on('move', (move) => {
    console.log('Move received:', move);
    if (currentGameId) {
      // Broadcast move to all clients in the game room except sender
      socket.to(currentGameId).emit('newMove', move);
    }
  });
  
  // Handle game creation/joining
  socket.on('joinGame', (data) => {
    const gameId = data.code;
    currentGameId = gameId;
    
    console.log(`Player ${socket.id} joining game: ${gameId}`);
    
    // Join the Socket.IO room for this game
    socket.join(gameId);
    
    // If game doesn't exist yet, create it
    if (!games[gameId]) {
      games[gameId] = {
        players: [socket.id],
        status: 'waiting'
      };
      console.log(`New game created: ${gameId}`);
      return;
    }
    
    // If game exists but waiting for players
    if (games[gameId].status === 'waiting') {
      games[gameId].players.push(socket.id);
      games[gameId].status = 'active';
      
      // Notify all clients in the room that the game has started
      io.to(gameId).emit('startGame');
      console.log(`Game ${gameId} started with ${games[gameId].players.length} players`);
    }
  });
  
  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    if (currentGameId && games[currentGameId]) {
      // Notify other players in the room
      socket.to(currentGameId).emit('gameOverDisconnect');
      
      // Remove the game
      delete games[currentGameId];
      console.log(`Game ${currentGameId} ended due to player disconnect`);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});