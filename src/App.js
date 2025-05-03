// src/App.js - Updated with online functionality
import React, { useState } from 'react';
import Board from './components/Board/Board';
import GameInfo from './components/GameInfo/GameInfo';
import GameMode from './components/GameMode/GameMode';
import OnlineGameMenu from './components/OnlineGame/OnlineGameMenu';
import { GameProvider } from './context/GameContext';
import { OnlineProvider } from './context/OnlineContext';
import './App.css';

function App() {
  const [showOnlineMenu, setShowOnlineMenu] = useState(false);

  return (
    <OnlineProvider>
      <GameProvider>
        <div className="App">
          <h1>React Chess Game</h1>
          
          <div className="app-controls">
            <GameMode />
            <button 
              className="online-mode-btn" 
              onClick={() => setShowOnlineMenu(!showOnlineMenu)}
            >
              {showOnlineMenu ? "Hide Online Menu" : "Play Online"}
            </button>
          </div>
          
          {showOnlineMenu && <OnlineGameMenu />}
          
          <div className="game-container">
            <Board />
            <GameInfo />
          </div>
        </div>
      </GameProvider>
    </OnlineProvider>
  );
}

export default App;