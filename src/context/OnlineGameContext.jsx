// src/context/OnlineGameContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  subscribeToGame, 
  updatePlayerStatus, 
  makeMove 
} from '../services/onlineGameService';

const OnlineGameContext = createContext();

export const OnlineGameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    isOnline: false,
    gameId: null,
    playerColor: null,
    gameData: null,
    loading: false,
    error: null
  });
  
  // Subscribe to game updates when in an online game
  useEffect(() => {
    let unsubscribe = null;
    
    if (gameState.isOnline && gameState.gameId) {
      unsubscribe = subscribeToGame(gameState.gameId, (gameData) => {
        setGameState(prev => ({
          ...prev,
          gameData: {
            ...gameData,
            id: gameState.gameId
          }
        }));
      });
      
      // Update player connection status
      updatePlayerStatus(gameState.gameId, gameState.playerColor, true);
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [gameState.isOnline, gameState.gameId, gameState.playerColor]);
  
  const startOnlineGame = ({ gameId, color }) => {
    setGameState({
      isOnline: true,
      gameId,
      playerColor: color,
      gameData: null,
      loading: false,
      error: null
    });
  };
  
  const leaveOnlineGame = () => {
    if (gameState.gameId && gameState.playerColor) {
      updatePlayerStatus(gameState.gameId, gameState.playerColor, false);
    }
    
    setGameState({
      isOnline: false,
      gameId: null,
      playerColor: null,
      gameData: null,
      loading: false,
      error: null
    });
  };
  
  const makeOnlineMove = async (move, newBoard, gameStatus) => {
    try {
      await makeMove(gameState.gameId, move, newBoard, gameStatus);
      return true;
    } catch (error) {
      setGameState(prev => ({
        ...prev,
        error: error.message
      }));
      return false;
    }
  };
  
  const value = {
    ...gameState,
    startOnlineGame,
    leaveOnlineGame,
    makeOnlineMove
  };
  
  return (
    <OnlineGameContext.Provider value={value}>
      {children}
    </OnlineGameContext.Provider>
  );
};

export const useOnlineGame = () => {
  const context = useContext(OnlineGameContext);
  if (!context) {
    throw new Error('useOnlineGame must be used within an OnlineGameProvider');
  }
  return context;
};