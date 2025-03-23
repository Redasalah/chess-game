// src/utils/boardSetup.js
export const initialBoardSetup = () => {
    // Create empty 8x8 board
    const board = Array(8).fill().map(() => Array(8).fill(null));
    
    // Set up pawns
    for (let col = 0; col < 8; col++) {
      board[1][col] = { type: 'pawn', color: 'black' };
      board[6][col] = { type: 'pawn', color: 'white' };
    }
    
    // Set up back rows
    const backRowPieces = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    
    for (let col = 0; col < 8; col++) {
      board[0][col] = { type: backRowPieces[col], color: 'black' };
      board[7][col] = { type: backRowPieces[col], color: 'white' };
    }
    
    return board;
  };