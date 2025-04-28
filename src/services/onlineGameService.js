// src/services/onlineGameService.js
import { database } from './firebase';
import { 
  ref, 
  set, 
  onValue, 
  update, 
  push, 
  child, 
  get,
  onDisconnect
} from 'firebase/database';

// Generate a unique game ID
export const createGame = async (creatorColor = 'white') => {
  try {
    // Create a reference to a new game
    const gamesListRef = ref(database, 'games');
    const newGameRef = push(gamesListRef);
    const gameId = newGameRef.key;
    
    // Initial game state
    const gameData = {
      board: initialBoardState(),
      currentPlayer: 'white',
      status: 'waiting', // waiting, active, complete
      moveHistory: [],
      players: {
        [creatorColor]: {
          connected: true,
          lastSeen: Date.now()
        }
      },
      createdAt: Date.now(),
      lastMove: null
    };
    
    // Save the game to Firebase
    await set(newGameRef, gameData);
    
    return { gameId, color: creatorColor };
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

// Join an existing game
export const joinGame = async (gameId) => {
  try {
    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await get(gameRef);
    
    if (!snapshot.exists()) {
      throw new Error("Game not found");
    }
    
    const gameData = snapshot.val();
    
    // Determine player color
    let playerColor;
    if (gameData.players.white && !gameData.players.black) {
      playerColor = 'black';
    } else if (gameData.players.black && !gameData.players.white) {
      playerColor = 'white';
    } else {
      throw new Error("Game is full");
    }
    
    // Update the game with the new player
    await update(child(gameRef, 'players'), {
      [playerColor]: {
        connected: true,
        lastSeen: Date.now()
      }
    });
    
    // Update game status if both players are now present
    if (gameData.status === 'waiting') {
      await update(gameRef, { status: 'active' });
    }
    
    return { gameId, color: playerColor };
  } catch (error) {
    console.error("Error joining game:", error);
    throw error;
  }
};

// Listen for game changes
export const subscribeToGame = (gameId, onGameUpdate) => {
  const gameRef = ref(database, `games/${gameId}`);
  
  // Set up listener
  const unsubscribe = onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      const gameData = snapshot.val();
      onGameUpdate(gameData);
    } else {
      console.error("Game not found");
    }
  });
  
  return unsubscribe;
};

// Make a move in the game
export const makeMove = async (gameId, move, newBoard, gameStatus) => {
  try {
    const gameRef = ref(database, `games/${gameId}`);
    
    // Update game with the new move
    await update(gameRef, {
      board: newBoard,
      currentPlayer: move.piece.color === 'white' ? 'black' : 'white',
      lastMove: {
        from: move.from,
        to: move.to,
        piece: move.piece,
        captured: move.captured || null,
        timestamp: Date.now()
      },
      moveHistory: push(child(gameRef, 'moveHistory'), {
        from: move.from,
        to: move.to,
        piece: move.piece.type,
        pieceColor: move.piece.color,
        captured: move.captured ? move.captured.type : null,
        timestamp: Date.now()
      }),
      status: gameStatus || 'active'
    });
    
    return true;
  } catch (error) {
    console.error("Error making move:", error);
    throw error;
  }
};

// Update player connection status
export const updatePlayerStatus = (gameId, color, status) => {
  try {
    const playerRef = ref(database, `games/${gameId}/players/${color}`);
    
    update(playerRef, {
      connected: status,
      lastSeen: Date.now()
    });
    
    // Set up disconnect handler
    if (status) {
      onDisconnect(playerRef).update({
        connected: false,
        lastSeen: Date.now()
      });
    }
  } catch (error) {
    console.error("Error updating player status:", error);
  }
};

// Helper function for initial board state
const initialBoardState = () => {
  // This should match your initialBoardSetup from boardUtils.js
  // Return a serializable version of your initial board
  // ... implementation ...
};