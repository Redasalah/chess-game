// src/services/OnlineService.js
import { io } from 'socket.io-client';

class OnlineService {
  constructor() {
    this.socket = null;
    this.gameId = null;
    this.callbacks = {
      onMove: () => {},
      onGameStart: () => {},
      onOpponentDisconnect: () => {},
      onConnectionError: () => {},
      onGameJoined: () => {},
    };
    this.isConnected = false;
  }

  connect() {
    if (this.socket) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = io();
        
        this.socket.on('connect', () => {
          console.log('Connected to server');
          this.isConnected = true;
          resolve();
        });
        
        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.callbacks.onConnectionError(error);
          reject(error);
        });
        
        this.socket.on('newMove', (move) => {
          console.log('Remote move received:', move);
          this.callbacks.onMove(move);
        });
        
        this.socket.on('startGame', () => {
          console.log('Game started');
          this.callbacks.onGameStart();
        });
        
        this.socket.on('gameOverDisconnect', () => {
          console.log('Opponent disconnected');
          this.callbacks.onOpponentDisconnect();
        });
      } catch (error) {
        console.error('Failed to connect:', error);
        reject(error);
      }
    });
  }

  createGame() {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }
      
      // Generate a random game ID
      this.gameId = Math.random().toString(36).substring(2, 10);
      
      // Join the game room
      this.socket.emit('joinGame', { code: this.gameId });
      
      this.callbacks.onGameJoined({
        gameId: this.gameId,
        playerColor: 'white',
        isHost: true
      });
      
      resolve({
        gameId: this.gameId,
        playerColor: 'white'
      });
    });
  }

  joinGame(gameId) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }
      
      if (!gameId) {
        reject(new Error('Game ID is required'));
        return;
      }
      
      this.gameId = gameId;
      
      // Join the game room
      this.socket.emit('joinGame', { code: gameId });
      
      this.callbacks.onGameJoined({
        gameId: this.gameId,
        playerColor: 'black',
        isHost: false
      });
      
      resolve({
        gameId: this.gameId,
        playerColor: 'black'
      });
    });
  }

  sendMove(move) {
    if (!this.socket || !this.gameId) {
      console.error('Cannot send move: not connected or no game joined');
      return false;
    }
    
    console.log('Sending move:', move);
    this.socket.emit('move', move);
    return true;
  }

  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.gameId = null;
      this.isConnected = false;
    }
  }
}

// Create a singleton instance
const onlineService = new OnlineService();
export default onlineService;