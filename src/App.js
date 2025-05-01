// src/App.js
import React, { useState } from 'react';
import Board from './components/Board/Board';
import GameInfo from './components/GameInfo/GameInfo';
import GameMode from './components/GameMode/GameMode';
import SimpleOnlineMenu from './components/SimpleOnline/SimpleOnlineMenu';
import { GameProvider } from './context/GameContext';
import { SimpleOnlineProvider } from './context/SimpleOnlineContext';
import './App.css';

function App() {
  const [showOnlineMenu, setShowOnlineMenu] = useState(false);

  return (
    <SimpleOnlineProvider>
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
          
          {showOnlineMenu && <SimpleOnlineMenu />}
          
          <div className="game-container">
            <Board />
            <GameInfo />
          </div>
        </div>
      </GameProvider>
    </SimpleOnlineProvider>
  );
}

export default App;