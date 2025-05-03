// src/context/GameContext.js - updated with online integration
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { initialBoardSetup } from '../utils/boardSetup';
import { useOnline } from './OnlineContext';
import { 
  getPawnMoves, 
  getRookMoves, 
  getKnightMoves, 
  getBishopMoves, 
  getQueenMoves, 
  getKingMoves,
  isKingInCheck, 
  isCheckmate, 
  isStalemate 
} from '../utils/moveValidation';
import { getComputerMove } from '../services/chessAI';

// Initial state
const initialState = {
  board: initialBoardSetup(),
  currentPlayer: 'white',
  selectedPiece: null,
  validMoves: [],
  moveHistory: [],
  capturedPieces: {
    white: [],
    black: []
  },
  gameStatus: 'active', // active, check, checkmate, stalemate
  message: '',
  gameMode: 'human', // 'human', 'computer', or 'online'
  difficulty: 'medium', // 'easy', 'medium', 'hard'
  computerColor: 'black', // The color the computer plays
  isComputerThinking: false
};

// Actions
const actions = {
  SELECT_PIECE: 'SELECT_PIECE',
  MOVE_PIECE: 'MOVE_PIECE',
  RESET_GAME: 'RESET_GAME',
  UNDO_MOVE: 'UNDO_MOVE',
  SET_GAME_OPTIONS: 'SET_GAME_OPTIONS',
  SET_BOARD: 'SET_BOARD'
};

// Reducer function
const gameReducer = (state, action) => {
  switch (action.type) {
    case actions.SELECT_PIECE:
      return {
        ...state,
        selectedPiece: action.payload.piece,
        validMoves: action.payload.validMoves
      };
      
    case actions.MOVE_PIECE:
      const { newBoard, capturedPiece, move } = action.payload;
      const nextPlayer = state.currentPlayer === 'white' ? 'black' : 'white';
      
      // Update captured pieces if a piece was captured
      let newCapturedPieces = { ...state.capturedPieces };
      if (capturedPiece) {
        newCapturedPieces = {
          ...state.capturedPieces,
          [state.currentPlayer]: [
            ...state.capturedPieces[state.currentPlayer],
            capturedPiece
          ]
        };
      }
      
      // Check game status
      let gameStatus = 'active';
      let message = '';
      
      if (isCheckmate(newBoard, nextPlayer)) {
        gameStatus = 'checkmate';
        message = `Checkmate! ${state.currentPlayer} wins!`;
      } else if (isStalemate(newBoard, nextPlayer)) {
        gameStatus = 'stalemate';
        message = 'Stalemate! The game is a draw.';
      } else if (isKingInCheck(newBoard, nextPlayer)) {
        gameStatus = 'check';
        message = `${nextPlayer} is in check!`;
      }
      
      return {
        ...state,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPiece: null,
        validMoves: [],
        moveHistory: [...state.moveHistory, move],
        capturedPieces: newCapturedPieces,
        gameStatus,
        message,
        isComputerThinking: false
      };
    
    case actions.SET_BOARD:
      return {
        ...state,
        board: action.payload.board,
        currentPlayer: action.payload.currentPlayer || state.currentPlayer
      };
      
    case actions.RESET_GAME:
      return {
        ...initialState,
        gameMode: state.gameMode,
        difficulty: state.difficulty,
        computerColor: state.computerColor
      };
      
    case actions.UNDO_MOVE:
      if (state.moveHistory.length === 0) {
        return state;
      }
      
      // Get previous move
      const lastMove = state.moveHistory[state.moveHistory.length - 1];
      const newHistory = state.moveHistory.slice(0, -1);
      
      // Create new board
      const prevBoard = state.board.map(row => [...row]);
      
      // Undo the move
      prevBoard[lastMove.from.row][lastMove.from.col] = lastMove.piece;
      prevBoard[lastMove.to.row][lastMove.to.col] = lastMove.captured;
      
      // Update captured pieces if a piece was uncaptured
      let updatedCapturedPieces = { ...state.capturedPieces };
      if (lastMove.captured) {
        const oppositeColor = state.currentPlayer;
        updatedCapturedPieces[oppositeColor] = updatedCapturedPieces[oppositeColor].slice(0, -1);
      }
      
      return {
        ...state,
        board: prevBoard,
        currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
        moveHistory: newHistory,
        capturedPieces: updatedCapturedPieces,
        gameStatus: 'active',
        message: ''
      };
    
    case actions.SET_GAME_OPTIONS:
      return {
        ...state,
        ...action.payload
      };
      
    default:
      return state;
  }
};

