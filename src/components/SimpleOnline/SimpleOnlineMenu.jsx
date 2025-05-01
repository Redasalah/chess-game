// src/components/SimpleOnline/SimpleOnlineMenu.jsx
import React, { useState } from 'react';
import { useSimpleOnline } from '../../context/SimpleOnlineContext';
import './SimpleOnlineMenu.css';

const SimpleOnlineMenu = () => {
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    isOnline,
    gameId,
    isHost,
    error,
    createOnlineGame,
    joinOnlineGame,
    leaveOnlineGame
  } = useSimpleOnline();
  
  const handleCreateGame = async () => {
    setLoading(true);
    try {
      await createOnlineGame();
    } catch (err) {
      console.error("Failed to create game:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleJoinGame = async () => {
    if (!gameIdToJoin.trim()) {
      alert("Please enter a game ID");
      return;
    }
    
    setLoading(true);
    try {
      await joinOnlineGame(gameIdToJoin.trim());
    } catch (err) {
      console.error("Failed to join game:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const copyGameId = () => {
    navigator.clipboard.writeText(gameId)
      .then(() => alert("Game ID copied to clipboard!"))
      .catch(err => console.error("Failed to copy:", err));
  };
  
  if (isOnline) {
    return (
      <div className="simple-online-menu">
        <div className="game-status">
          <p>
            {isHost 
              ? "You created this game. Share this ID with your friend:" 
              : "You joined a game. Game ID:"}
          </p>
          <div className="game-id-container">
            <span className="game-id">{gameId}</span>
            <button onClick={copyGameId}>Copy</button>
          </div>
        </div>
        <button className="leave-button" onClick={leaveOnlineGame}>
          Leave Game
        </button>
      </div>
    );
  }
  
  return (
    <div className="simple-online-menu">
      <h2>Play Online</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="menu-section">
        <h3>Create a New Game</h3>
        <button 
          className="create-game-btn" 
          onClick={handleCreateGame}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Game"}
        </button>
      </div>
      
      <div className="menu-divider">OR</div>
      
      <div className="menu-section">
        <h3>Join a Game</h3>
        <input
          type="text"
          placeholder="Enter Game ID"
          value={gameIdToJoin}
          onChange={(e) => setGameIdToJoin(e.target.value)}
          className="game-id-input"
        />
        <button 
          className="join-game-btn" 
          onClick={handleJoinGame}
          disabled={loading}
        >
          {loading ? "Joining..." : "Join Game"}
        </button>
      </div>
    </div>
  );
};

export default SimpleOnlineMenu;