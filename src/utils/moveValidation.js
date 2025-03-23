
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