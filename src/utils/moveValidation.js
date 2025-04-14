
// src/utils/moveValidation.js

// Pawn moves function
export const getPawnMoves = (board, row, col, color) => {
  const moves = [];
  const direction = color === 'white' ? -1 : 1; // White moves up, black moves down
  const startRow = color === 'white' ? 6 : 1;   // Starting rows for pawns
  
  // Forward move (1 square)
  const newRow = row + direction;
  if (newRow >= 0 && newRow < 8 && !board[newRow][col]) {
    moves.push({ row: newRow, col });
    
    // Initial two-square move
    if (row === startRow) {
      const twoSquaresRow = row + 2 * direction;
      if (!board[twoSquaresRow][col]) {
        moves.push({ row: twoSquaresRow, col });
      }
    }
  }
  
  // Diagonal captures
  const captureCols = [col - 1, col + 1];
  for (const captureCol of captureCols) {
    if (captureCol >= 0 && captureCol < 8) {
      const captureRow = row + direction;
      if (captureRow >= 0 && captureRow < 8) {
        const targetPiece = board[captureRow][captureCol];
        if (targetPiece && targetPiece.color !== color) {
          moves.push({ row: captureRow, col: captureCol });
        }
      }
    }
  }
  
  return moves;
};

// src/utils/moveValidation.js
// Add this function to your existing file

export const getKnightMoves = (board, row, col, color) => {
  const moves = [];
  const knightMoves = [
    { row: -2, col: -1 }, { row: -2, col: 1 },
    { row: -1, col: -2 }, { row: -1, col: 2 },
    { row: 1, col: -2 }, { row: 1, col: 2 },
    { row: 2, col: -1 }, { row: 2, col: 1 }
  ];
  
  for (const move of knightMoves) {
    const newRow = row + move.row;
    const newCol = col + move.col;
    
    // Check if the position is on the board
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      
      // Square is empty or has enemy piece
      if (!targetPiece || targetPiece.color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }
  
  return moves;
};

// Rook moves function
export const getRookMoves = (board, row, col, color) => {
  const moves = [];
  const directions = [
    { rowChange: -1, colChange: 0 }, // up
    { rowChange: 1, colChange: 0 },  // down
    { rowChange: 0, colChange: -1 }, // left
    { rowChange: 0, colChange: 1 }   // right
  ];
  
  // Check each direction
  for (const direction of directions) {
    let newRow = row + direction.rowChange;
    let newCol = col + direction.colChange;
    
    // Continue in this direction until we hit a piece or the edge of the board
    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      
      if (!targetPiece) {
        // Empty square, we can move here
        moves.push({ row: newRow, col: newCol });
      } else {
        // Hit a piece
        if (targetPiece.color !== color) {
          // Enemy piece, we can capture it
          moves.push({ row: newRow, col: newCol });
        }
        // Either way, we can't go further in this direction
        break;
      }
      
      // Move further in the same direction
      newRow += direction.rowChange;
      newCol += direction.colChange;
    }
  }
  
  return moves;
};
// src/utils/moveValidation.js
// Add this function to your existing file

export const getBishopMoves = (board, row, col, color) => {
  const moves = [];
  const directions = [
    { row: -1, col: -1 }, // up-left
    { row: -1, col: 1 },  // up-right
    { row: 1, col: -1 },  // down-left
    { row: 1, col: 1 }    // down-right
  ];
  
  for (const direction of directions) {
    let newRow = row + direction.row;
    let newCol = col + direction.col;
    
    // Continue in this direction until we hit a piece or the edge of the board
    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      
      if (!targetPiece) {
        // Empty square, we can move here
        moves.push({ row: newRow, col: newCol });
      } else {
        // Hit a piece
        if (targetPiece.color !== color) {
          // Enemy piece, we can capture it
          moves.push({ row: newRow, col: newCol });
        }
        // Either way, we can't go further in this direction
        break;
      }
      
      // Move further in the same direction
      newRow += direction.row;
      newCol += direction.col;
    }
  }
  
  return moves;
};
// src/utils/moveValidation.js
// Add this function to your existing file

export const getQueenMoves = (board, row, col, color) => {
  // Queen moves are a combination of rook and bishop moves
  const rookMoves = getRookMoves(board, row, col, color);
  const bishopMoves = getBishopMoves(board, row, col, color);
  
  // Combine the moves
  return [...rookMoves, ...bishopMoves];
};
// src/utils/moveValidation.js
// Add this function to your existing file

