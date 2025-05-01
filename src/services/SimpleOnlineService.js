// src/services/simpleOnlineService.js
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

// Initialize peer connection
export const initPeer = () => {
  return new Promise((resolve, reject) => {
    // Create a random user ID
    const userId = 'chess_' + Math.random().toString(36).substr(2, 9);
    
    peer = new Peer(userId);
    
    peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      resolve(id);
    });
    
    peer.on('error', (err) => {
      console.error('Peer error:', err);
      callbacks.onError(err);
      reject(err);
    });
    
    peer.on('connection', (conn) => {
      console.log('Connection received!');
      connection = conn;
      setupConnection();
      callbacks.onGameJoined({ gameId: conn.peer, isHost: false });
    });
  });
};

// Setup connection handlers
const setupConnection = () => {
  connection.on('data', (data) => {
    console.log('Received data:', data);
    
    if (data.type === 'MOVE') {
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
  return initPeer().then((id) => {
    gameId = id;
    return { gameId, isHost: true };
  });
};

// Join an existing game
export const joinGame = (id) => {
  return new Promise((resolve, reject) => {
    if (!peer) {
      initPeer().then(() => {
        connectToPeer(id, resolve, reject);
      }).catch(reject);
    } else {
      connectToPeer(id, resolve, reject);
    }
  });
};

// Connect to a peer
const connectToPeer = (id, resolve, reject) => {
  try {
    connection = peer.connect(id);
    
    connection.on('open', () => {
      console.log('Connected to peer:', id);
      gameId = id;
      setupConnection();
      resolve({ gameId: id, isHost: false });
    });
    
    connection.on('error', (err) => {
      console.error('Connection error:', err);
      reject(err);
    });
  } catch (err) {
    console.error('Error connecting to peer:', err);
    reject(err);
  }
};

// Send a move to the opponent
export const sendMove = (board, currentPlayer) => {
  if (connection && connection.open) {
    connection.send({
      type: 'MOVE',
      board,
      currentPlayer
    });
    return true;
  }
  return false;
};

// Set callbacks
export const setCallbacks = (newCallbacks) => {
  callbacks = { ...callbacks, ...newCallbacks };
};

// Disconnect
export const disconnect = () => {
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