// src/App.js
import React, { useState } from 'react';
import Board from './components/Board/Board';
import GameInfo from './components/GameInfo/GameInfo';
import GameMode from './components/GameMode/GameMode';
import OnlineGameMenu from './components/OnlineGame/OnlineGameMenu';
import OnlineGameStatus from './components/OnlineGame/OnlineGameStatus';
import { GameProvider } from './context/GameContext';
import { OnlineGameProvider, useOnlineGame } from './context/OnlineGameContext';
import './App.css';

// Game controller that handles both offline and online modes
const GameController = () => {
  const [showOnlineMenu, setShowOnlineMenu] = useState(false);
  const { 
    isOnline, 
    gameData, 
    playerColor, 
    startOnlineGame, 
    leaveOnlineGame 
  } = useOnlineGame();
  
  const handleStartOnlineGame = (gameInfo) => {
    startOnlineGame(gameInfo);
    setShowOnlineMenu(false);
  };
  
  return (
    <>
      <div className="app-header">
        <h1>React Chess Game</h1>
        <div className="app-controls">
          {!isOnline && (
            <>
              <GameMode />
              <button 
                className="online-mode-btn" 
                onClick={() => setShowOnlineMenu(true)}
              >
                Play Online
              </button>
            </>
          )}
          
          {isOnline && (
            <button 
              className="leave-game-btn" 
              onClick={leaveOnlineGame}
            >
              Leave Online Game
            </button>
          )}
        </div>
      </div>
      
      {showOnlineMenu && !isOnline && (
        <OnlineGameMenu onGameStart={handleStartOnlineGame} />
      )}
      
      {isOnline && gameData && (
        <OnlineGameStatus gameData={gameData} playerColor={playerColor} />
      )}
      
      <div className="game-container">
        <Board isOnline={isOnline} playerColor={playerColor} />
        <GameInfo isOnline={isOnline} />
      </div>
    </>
  );
};

function App() {
  return (
    <OnlineGameProvider>
      <GameProvider>
        <div className="App">
          <GameController />
        </div>
      </GameProvider>
    </OnlineGameProvider>
  );
}

export default App;