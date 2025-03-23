// src/components/Piece/Piece.jsx
import React from 'react';
import './Piece.css';

const pieceSymbols = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
};

const Piece = ({ type, color, position, onClick }) => {
  const handleClick = () => {
    onClick(position);
  };

  return (
    <div 
      className={`piece ${color}-piece`} 
      onClick={handleClick}
    >
      {pieceSymbols[color][type]}
    </div>
  );
};

export default Piece;