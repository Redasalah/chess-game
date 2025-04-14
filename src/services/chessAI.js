// src/services/chessAI.js

// Chess piece values for evaluation
const PIECE_VALUES = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 100 // High value to prioritize king safety
  };
  
  // Position value modifiers - center squares are more valuable
  const POSITION_VALUES = [
    [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
    [0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.1],
    [0.1, 0.2, 0.3, 0.3, 0.3, 0.3, 0.2, 0.1],
    [0.1, 0.2, 0.3, 0.4, 0.4, 0.3, 0.2, 0.1],
    [0.1, 0.2, 0.3, 0.4, 0.4, 0.3, 0.2, 0.1],
    [0.1, 0.2, 0.3, 0.3, 0.3, 0.3, 0.2, 0.1],
    [0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.1],
    [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]
  ];
  
  // Get AI move based on current game state
  export const getComputerMove = (board, currentPlayer, difficulty, moveValidationFunctions) => {
    // Extract move validation functions
    const { 
      getPawnMoves, 
      getRookMoves, 
      getKnightMoves, 
      getBishopMoves, 
      getQueenMoves, 
      getKingMoves,
      isKingInCheck
    } = moveValidationFunctions;
    
    // Get all possible moves for the current player
    const allMoves = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        
        if (piece && piece.color === currentPlayer) {
          let pieceMoves = [];
          
          // Get valid moves based on piece type
          switch (piece.type) {
            case 'pawn':
              pieceMoves = getPawnMoves(board, row, col, currentPlayer);
              break;
            case 'rook':
              pieceMoves = getRookMoves(board, row, col, currentPlayer);
              break;
            case 'knight':
              pieceMoves = getKnightMoves(board, row, col, currentPlayer);
              break;
            case 'bishop':
              pieceMoves = getBishopMoves(board, row, col, currentPlayer);
              break;
            case 'queen':
              pieceMoves = getQueenMoves(board, row, col, currentPlayer);
              break;
            case 'king':
              pieceMoves = getKingMoves(board, row, col, currentPlayer);
              break;
            default:
              pieceMoves = [];
          }
          
          // Filter moves that would leave king in check
          const legalMoves = pieceMoves.filter(move => {
            // Create a copy of the board
            const newBoard = board.map(boardRow => [...boardRow]);
            
            // Simulate the move
            newBoard[move.row][move.col] = piece;
            newBoard[row][col] = null;
            
            // Check if this move would leave king in check
            return !isKingInCheck(newBoard, currentPlayer);
          });
          
          // Add source and piece info to each move
          legalMoves.forEach(move => {
            allMoves.push({
              from: { row, col },
              to: { row: move.row, col: move.col },
              piece
            });
          });
        }
      }
    }
    
    // If no moves are available, return null
    if (allMoves.length === 0) {
      return null;
    }
    
    // Evaluate and select move based on difficulty
    switch (difficulty) {
      case 'easy':
        // Random move with slight preference for captures
        allMoves.forEach(move => {
          const capturedPiece = board[move.to.row][move.to.col];
          move.score = capturedPiece ? PIECE_VALUES[capturedPiece.type] * 2 : 0;
          // Add randomness
          move.score += Math.random() * 10;
        });
        break;
        
      case 'medium':
        // Better evaluation with piece values and position
        allMoves.forEach(move => {
          let score = 0;
          
          // Value capture
          const capturedPiece = board[move.to.row][move.to.col];
          if (capturedPiece) {
            score += PIECE_VALUES[capturedPiece.type] * 2;
          }
          
          // Value center control for important pieces
          if (['knight', 'bishop', 'queen'].includes(move.piece.type)) {
            score += POSITION_VALUES[move.to.row][move.to.col] * 3;
          }
          
          move.score = score + (Math.random() * 3); // Less randomness
        });
        break;
        
      case 'hard':
        // Advanced evaluation
        allMoves.forEach(move => {
          // Create a copy of the board
          const newBoard = board.map(boardRow => [...boardRow]);
          
          // Captured piece value
          const capturedPiece = newBoard[move.to.row][move.to.col];
          let score = capturedPiece ? PIECE_VALUES[capturedPiece.type] * 3 : 0;
          
          // Make the move
          newBoard[move.to.row][move.to.col] = move.piece;
          newBoard[move.from.row][move.from.col] = null;
          
          // Value center control
          score += POSITION_VALUES[move.to.row][move.to.col] * 4;
          
          // Check if move puts opponent in check
          const oppositeColor = currentPlayer === 'white' ? 'black' : 'white';
          if (isKingInCheck(newBoard, oppositeColor)) {
            score += 5;
          }
          
          move.score = score + (Math.random() * 0.5); // Minimal randomness
        });
        break;
        
      default:
        // Default to medium if unknown difficulty
        return getComputerMove(board, currentPlayer, 'medium', moveValidationFunctions);
    }
    
    // Sort by score and pick the best move
    allMoves.sort((a, b) => b.score - a.score);
    return allMoves[0];
  };