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
    error: null,
    playerColor: null,
    connectionStatus: 'disconnected' // New state to track connection
  });
  
  const [remoteMove, setRemoteMove] = useState(null);
  
  useEffect(() => {
    // Set up callbacks
    setCallbacks({
      onGameJoined: (data) => {
        console.log("Game joined callback:", data);
        setOnlineState(prev => ({
          ...prev,
          isOnline: true,
          gameId: data.gameId,
          isHost: data.isHost,
          playerColor: data.isHost ? 'white' : 'black',
          connectionStatus: 'connected',
          error: null
        }));
      },
      onMoveMade: (board, currentPlayer) => {
        console.log("Move made callback:", { boardUpdated: !!board });
        if (board) {
          setRemoteMove({ board, currentPlayer });
        }
      },
      onError: (error) => {
        console.error("Connection error:", error);
        setOnlineState(prev => ({
          ...prev,
          error: error.message || "Connection error",
          connectionStatus: 'error'
        }));
      },
      onDisconnect: () => {
        console.log("Disconnect callback fired");
        setOnlineState(prev => ({
          ...prev,
          isOnline: false,
          connectionStatus: 'disconnected',
          error: "Disconnected from game"
        }));
      }
    });
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);
  
  const createOnlineGame = async () => {
    try {
      setOnlineState(prev => ({
        ...prev,
        connectionStatus: 'connecting',
        error: null
      }));
      
      const result = await createGame();
      console.log("Game created:", result);
      
      // Update state is handled by callbacks now
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
      
      const result = await joinGame(id);
      console.log("Game joined:", result);
      
      // Update state is handled by callbacks now
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
  
  const sendOnlineMove = (board, currentPlayer) => {
    console.log("Sending online move");
    if (!onlineState.isOnline) {
      console.error("Not online, can't send move");
      return false;
    }
    
    return sendMove(board, currentPlayer);
  };
  
  const leaveOnlineGame = () => {
    disconnect();
    setOnlineState({
      isOnline: false,
      gameId: null,
      isHost: false,
      error: null,
      playerColor: null,
      connectionStatus: 'disconnected'
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