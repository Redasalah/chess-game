// src/services/stockfishService.js

import { Chess } from 'chess.js'; // We'll need chess.js for FEN notation

class StockfishService {
  constructor() {
    this.stockfish = null;
    this.initialized = false;
    this.onMessage = null;
    this.depth = 10; // Default depth
  }

  init() {
    if (this.initialized) return Promise.resolve();
    
    return new Promise((resolve) => {
      import('stockfish').then(Stockfish => {
        this.stockfish = Stockfish.default();
        
        this.stockfish.onmessage = (event) => {
          if (this.onMessage) {
            this.onMessage(event);
          }
        };
        
        this.sendCommand('uci');
        this.sendCommand('isready');
        
        this.initialized = true;
        resolve();
      });
    });
  }

  setDifficulty(level) {
    switch(level) {
      case 'easy':
        this.depth = 5;
        this.sendCommand('setoption name Skill Level value 5');
        break;
      case 'medium':
        this.depth = 10;
        this.sendCommand('setoption name Skill Level value 10');
        break;
      case 'hard':
        this.depth = 15;
        this.sendCommand('setoption name Skill Level value 20');
        break;
      default:
        this.depth = 10;
        this.sendCommand('setoption name Skill Level value 10');
    }
  }

  sendCommand(command) {
    if (this.stockfish && this.initialized) {
      this.stockfish.postMessage(command);
    }
  }

  getBestMove(fen, onBestMove) {
    this.init().then(() => {
      this.onMessage = (event) => {
        const message = event.data || event;
        
        if (message.startsWith('bestmove')) {
          const moveRegex = /bestmove\s+(\w+)/;
          const match = moveRegex.exec(message);
          
          if (match && match[1]) {
            const bestMove = match[1];
            onBestMove(bestMove);
          }
        }
      };
      
      this.sendCommand('position fen ' + fen);
      this.sendCommand(`go depth ${this.depth}`);
    });
  }

  // Convert our board representation to FEN notation
  static boardToFEN(board, currentPlayer, castlingRights = 'KQkq') {
    // Create a chess.js instance
    const chess = new Chess();
    chess.clear();
    
    // Place pieces on the board
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const square = String.fromCharCode(97 + col) + (8 - row);
          const pieceType = piece.type.charAt(0).toUpperCase();
          const pieceColor = piece.color === 'white' ? pieceType : pieceType.toLowerCase();
          
          chess.put({ type: piece.type, color: piece.color === 'white' ? 'w' : 'b' }, square);
        }
      }
    }
    
    // Set turn
    chess.setTurn(currentPlayer === 'white' ? 'w' : 'b');
    
    return chess.fen();
  }

  // Convert UCI move notation to our move format
  static uciToMove(uciMove, board) {
    // UCI format is like "e2e4" (source square to target square)
    const files = 'abcdefgh';
    const ranks = '87654321';
    
    const sourceCol = files.indexOf(uciMove.charAt(0));
    const sourceRow = ranks.indexOf(uciMove.charAt(1));
    const targetCol = files.indexOf(uciMove.charAt(2));
    const targetRow = ranks.indexOf(uciMove.charAt(3));
    
    // Handle promotion
    let promotion = null;
    if (uciMove.length === 5) {
      promotion = uciMove.charAt(4);
    }
    
    const piece = board[sourceRow][sourceCol];
    const capturedPiece = board[targetRow][targetCol];
    
    return {
      from: { row: sourceRow, col: sourceCol },
      to: { row: targetRow, col: targetCol },
      piece,
      captured: capturedPiece,
      promotion
    };
  }

  destroy() {
    if (this.stockfish) {
      this.stockfish.terminate();
      this.stockfish = null;
      this.initialized = false;
    }
  }
}

const stockfishService = new StockfishService();
export default stockfishService;