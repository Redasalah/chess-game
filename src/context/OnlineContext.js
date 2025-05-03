// src/context/OnlineContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import onlineService from '../services/OnlineService';

const OnlineContext = createContext();

export const OnlineProvider = ({ children }) => {
  const [onlineState, setOnlineState] = useState({
    isOnline: false,
    gameId: null,
    isHost: false,
    error: null,
    playerColor: null,
    connectionStatus: 'disconnected', // 'disconnected', 'connecting', 'connected', 'error'
    waitingForOpponent: false,
    gameStarted: false,
    opponentDisconnected: false
  });
  
  const [remoteMove, setRemoteMove] = useState(null);
  
  useEffect(() => {
    // Set up callbacks
    onlineService.setCallbacks({
      onGameJoined: (data) => {
        console.log("Game joined callback:", data);
        setOnlineState(prev => ({
          ...prev,
          isOnline: true,
          gameId: data.gameId,
          isHost: data.isHost,
          playerColor: data.isHost ? 'white' : 'black',
          connectionStatus: 'connected',
          waitingForOpponent: data.isHost, // If host, wait for opponent
          error: null
        }));
      },
      onMove: (move) => {
        console.log("Move received:", move);
        setRemoteMove(move);
      },
      onGameStart: () => {
        console.log("Game start callback");
        setOnlineState(prev => ({
          ...prev,
          waitingForOpponent: false,
          gameStarted: true
        }));
      },
      onOpponentDisconnect: () => {
        console.log("Opponent disconnect callback");
        setOnlineState(prev => ({
          ...prev,
          opponentDisconnected: true
        }));
      },
      onConnectionError: (error) => {
        console.error("Connection error:", error);
        setOnlineState(prev => ({
          ...prev,
          error: error.message || "Connection error",
          connectionStatus: 'error'
        }));
      }
    });
    
    // Cleanup on unmount
    return () => {
      onlineService.disconnect();
    };
  }, []);
  
  const createOnlineGame = async () => {
    try {
      setOnlineState(prev => ({
        ...prev,
        connectionStatus: 'connecting',
        error: null
      }));
      
      await onlineService.connect();
      const result = await onlineService.createGame();
      console.log("Game created:", result);
      
      return result;
    } catch (error) {
      console.error("Failed to create game:", error);
      setOnlineState(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: error.message || "Failed to create game"
      }));
      throw error;
    }
  };
  
  const joinOnlineGame = async (id) => {
    try {
      setOnlineState(prev => ({
        ...prev,
        connectionStatus: 'connecting',
        error: null
      }));
      
      await onlineService.connect();
      const result = await onlineService.joinGame(id);
      console.log("Game joined:", result);
      
      return result;
    } catch (error) {
      console.error("Failed to join game:", error);
      setOnlineState(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: error.message || "Failed to join game"
      }));
      throw error;
    }
  };
  
  const sendOnlineMove = (move) => {
    console.log("Sending online move:", move);
    if (!onlineState.isOnline) {
      console.error("Not online, can't send move");
      return false;
    }
    
    return onlineService.sendMove(move);
  };
  
  const leaveOnlineGame = () => {
    onlineService.disconnect();
    setOnlineState({
      isOnline: false,
      gameId: null,
      isHost: false,
      error: null,
      playerColor: null,
      connectionStatus: 'disconnected',
      waitingForOpponent: false,
      gameStarted: false,
      opponentDisconnected: false
    });
  };
  
  const consumeRemoteMove = () => {
    const move = remoteMove;
    setRemoteMove(null);
    return move;
  };
  
  const value = {
    ...onlineState,
    createOnlineGame,
    joinOnlineGame,
    sendOnlineMove,
    leaveOnlineGame,
    remoteMove,
    consumeRemoteMove
  };
  
  return (
    <OnlineContext.Provider value={value}>
      {children}
    </OnlineContext.Provider>
  );
};

export const useOnline = () => {
  const context = useContext(OnlineContext);
  if (!context) {
    throw new Error('useOnline must be used within an OnlineProvider');
  }
  return context;
};