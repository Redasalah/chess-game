// src/App.js

import React from 'react';
import Board from './components/Board/Board';
import GameInfo from './components/GameInfo/GameInfo';
import GameMode from './components/GameMode/GameMode';
import { GameProvider } from './context/GameContext';
import './App.css';

function App() {
  return (
    <GameProvider>
      <div className="App">
        <div className="app-header">
          <h1>React Chess Game</h1>
          <GameMode />
        </div>
        <div className="game-container">
          <Board />
          <GameInfo />
        </div>
      </div>
    </GameProvider>
  );
}

export default App;