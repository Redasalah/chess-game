// src/App.js
import React, { useState } from 'react';
import Board from './components/Board/Board';
import './App.css';

function App() {
  const [currentPlayer, setCurrentPlayer] = useState('white');

  return (
    <div className="App">
      <h1>React Chess Game</h1>
      <div className="turn-indicator">
        Current Turn: {currentPlayer}
      </div>
      <div className="game-container">
        <Board 
          currentPlayer={currentPlayer}
          onTurnChange={(player) => setCurrentPlayer(player)}
        />
      </div>
    </div>
  );
}

export default App;