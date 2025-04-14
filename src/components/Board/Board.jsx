// src/components/Board/Board.jsx

import React from 'react';
import Square from '../Square/Square';
import Piece from '../Piece/Piece';
import { useGame } from '../../context/GameContext';
import { 
  getPawnMoves, 
  getRookMoves, 
  getKnightMoves, 
  getBishopMoves, 
  getQueenMoves, 
  getKingMoves,
  isKingInCheck
} from '../../utils/moveValidation';
import './Board.css';

const Board = () => {
  const { 
    board, 
    currentPlayer, 
    selectedPiece, 
    validMoves, 
    selectPiece, 
    movePiece 
  } = useGame();
  
  const getValidMoves = (row, col, piece) => {
    if (!piece) return [];
    
    let moves = [];
    
    switch (piece.type) {
      case 'pawn':
        moves = getPawnMoves(board, row, col, piece.color);
        break;
      case 'rook':
        moves = getRookMoves(board, row, col, piece.color);
        break;
      case 'knight':
        moves = getKnightMoves(board, row, col, piece.color);
        break;
      case 'bishop':
        moves = getBishopMoves(board, row, col, piece.color);
        break;
      case 'queen':
        moves = getQueenMoves(board, row, col, piece.color);
        break;
      case 'king':
        moves = getKingMoves(board, row, col, piece.color);
        break;
      default:
        break;
    }
    
    // Filter out moves that would leave king in check
    return moves.filter(move => {
      // Create a copy of the board
      const newBoard = board.map(boardRow => [...boardRow]);
      
      // Simulate the move
      newBoard[move.row][move.col] = piece;
      newBoard[row][col] = null;
      
      // Check if this move would leave king in check
      return !isKingInCheck(newBoard, piece.color);
    });
  };
  
  const handlePieceClick = (position) => {
    const [row, col] = position.split(',').map(Number);
    const piece = board[row][col];
    
    // Only allow selecting pieces of the current player's color
    if (piece && piece.color === currentPlayer) {
      const moves = getValidMoves(row, col, piece);
      selectPiece({ row, col, piece }, moves);
    }
  };
  
  const handleSquareClick = (row, col) => {
    // If we have a selected piece and the clicked square is a valid move
    if (selectedPiece && validMoves.some(move => move.row === row && move.col === col)) {
      // Create a copy of the board
      const newBoard = board.map(boardRow => [...boardRow]);
      
      // Capture piece if present
      const capturedPiece = newBoard[row][col];
      
      // Move the piece
      newBoard[row][col] = selectedPiece.piece;
      newBoard[selectedPiece.row][selectedPiece.col] = null;
      
      // Create move record
      const move = {
        piece: selectedPiece.piece,
        from: {
          row: selectedPiece.row,
          col: selectedPiece.col
        },
        to: {
          row,
          col
        },
        captured: capturedPiece
      };
      
      // Update the game state
      movePiece(newBoard, move, capturedPiece);
    }
  };
  
  const renderBoard = () => {
    const squares = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const isLightSquare = (row + col) % 2 === 0;
        const position = `${row},${col}`;
        const piece = board[row][col];
        
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