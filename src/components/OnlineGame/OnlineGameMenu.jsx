// src/components/OnlineGame/OnlineGameMenu.jsx
import React, { useState } from 'react';
import { useOnline } from '../../context/OnlineContext';
import './OnlineGameMenu.css';

const OnlineGameMenu = () => {
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  
  const {
    isOnline,
    gameId,
    isHost,
    error,
    waitingForOpponent,
    connectionStatus,
    createOnlineGame,
    joinOnlineGame,
    leaveOnlineGame,
    playerColor
  } = useOnline();
  
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
  
  if (!showMenu) {
    return (
      <button 
        className="open-online-menu-btn"
        onClick={() => setShowMenu(true)}
      >
        Show Online Menu
      </button>
    );
  }
  
  if (isOnline) {
    return (
      <div className="online-game-menu">
        <div className="menu-header">
          <h3>Online Game</h3>
          <button 
            className="minimize-btn"
            onClick={() => setShowMenu(false)}
          >
            −
          </button>
        </div>
        
        <div className="game-status">
          <p>
            {waitingForOpponent 
              ? "Waiting for opponent to join..." 
              : "Connected to game"}
          </p>
          <p>
            You are playing as: <strong>{playerColor === 'white' ? 'White' : 'Black'}</strong>
          </p>
          <div className="game-id-container">
            <span>Game ID: </span>
            <span className="game-id">{gameId}</span>
            <button 
              className="copy-btn" 
              onClick={copyGameId}
            >
              Copy
            </button>
          </div>
        </div>
        <button className="leave-button" onClick={leaveOnlineGame}>
          Leave Game
        </button>
      </div>
    );
  }
  
  return (
    <div className="online-game-menu">
      <div className="menu-header">
        <h3>Play Online</h3>
        <button 
          className="minimize-btn"
          onClick={() => setShowMenu(false)}
        >
          −
        </button>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      {connectionStatus === 'connecting' && (
        <div className="connecting-message">Connecting...</div>
      )}
      
      <div className="menu-section">
        <h4>Create a New Game</h4>
        <button 
          className="create-game-btn" 
          onClick={handleCreateGame}
          disabled={loading || connectionStatus === 'connecting'}
        >
          {loading ? "Creating..." : "Create Game"}
        </button>
      </div>
      
      <div className="menu-divider">OR</div>
      
      <div className="menu-section">
        <h4>Join a Game</h4>
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
          disabled={loading || connectionStatus === 'connecting'}
        >
          {loading ? "Joining..." : "Join Game"}
        </button>
      </div>
    </div>
  );
};

export default OnlineGameMenu;