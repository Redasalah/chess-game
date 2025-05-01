// src/components/Board/Board.jsx

import React, { useEffect } from 'react';
import Square from '../Square/Square';
import Piece from '../Piece/Piece';
import { useGame } from '../../context/GameContext';
import { useSimpleOnline } from '../../context/SimpleOnlineContext';

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
    setCurrentPlayer
  } = useGame();

  const {
    isOnline,
    gameData,
    playerColor,
    sendOnlineMove,
    remoteMove,
    consumeRemoteMove
  } = useSimpleOnline();

  // Sync board with online game data when it changes
  useEffect(() => {
    if (isOnline && gameData && gameData.board) {
      setBoard(gameData.board);
      setCurrentPlayer(gameData.currentPlayer);
    }
  }, [isOnline, gameData, setBoard, setCurrentPlayer]);

  // Consume remote move
  useEffect(() => {
    if (remoteMove) {
      setBoard(remoteMove.board);
      setCurrentPlayer(remoteMove.currentPlayer);
      consumeRemoteMove();
    }
  }, [remoteMove, consumeRemoteMove, setBoard, setCurrentPlayer]);

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
      const newBoard = board.map(row => [...row]);
      newBoard[move.row][move.col] = piece;
      newBoard[row][col] = null;
      return !isKingInCheck(newBoard, piece.color);
    });
  };

  const handlePieceClick = (position) => {
    const [row, col] = position.split(',').map(Number);
    const piece = board[row][col];

    // In online mode, restrict move to your turn and pieces
    if (isOnline && (currentPlayer !== playerColor || piece?.color !== playerColor)) {
      return;
    }

    if (piece && piece.color === currentPlayer) {
      const moves = getValidMoves(row, col, piece);
      selectPiece({ row, col, piece }, moves);
    }
  };

  const handleSquareClick = (row, col) => {
    if (!selectedPiece) return;

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

    const nextPlayer = currentPlayer === 'white' ? 'black' : 'white';

    if (isOnline) {
      sendOnlineMove(newBoard, nextPlayer);
    }

    movePiece(newBoard, move, capturedPiece);
  };

  const renderBoard = () => {
    const squares = [];

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
          Playing as: {playerColor}
          {currentPlayer === playerColor ? ' (Your turn)' : " (Opponent's turn)"}
        </div>
      )}
      <div className="board-container">{renderBoard()}</div>
    </div>
  );
};

export default Board;
