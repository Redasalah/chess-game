// src/components/OnlineGame/OnlineGameMenu.jsx
import React, { useState } from 'react';
import { createGame, joinGame } from '../../services/onlineGameService';
import './OnlineGameMenu.css';

const OnlineGameMenu = ({ onGameStart }) => {
  const [gameId, setGameId] = useState('');
  const [playerColor, setPlayerColor] = useState('white');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleCreateGame = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await createGame(playerColor);
      onGameStart(result);
    } catch (err) {
      setError('Failed to create game: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinGame = async () => {
    if (!gameId.trim()) {
      setError('Please enter a game ID');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const result = await joinGame(gameId);
      onGameStart(result);
    } catch (err) {
      setError('Failed to join game: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="online-game-menu">
      <h2>Play Online</h2>
      
      <div className="menu-section">
        <h3>Create a New Game</h3>
        <div className="color-selection">
          <p>Play as:</p>
          <div className="color-options">
            <label>
              <input
                type="radio"
                value="white"
                checked={playerColor === 'white'}
                onChange={() => setPlayerColor('white')}
              />
              White
            </label>
            <label>
              <input
                type="radio"
                value="black"
                checked={playerColor === 'black'}
                onChange={() => setPlayerColor('black')}
              />
              Black
            </label>
          </div>
        </div>
        <button 
          className="create-game-btn" 
          onClick={handleCreateGame}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Game'}
        </button>
      </div>
      
      <div className="menu-divider">OR</div>
      
      <div className="menu-section">
        <h3>Join a Game</h3>
        <input
          type="text"
          placeholder="Enter Game ID"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          className="game-id-input"
        />
        <button 
          className="join-game-btn" 
          onClick={handleJoinGame}
          disabled={loading}
        >
          {loading ? 'Joining...' : 'Join Game'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default OnlineGameMenu;