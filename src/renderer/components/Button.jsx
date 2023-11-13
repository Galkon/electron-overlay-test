import React from 'react';
import styled from 'styled-components';

// Styled button component
const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  font-weight: 500; // Medium font weight
  font-size: 15px;
  color: white;
  text-shadow: 1px 1px 0 black;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-family: 'Inter', sans-serif;

  &:hover {
    border-color: rgba(255, 255, 255, 0.32);
    background-color: rgba(255, 255, 255, 0.16);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.04);
  }
  
  ${({$disabled}) => $disabled ? 'pointer-events: none; opacity: 0.35;' : ''}
`;

const Button = ({ label, children, onClick, disabled }) => {
  return (
    <StyledButton onClick={onClick} $disabled={disabled}>
      {children ?? label}
    </StyledButton>
  )
};

export default Button;