export const getKingMoves = (board, row, col, color) => {
  const moves = [];
  const kingMoves = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 },                       { row: 0, col: 1 },
    { row: 1, col: -1 },  { row: 1, col: 0 },  { row: 1, col: 1 }
  ];
  
  for (const move of kingMoves) {
    const newRow = row + move.row;
    const newCol = col + move.col;
    
    // Check if the position is on the board
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      const targetPiece = board[newRow][newCol];
      
      // Square is empty or has enemy piece
      if (!targetPiece || targetPiece.color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }
  
  return moves;
};
// src/utils/moveValidation.js
// Add these functions for checkmate and stalemate detection

export const isCheckmate = (board, color) => {
  // First, check if the king is in check
  if (!isKingInCheck(board, color)) {
    return false;
  }
  
  // Try every possible move for every piece of this color
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      
      if (piece && piece.color === color) {
        // Get valid moves for this piece
        let validMoves = [];
        
        switch (piece.type) {
          case 'pawn':
            validMoves = getPawnMoves(board, row, col, color);
            break;
          case 'rook':
            validMoves = getRookMoves(board, row, col, color);
            break;
          case 'knight':
            validMoves = getKnightMoves(board, row, col, color);
            break;
          case 'bishop':
            validMoves = getBishopMoves(board, row, col, color);
            break;
          case 'queen':
            validMoves = getQueenMoves(board, row, col, color);
            break;
          case 'king':
            validMoves = getKingMoves(board, row, col, color);
            break;
          default:
            break;
        }
        
        // Try each move to see if it gets out of check
        for (const move of validMoves) {
          // Create a copy of the board
          const newBoard = board.map(boardRow => [...boardRow]);
          
          // Simulate the move
          newBoard[move.row][move.col] = piece;
          newBoard[row][col] = null;
          
          // Check if king is still in check after this move
          if (!isKingInCheck(newBoard, color)) {
            // Found a move that escapes check
            return false;
          }
        }
      }
    }
  }
  
  // If we've tried all moves and none escape check, it's checkmate
  return true;
};

export const isStalemate = (board, color) => {
  // First, check if the king is in check - if yes, it's not stalemate
  if (isKingInCheck(board, color)) {
    return false;
  }
  
  // Check if the player has any legal move
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      
      if (piece && piece.color === color) {
        // Get valid moves for this piece
        let validMoves = [];
        
        switch (piece.type) {
          case 'pawn':
            validMoves = getPawnMoves(board, row, col, color);
            break;
          case 'rook':
            validMoves = getRookMoves(board, row, col, color);
            break;
          case 'knight':
            validMoves = getKnightMoves(board, row, col, color);
            break;
          case 'bishop':
            validMoves = getBishopMoves(board, row, col, color);
            break;
          case 'queen':
            validMoves = getQueenMoves(board, row, col, color);
            break;
          case 'king':
            validMoves = getKingMoves(board, row, col, color);
            break;
          default:
            break;
        }
        
        // For each move, check if it would put/leave the king in check
        for (const move of validMoves) {
          // Create a copy of the board
          const newBoard = board.map(boardRow => [...boardRow]);
          
          // Simulate the move
          newBoard[move.row][move.col] = piece;
          newBoard[row][col] = null;
          
          // If this move doesn't leave king in check, player has a legal move
          if (!isKingInCheck(newBoard, color)) {
            return false;  // Not stalemate - player has at least one legal move
          }
        }
      }
    }
  }
  
  // If we get here, the player has no legal moves and is not in check
  return true;
};
// src/utils/moveValidation.js
// Add these functions to your existing file

// Find king position
export const findKingPosition = (board, color) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null; // Should never happen in a valid chess game
};

// Check if king is in check
export const isKingInCheck = (board, color) => {
  // Find the king's position
  const kingPosition = findKingPosition(board, color);
  if (!kingPosition) return false;
  
  const oppositeColor = color === 'white' ? 'black' : 'white';
  
  // Check if any opponent piece can attack the king
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === oppositeColor) {
        let validMoves = [];
        
        switch (piece.type) {
          case 'pawn':
            validMoves = getPawnMoves(board, row, col, oppositeColor);
            break;
          case 'rook':
            validMoves = getRookMoves(board, row, col, oppositeColor);
            break;
          case 'knight':
            validMoves = getKnightMoves(board, row, col, oppositeColor);
            break;
          case 'bishop':
            validMoves = getBishopMoves(board, row, col, oppositeColor);
            break;
          case 'queen':
            validMoves = getQueenMoves(board, row, col, oppositeColor);
            break;
          case 'king':
            validMoves = getKingMoves(board, row, col, oppositeColor);
            break;
          default:
            validMoves = [];
            break;
        }
        
        // Check if king's position is in the valid moves
        if (validMoves.some(move => 
          move.row === kingPosition.row && move.col === kingPosition.col)) {
          return true;
        }
      }
    }
  }
  
  return false;
};