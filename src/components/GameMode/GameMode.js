// src/components/GameMode/GameMode.jsx

import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import './GameMode.css';

const GameMode = () => {
  const { gameMode, difficulty, setGameOptions } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleModeChange = (newMode) => {
    setGameOptions({ gameMode: newMode });
    if (newMode === 'human') {
      setIsOpen(false);
    }
  };
  
  const handleDifficultyChange = (newDifficulty) => {
    setGameOptions({ difficulty: newDifficulty });
  };
  
  return (
    <div className="game-mode-container">
      <button className="mode-toggle" onClick={() => setIsOpen(!isOpen)}>
        {gameMode === 'human' ? '👥 Human vs Human' : '🤖 Human vs Computer'}
      </button>
      
      {isOpen && (
        <div className="mode-panel">
          <h3>Game Mode</h3>
          
          <div className="mode-options">
            <button 
              className={`mode-option ${gameMode === 'human' ? 'selected' : ''}`}
              onClick={() => handleModeChange('human')}
            >
              <span>👥 Human vs Human</span>
            </button>
            
            <button 
              className={`mode-option ${gameMode === 'computer' ? 'selected' : ''}`}
              onClick={() => handleModeChange('computer')}
            >
              <span>🤖 Human vs Computer</span>
            </button>
          </div>
          
          {gameMode === 'computer' && (
            <div className="difficulty-options">
              <h4>AI Difficulty</h4>
              <div className="radio-options">
                <label>
                  <input 
                    type="radio" 
                    value="easy" 
                    checked={difficulty === 'easy'} 
                    onChange={() => handleDifficultyChange('easy')} 
                  />
                  Easy
                </label>
                
                <label>
                  <input 
                    type="radio" 
                    value="medium" 
                    checked={difficulty === 'medium'} 
                    onChange={() => handleDifficultyChange('medium')} 
                  />
                  Medium
                </label>
                
                <label>
                  <input 
                    type="radio" 
                    value="hard" 
                    checked={difficulty === 'hard'} 
                    onChange={() => handleDifficultyChange('hard')} 
                  />
                  Hard
                </label>
              </div>
            </div>
          )}
          
          <button className="close-mode" onClick={() => setIsOpen(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default GameMode;