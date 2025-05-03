// src/components/Board/Board.jsx
import React, { useEffect } from 'react';
import Square from '../Square/Square';
import Piece from '../Piece/Piece';
import { useGame } from '../../context/GameContext';
import { useOnline } from '../../context/OnlineContext';

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
    movePiece,
    setBoard,
    setCurrentPlayer,
    gameStatus
  } = useGame();

  const {
    isOnline,
    playerColor,
    gameStarted,
    waitingForOpponent,
    opponentDisconnected,
    sendOnlineMove,
    remoteMove,
    consumeRemoteMove
  } = useOnline();

  // Consume remote move when received
  useEffect(() => {
    if (remoteMove) {
      // Transform the move format if needed
      const move = {
        from: remoteMove.from,
        to: remoteMove.to,
        promotion: remoteMove.promotion || 'q'
      };
      
      // Apply the move to the board
      const newBoard = board.map(row => [...row]);
      const piece = newBoard[move.from.row][move.from.col];
      const capturedPiece = newBoard[move.to.row][move.to.col];
      
      newBoard[move.to.row][move.to.col] = piece;
      newBoard[move.from.row][move.from.col] = null;
      
      const moveObj = {
        piece,
        from: { row: move.from.row, col: move.from.col },
        to: { row: move.to.row, col: move.to.col },
        captured: capturedPiece
      };
      
      // Update the game state
      setBoard(newBoard);
      movePiece(newBoard, moveObj, capturedPiece);
      
      // Clear the remote move
      consumeRemoteMove();
    }
  }, [remoteMove, consumeRemoteMove, board, setBoard, movePiece]);

  // Generate valid moves for a selected piece
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

    // Filter out moves that would leave the king in check
    return moves.filter(move => {
      const newBoard = board.map(boardRow => [...boardRow]);
      newBoard[move.row][move.col] = piece;
      newBoard[row][col] = null;
      return !isKingInCheck(newBoard, piece.color);
    });
  };

  const handlePieceClick = (position) => {
    const [row, col] = position.split(',').map(Number);
    const piece = board[row][col];

    // In online mode, check if it's player's turn and piece
    if (isOnline) {
      // If waiting for opponent or game not started, don't allow moves
      if (waitingForOpponent || !gameStarted) {
        return;
      }
      
      // Only allow moves for the player's color and on their turn
      if (currentPlayer !== playerColor || piece?.color !== playerColor) {
        return;
      }
    }

    if (piece && piece.color === currentPlayer) {
      const moves = getValidMoves(row, col, piece);
      selectPiece({ row, col, piece }, moves);
    }
  };

  const handleSquareClick = (row, col) => {
    if (!selectedPiece) return;

    // Check if the game is over or waiting for opponent in online mode
    if (isOnline && (waitingForOpponent || !gameStarted || opponentDisconnected || gameStatus !== 'active')) {
      return;
    }

    const isMoveValid = validMoves.some(move => move.row === row && move.col === col);
    if (!isMoveValid) return;

    const newBoard = board.map(boardRow => [...boardRow]);

    const capturedPiece = newBoard[row][col];

    newBoard[row][col] = selectedPiece.piece;
    newBoard[selectedPiece.row][selectedPiece.col] = null;

    const move = {
      piece: selectedPiece.piece,
      from: { row: selectedPiece.row, col: selectedPiece.col },
      to: { row, col },
      captured: capturedPiece
    };

    // In online mode, send the move to the opponent
    if (isOnline) {
      const moveToSend = {
        from: { row: selectedPiece.row, col: selectedPiece.col },
        to: { row, col },
        promotion: 'q' // Default promotion to queen
      };
      
      sendOnlineMove(moveToSend);
    }

    // Update the game state
    movePiece(newBoard, move, capturedPiece);
  };

  const renderBoard = () => {
    const squares = [];

    // Flip the board for black player in online mode
    const shouldFlipBoard = isOnline && playerColor === 'black';

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const displayRow = shouldFlipBoard ? 7 - row : row;
        const displayCol = shouldFlipBoard ? 7 - col : col;

        const isLightSquare = (displayRow + displayCol) % 2 === 0;
        const position = `${row},${col}`;
        const piece = board[row][col];

        const isSelected =
          selectedPiece &&
          selectedPiece.row === row &&
          selectedPiece.col === col;

        const isValidMove = validMoves.some(
          move => move.row === row && move.col === col
        );

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
      {isOnline && (
        <div className="online-indicator">
          {waitingForOpponent ? (
            <span className="waiting">Waiting for opponent to join...</span>
          ) : opponentDisconnected ? (
            <span className="disconnected">Opponent disconnected</span>
          ) : (
            <>
              <span>Playing as: <strong>{playerColor}</strong></span>
              {currentPlayer === playerColor ? 
                <span className="your-turn"> (Your turn)</span> : 
                <span className="opponent-turn"> (Opponent's turn)</span>
              }
            </>
          )}
        </div>
      )}
      <div className="board-container">{renderBoard()}</div>
    </div>
  );
};

export default Board;