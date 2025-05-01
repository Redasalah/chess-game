// src/context/SimpleOnlineContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initPeer,
  createGame,
  joinGame,
  sendMove,
  setCallbacks,
  disconnect
} from '../services/SimpleOnlineService';

const SimpleOnlineContext = createContext();

export const SimpleOnlineProvider = ({ children }) => {
  const [onlineState, setOnlineState] = useState({
    isOnline: false,
    gameId: null,
    isHost: false,
    error: null
  });
  
  const [remoteMove, setRemoteMove] = useState(null);
  
  useEffect(() => {
    // Set up callbacks for the online service
    setCallbacks({
      onGameJoined: (data) => {
        setOnlineState({
          isOnline: true,
          gameId: data.gameId,
          isHost: data.isHost,
          error: null
        });
      },
      onMoveMade: (board, currentPlayer) => {
        setRemoteMove({ board, currentPlayer });
      },
      onError: (error) => {
        setOnlineState(prev => ({
          ...prev,
          error: error.message || "Connection error"
        }));
      },
      onDisconnect: () => {
        setOnlineState({
          isOnline: false,
          gameId: null,
          isHost: false,
          error: "Disconnected from game"
        });
      }
    });
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);
  
  const createOnlineGame = async () => {
    try {
      const result = await createGame();
      return result;
    } catch (error) {
      setOnlineState(prev => ({
        ...prev,
        error: error.message || "Failed to create game"
      }));
      throw error;
    }
  };
  
  const joinOnlineGame = async (id) => {
    try {
      const result = await joinGame(id);
      return result;
    } catch (error) {
      setOnlineState(prev => ({
        ...prev,
        error: error.message || "Failed to join game"
      }));
      throw error;
    }
  };
  
  const sendOnlineMove = (board, currentPlayer) => {
    return sendMove(board, currentPlayer);
  };
  
  const leaveOnlineGame = () => {
    disconnect();
    setOnlineState({
      isOnline: false,
      gameId: null,
      isHost: false,
      error: null
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
    <SimpleOnlineContext.Provider value={value}>
      {children}
    </SimpleOnlineContext.Provider>
  );
};

export const useSimpleOnline = () => {
  const context = useContext(SimpleOnlineContext);
  if (!context) {
    throw new Error('useSimpleOnline must be used within a SimpleOnlineProvider');
  }
  return context;
};