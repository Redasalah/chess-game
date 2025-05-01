// Modified SimpleOnlineService.js
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this: npm install uuid

// Store game state locally
let gameState = null;
let peerId = null;
let callbacks = {
  onGameJoined: () => {},
  onMoveMade: () => {},
  onError: () => {},
  onDisconnect: () => {}
};

// Generate a random, memorable game ID
const generateGameId = () => {
  // This will create a shorter, easier to share ID
  return uuidv4().substring(0, 8);
};

// Create a new game
export const createGame = () => {
  try {
    // Generate a unique game ID
    const newGameId = generateGameId();
    console.log("Created game with ID:", newGameId);
    
    // Initialize local game state
    gameState = {
      id: newGameId,
      isHost: true,
      board: null,
      currentPlayer: 'white'
    };
    
    // Notify UI
    setTimeout(() => {
      callbacks.onGameJoined({ gameId: newGameId, isHost: true });
    }, 500);
    
    return Promise.resolve({ gameId: newGameId, isHost: true });
  } catch (error) {
    console.error("Error creating game:", error);
    return Promise.reject(error);
  }
};

// Join an existing game 
export const joinGame = (id) => {
  try {
    console.log("Joining game with ID:", id);
    
    // In a real implementation, this would connect to the host
    // For now, just create a local state
    gameState = {
      id: id,
      isHost: false,
      board: null,
      currentPlayer: 'white'
    };
    
    // Notify UI
    setTimeout(() => {
      callbacks.onGameJoined({ gameId: id, isHost: false });
    }, 500);
    
    return Promise.resolve({ gameId: id, isHost: false });
  } catch (error) {
    console.error("Error joining game:", error);
    return Promise.reject(error);
  }
};

// Send a move to opponent
export const sendMove = (board, currentPlayer) => {
  if (!gameState) return false;
  
  // In a real implementation, this would send data to the opponent
  console.log("Sending move:", { board, currentPlayer });
  
  // Store locally
  gameState.board = board;
  gameState.currentPlayer = currentPlayer;
  
  return true;
};

// Set callbacks
export const setCallbacks = (newCallbacks) => {
  callbacks = { ...callbacks, ...newCallbacks };
};

// Disconnect
export const disconnect = () => {
  gameState = null;
  console.log("Disconnected from game");
};