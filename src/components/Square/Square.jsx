// src/components/Square/Square.jsx - update the Square component
import React from 'react';
import './Square.css';

const Square = ({ isLight, position, children, isSelected, isValidMove, onClick }) => {
  let squareClass = isLight ? 'square light-square' : 'square dark-square';
  
  if (isSelected) {
    squareClass += ' selected-square';
  }
  
  if (isValidMove) {
    squareClass += ' valid-move-square';
  }
  
  return (
    <div 
      className={squareClass} 
      data-position={position}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Square;