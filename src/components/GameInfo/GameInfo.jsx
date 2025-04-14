// src/components/GameInfo/GameInfo.jsx

import React from 'react';
import { useGame } from '../../context/GameContext';
import './GameInfo.css';

const GameInfo = () => {
 const { 
   currentPlayer, 
   gameStatus, 
   message, 
   moveHistory, 
   capturedPieces,
   resetGame,
   undoMove,
   moveToNotation
 } = useGame();
 
 return (
   <div className="game-info">
     <div className="status-section">
       <div className="turn-indicator">
         Current Turn: <span className={`player-${currentPlayer}`}>{currentPlayer}</span>
       </div>
       {message && <div className="game-message">{message}</div>}
       <div className="game-status">
         Status: <span className={`status-${gameStatus}`}>{gameStatus}</span>
       </div>
     </div>
     
     <div className="controls-section">
       <button className="control-button" onClick={resetGame}>New Game</button>
       <button 
         className="control-button" 
         onClick={undoMove} 
         disabled={moveHistory.length === 0}
       >
         Undo Move
       </button>
     </div>
     
     <div className="captured-pieces-section">
       <h3>Captured Pieces</h3>
       <div className="captured-containers">
         <div className="captured-by-white">
           <h4>Captured by White</h4>
           <div className="pieces-list">
             {capturedPieces.white.map((piece, index) => (
               <div key={index} className="captured-piece">
                 {getPieceSymbol(piece)}
               </div>
             ))}
             {capturedPieces.white.length === 0 && 
               <div className="no-captures">No captures yet</div>
             }
           </div>
         </div>
         
         <div className="captured-by-black">
           <h4>Captured by Black</h4>
           <div className="pieces-list">
             {capturedPieces.black.map((piece, index) => (
               <div key={index} className="captured-piece">
                 {getPieceSymbol(piece)}
               </div>
             ))}
             {capturedPieces.black.length === 0 && 
               <div className="no-captures">No captures yet</div>
             }
           </div>
         </div>
       </div>
     </div>
     
     <div className="move-history-section">
       <h3>Move History</h3>
       <div className="moves-list">
         {moveHistory.map((move, index) => (
           <div key={index} className="move-entry">
             <span className="move-number">{Math.floor(index/2) + 1}.</span>
             <span className="move-notation">{moveToNotation(move)}</span>
           </div>
         ))}
         {moveHistory.length === 0 && 
           <div className="no-moves">No moves yet</div>
         }
       </div>
     </div>
   </div>
 );
};

// Helper function to display piece symbols
const getPieceSymbol = (piece) => {
 const symbols = {
   white: {
     king: '♔', queen: '♕', rook: '♖', 
     bishop: '♗', knight: '♘', pawn: '♙'
   },
   black: {
     king: '♚', queen: '♛', rook: '♜', 
     bishop: '♝', knight: '♞', pawn: '♟'
   }
 };
 
 return symbols[piece.color][piece.type];
};

export default GameInfo;