// Create context
const GameContext = createContext();

// Provider component
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { isOnline, playerColor, gameStarted, opponentDisconnected } = useOnline();
  
  // Update game mode based on online status
  useEffect(() => {
    if (isOnline) {
      dispatch({
        type: actions.SET_GAME_OPTIONS,
        payload: { gameMode: 'online' }
      });
    }
  }, [isOnline]);
  
  // Handle game over when opponent disconnects
  useEffect(() => {
    if (opponentDisconnected && state.gameStatus === 'active') {
      dispatch({
        type: actions.SET_GAME_OPTIONS,
        payload: { 
          gameStatus: 'disconnected',
          message: 'Opponent disconnected. You win!'
        }
      });
    }
  }, [opponentDisconnected, state.gameStatus]);
  
  // Computer Move Logic
  useEffect(() => {
    // Check if it's computer's turn
    if (
      state.gameMode === 'computer' && 
      state.currentPlayer === state.computerColor &&
      state.gameStatus === 'active'
    ) {
      // Set thinking state
      dispatch({
        type: actions.SET_GAME_OPTIONS,
        payload: { isComputerThinking: true }
      });
      
      // Use setTimeout to give a slight delay
      const thinkingTime = 
        state.difficulty === 'easy' ? 500 : 
        state.difficulty === 'medium' ? 1000 : 1500;
      
      const timerId = setTimeout(() => {
        // Get move validation functions
        const moveValidationFunctions = {
          getPawnMoves,
          getRookMoves,
          getKnightMoves,
          getBishopMoves,
          getQueenMoves,
          getKingMoves,
          isKingInCheck
        };
        
        // Get computer move
        const computerMove = getComputerMove(
          state.board,
          state.currentPlayer,
          state.difficulty,
          moveValidationFunctions
        );
        
        if (computerMove) {
          // Determine if a piece is captured
          const capturedPiece = state.board[computerMove.to.row][computerMove.to.col];
          
          // Create a new board
          const newBoard = state.board.map(row => [...row]);
          
          // Execute the move
          newBoard[computerMove.to.row][computerMove.to.col] = computerMove.piece;
          newBoard[computerMove.from.row][computerMove.from.col] = null;
          
          // Create move object for history
          const move = {
            piece: computerMove.piece,
            from: computerMove.from,
            to: computerMove.to,
            captured: capturedPiece
          };
          
          // Dispatch the move
          dispatch({
            type: actions.MOVE_PIECE,
            payload: { newBoard, capturedPiece, move }
          });
        }
      }, thinkingTime);
      
      // Cleanup function
      return () => clearTimeout(timerId);
    }
  }, [state.gameMode, state.currentPlayer, state.computerColor, state.difficulty, state.gameStatus, state.board]);
  
  const selectPiece = (piece, validMoves) => {
    dispatch({
      type: actions.SELECT_PIECE,
      payload: { piece, validMoves }
    });
  };
  
  const movePiece = (newBoard, move, capturedPiece) => {
    dispatch({
      type: actions.MOVE_PIECE,
      payload: { newBoard, move, capturedPiece }
    });
  };
  
  const setBoard = (newBoard, currentPlayer) => {
    dispatch({
      type: actions.SET_BOARD,
      payload: { board: newBoard, currentPlayer }
    });
  };
  
  const resetGame = () => {
    dispatch({ type: actions.RESET_GAME });
  };
  
  const undoMove = () => {
    dispatch({ type: actions.UNDO_MOVE });
  };
  
  const setGameOptions = (options) => {
    dispatch({
      type: actions.SET_GAME_OPTIONS,
      payload: options
    });
  };
  
  // Convert move to algebraic notation
  const moveToNotation = (move) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    const fromFile = files[move.from.col];
    const fromRank = ranks[move.from.row];
    const toFile = files[move.to.col];
    const toRank = ranks[move.to.row];
    
    let notation = '';
    
    if (move.piece.type !== 'pawn') {
      notation += move.piece.type.charAt(0).toUpperCase();
    }
    
    notation += `${fromFile}${fromRank}-${toFile}${toRank}`;
    
    if (move.captured) {
      notation += ' x';
    }
    
    return notation;
  };
  
  const value = {
    ...state,
    selectPiece,
    movePiece,
    resetGame,
    undoMove,
    setGameOptions,
    moveToNotation,
    setBoard
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook for using the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};