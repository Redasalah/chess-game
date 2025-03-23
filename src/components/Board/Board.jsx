// src/components/Board/Board.jsx
import React, { useState } from 'react';
import Square from '../Square/Square';
import Piece from '../Piece/Piece';
import { initialBoardSetup } from '../../utils/boardSetup';
import { getPawnMoves, getRookMoves } from '../../utils/moveValidation';
import './Board.css';

const Board = ({ currentPlayer, onTurnChange }) => {
  const [boardState, setBoardState] = useState(initialBoardSetup());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  
  const getValidMoves = (row, col, piece) => {
    if (piece.type === 'pawn') {
      return getPawnMoves(boardState, row, col, piece.color);
    } else if (piece.type === 'rook') {
      return getRookMoves(boardState, row, col, piece.color);
    }
    return [];
  };
  
  const handlePieceClick = (position) => {
    const [row, col] = position.split(',').map(Number);
    const piece = boardState[row][col];
    
    // Only allow selecting pieces of the current player's color
    if (piece && piece.color === currentPlayer) {
      const newValidMoves = getValidMoves(row, col, piece);
      setSelectedPiece({ row, col, piece });
      setValidMoves(newValidMoves);
    }
  };
  
  const handleSquareClick = (row, col) => {
    // If we have a selected piece and the clicked square is a valid move
    if (selectedPiece && validMoves.some(move => move.row === row && move.col === col)) {
      // Create a copy of the board
      const newBoard = boardState.map(row => [...row]);
      
      // Move the piece
      newBoard[row][col] = selectedPiece.piece;
      newBoard[selectedPiece.row][selectedPiece.col] = null;
      
      // Update the board
      setBoardState(newBoard);
      
      // Reset selection
      setSelectedPiece(null);
      setValidMoves([]);
      
      // Switch turns (Task 4.3)
      onTurnChange(currentPlayer === 'white' ? 'black' : 'white');
    }
  };
  
  const renderBoard = () => {
    const squares = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLightSquare = (row + col) % 2 === 0;
        const position = `${row},${col}`;
        const piece = boardState[row][col];
        
        // Check if this square contains the selected piece
        const isSelected = selectedPiece && 
                          selectedPiece.row === row && 
                          selectedPiece.col === col;
        
        // Check if this is a valid move square
        const isValidMove = validMoves.some(move => 
          move.row === row && move.col === col);
        
        squares.push(
          <Square 
            key={position}
            isLight={isLightSquare}
            position={position}
            isSelected={isSelected}
            isValidMove={isValidMove}
            onClick={() => handleSquareClick(row, col)}
          >
            {piece && (
              <Piece 
                type={piece.type} 
                color={piece.color} 
                position={position}
                onClick={handlePieceClick}
              />
            )}
          </Square>
        );
      }
    }
    
    return squares;
  };

  return (
    <div className="chess-board">
      {renderBoard()}
    </div>
  );
};

export default Board;