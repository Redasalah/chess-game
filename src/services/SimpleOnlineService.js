// src/services/SimpleOnlineService.js
import Peer from 'peerjs';

let peer = null;
let connection = null;
let gameId = null;
let callbacks = {
  onGameJoined: () => {},
  onMoveMade: () => {},
  onError: () => {},
  onDisconnect: () => {}
};

// Initialize peer connection with better configuration
export const initPeer = () => {
  return new Promise((resolve, reject) => {
    // Create a random user ID
    const userId = 'chess_' + Math.random().toString(36).substr(2, 9);
    console.log("Initializing peer with ID:", userId);
    
    // Create peer with better ICE server configuration
    peer = new Peer(userId, {
      debug: 3, // Enable detailed debugging
      config: {
        'iceServers': [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          // Add a free TURN server for better NAT traversal
          {
            urls: 'turn:openrelay.metered.ca:80',
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
    console.log('Connection is now open and ready');
  });
  
  connection.on('data', (data) => {
    console.log('Received data:', data);
    
    if (data.type === 'MOVE') {
      console.log('Processing move data');
      callbacks.onMoveMade(data.board, data.currentPlayer);
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