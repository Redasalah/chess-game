// src/components/OnlineGame/OnlineGameStatus.jsx
import React from 'react';
import './OnlineGameStatus.css';

const OnlineGameStatus = ({ gameData, playerColor }) => {
  if (!gameData) return null;
  
  const { status, players, currentPlayer } = gameData;
  const opponent = playerColor === 'white' ? 'black' : 'white';
  
  const getStatusMessage = () => {
    if (status === 'waiting') {
      return "Waiting for opponent to join...";
    }
    
    if (status === 'checkmate') {
      const winner = currentPlayer === 'white' ? 'black' : 'white';
      return `Checkmate! ${winner === playerColor ? 'You won!' : 'You lost!'}`;
    }
    
    if (status === 'stalemate') {
      return "Game ended in a draw!";
    }
    
    const isYourTurn = currentPlayer === playerColor;
    return isYourTurn ? "Your turn" : "Opponent's turn";
  };
  
  return (
    <div className="online-game-status">
      <div className="game-id-display">
        <span>Game ID: <strong>{gameData.id}</strong></span>
        <button className="copy-btn" onClick={() => navigator.clipboard.writeText(gameData.id)}>
          Copy
        </button>
      </div>
      
      <div className="players-status">
        <div className={`player you ${currentPlayer === playerColor ? 'active' : ''}`}>
          <div className="player-color">You ({playerColor})</div>
          <div className="connection-status">
            {players[playerColor]?.connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <div className={`player opponent ${currentPlayer === opponent ? 'active' : ''}`}>
          <div className="player-color">Opponent ({opponent})</div>
          <div className="connection-status">
            {players[opponent]?.connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>
      
      <div className="game-status-message">
        {getStatusMessage()}
      </div>
    </div>
  );
};

export default OnlineGameStatus;