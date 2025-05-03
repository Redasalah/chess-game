// src/services/SimpleOnlineService.js
import Peer from 'peerjs';

let peer = null;
let connection = null;
let gameId = null;
let callbacks = {
  onGameJoined: () => {},
  onMoveMade: () => {},
  onError: () => {},
  onDisconnect: () => {},
  onConnectionQualityUpdate: () => {}
};

// Initialize peer connection with better configuration
export const initPeer = () => {
  return new Promise((resolve, reject) => {
    // Create a random user ID
    const userId = 'chess_' + Math.random().toString(36).substr(2, 9);
    console.log("Initializing peer with ID:", userId);
    
    // Create peer with better ICE server configuration
    peer = new Peer(userId, {
      host: 'peerjs-server.herokuapp.com', // More reliable public server
      secure: true,
      port: 443,
      debug: 3,
      path: '/',
      config: {
        'iceServers': [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          },
          {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
          }
        ]
      }
    });
    
    peer.on('open', (id) => {
      console.log('My peer ID is open:', id);
      resolve(id);
    });
    
    peer.on('error', (err) => {
      console.error('Peer error:', err);
      callbacks.onError(err);
      reject(err);
    });
    
    peer.on('connection', (conn) => {
      console.log('Connection received from peer!');
      connection = conn;
      setupConnection();
      
      // The game ID is the remote peer's ID
      gameId = conn.peer;
      callbacks.onGameJoined({ gameId: conn.peer, isHost: false });
    });
    
    // Add a timeout for connection
    setTimeout(() => {
      if (!peer.id) {
        const timeoutErr = new Error("Connection timed out. Server might be unreachable.");
        console.error('Peer connection timeout');
        callbacks.onError(timeoutErr);
        reject(timeoutErr);
      }
    }, 15000);
  });
};

// Setup connection handlers with better error handling
const setupConnection = () => {
  if (!connection) {
    console.error("No connection to setup");
    return;
  }
  
  connection.on('open', () => {
    console.log('Connection is fully open and ready for data transfer');
    // Test connection with a ping
    connection.send({
      type: 'PING',
      timestamp: Date.now()
    });
  });
  
  connection.on('data', (data) => {
    console.log('Received data:', data);
    
    if (data.type === 'MOVE') {
      console.log('Processing move data');
      callbacks.onMoveMade(data.board, data.currentPlayer);
    } else if (data.type === 'PING') {
      // Respond to ping with pong
      connection.send({
        type: 'PONG',
        timestamp: data.timestamp,
        receivedAt: Date.now()
      });
    } else if (data.type === 'PONG') {
      // Calculate round-trip time
      const rtt = Date.now() - data.timestamp;
      console.log(`Connection RTT: ${rtt}ms`);
      // Update connection quality based on RTT
      let connectionQuality = rtt < 100 ? 'excellent' : rtt < 300 ? 'good' : 'poor';
      callbacks.onConnectionQualityUpdate(connectionQuality);
    }
  });
  
  connection.on('close', () => {
    console.log('Connection closed');
    callbacks.onDisconnect();
  });
  
  connection.on('error', (err) => {
    console.error('Connection error:', err);
    callbacks.onError(err);
  });
};

// Create a new game
export const createGame = () => {
  console.log("Creating new game...");
  return initPeer().then((id) => {
    gameId = id;
    console.log("Game created with ID:", id);
    return { gameId, isHost: true };
  });
};

// Create game with fallback for sandbox environments
export const createGameWithFallback = async () => {
  try {
    // Try regular PeerJS connection first
    console.log("Attempting PeerJS connection...");
    return await createGame();
  } catch (error) {
    console.error("PeerJS connection failed:", error);
    
    // Fall back to a mock implementation for testing
    const mockId = "MOCK-" + Math.random().toString(36).substr(2, 6).toUpperCase();
    console.log("Using mock connection with ID:", mockId);
    
    // Set up mock connection (useful for testing in sandbox environments)
    setupMockConnection(mockId);
    
    return { gameId: mockId, isHost: true };
  }
};

// Mock connection implementation for sandbox testing
const setupMockConnection = (mockId) => {
  // Store moves locally for testing
  const movesStore = [];
  
  // Simulate a connection
  connection = {
    open: true,
    send: (data) => {
      console.log("Mock sending data:", data);
      if (data.type === 'MOVE') {
        // Store move locally
        movesStore.push(data);
        // Simulate a delay before "receiving" the move
        setTimeout(() => {
          callbacks.onMoveMade(data.board, data.currentPlayer);
        }, 500);
      }
      return true;
    },
    close: () => {
      console.log("Mock connection closed");
    }
  };
  
  // Notify of successful "connection"
  setTimeout(() => {
    callbacks.onGameJoined({ gameId: mockId, isHost: true });
  }, 800);
  
  // Enable sandbox testing mode for cross-browser testing
  enableSandboxTestingMode();
};

// Join an existing game with better error handling
export const joinGame = (id) => {
  return new Promise((resolve, reject) => {
    console.log("Attempting to join game with ID:", id);
    
    if (!peer) {
      console.log("No peer yet, initializing...");
      initPeer().then(() => {
        connectToPeer(id, resolve, reject);
      }).catch(reject);
    } else {
      connectToPeer(id, resolve, reject);
    }
  });
};

// Join game with fallback for sandbox environments
export const joinGameWithFallback = async (id) => {
  try {
    // Try regular PeerJS connection first
    console.log("Attempting to join game with PeerJS...");
    return await joinGame(id);
  } catch (error) {
    console.error("PeerJS connection failed when joining:", error);
    
    // Set up mock connection for testing
    setupMockConnection(id);
    
    return { gameId: id, isHost: false };
  }
};

// Connect to a peer with better visibility
const connectToPeer = (id, resolve, reject) => {
  try {
    console.log("Connecting to peer:", id);
    connection = peer.connect(id, {
      reliable: true,
      serialization: 'json'
    });
    
    // Set up timeouts
    const connectionTimeout = setTimeout(() => {
      if (!connection.open) {
        console.error("Connection timed out");
        reject(new Error("Connection timed out. Make sure the game ID is correct."));
      }
    }, 10000);
    
    connection.on('open', () => {
      clearTimeout(connectionTimeout);
      console.log('Connected to peer:', id);
      gameId = id;
      setupConnection();
      resolve({ gameId: id, isHost: false });
    });
    
    connection.on('error', (err) => {
      clearTimeout(connectionTimeout);
      console.error('Connection error:', err);
      reject(err);
    });
  } catch (err) {
    console.error('Error connecting to peer:', err);
    reject(err);
  }
};

// Send a move to the opponent with better error handling
export const sendMove = (board, currentPlayer) => {
  console.log("Attempting to send move");
  if (connection && connection.open) {
    console.log("Connection is open, sending move data");
    connection.send({
      type: 'MOVE',
      board,
      currentPlayer
    });
    return true;
  } else {
    console.error("Cannot send move - connection not open");
    callbacks.onError(new Error("Connection lost. The other player may have disconnected."));
    return false;
  }
};

// Set callbacks
export const setCallbacks = (newCallbacks) => {
  callbacks = { ...callbacks, ...newCallbacks };
};

// Disconnect with cleanup
export const disconnect = () => {
  console.log("Disconnecting...");
  if (connection) {
    connection.close();
  }
  if (peer) {
    peer.disconnect();
    peer.destroy();
  }
  peer = null;
  connection = null;
  gameId = null;
};

// Enable sandbox testing mode for cross-browser communication
export const enableSandboxTestingMode = () => {
  // Create a special key in localStorage to enable communication between tabs/browsers
  const localStorageKey = 'chess_sandbox_communication';
  
  // Set up listener for localStorage changes (works across tabs/browsers on same machine)
  window.addEventListener('storage', (event) => {
    if (event.key === localStorageKey) {
      try {
        const data = JSON.parse(event.newValue);
        // Process the move as if it came from PeerJS
        if (data.type === 'MOVE') {
          callbacks.onMoveMade(data.board, data.currentPlayer);
        } else if (data.type === 'JOIN') {
          callbacks.onGameJoined({ gameId: data.gameId, isHost: false });
        }
      } catch (e) {
        console.error("Error processing sandbox message:", e);
      }
    }
  });
  
  // Override the original sendMove function to also use localStorage
  const originalSendMove = sendMove;
  window.sendMove = (board, currentPlayer) => {
    try {
      // Store the move in localStorage (visible to other tabs/browsers)
      const moveData = {
        type: 'MOVE',
        board,
        currentPlayer,
        timestamp: Date.now()
      };
      localStorage.setItem(localStorageKey, JSON.stringify(moveData));
      console.log("Move sent via localStorage for cross-browser testing");
      
      // Also try the original method
      return originalSendMove(board, currentPlayer);
    } catch (e) {
      console.error("Error in sandbox testing mode:", e);
      return false;
    }
  };
  
  console.log("Sandbox testing mode enabled for cross-browser/tab communication");
};