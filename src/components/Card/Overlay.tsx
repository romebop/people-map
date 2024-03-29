import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components/macro';

const StyledOverlay = styled.div<{ isSelected: boolean }>`
  z-index: 1;
  background: rgba(0, 0, 0, 0.75);
  will-change: opacity;
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  left: 0;
  opacity: ${({ isSelected }) => isSelected ? 1 : 0};
  pointer-events: ${({ isSelected }) => isSelected ? 'auto' : 'none'};
`;

const StyledLink = styled(Link)`
  display: block;
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  left: 50%;
  transform: translateX(-50%);
`;

interface OverlayProps {
  isSelected: boolean;
} 

const Overlay: FC<OverlayProps> = ({ isSelected }) => {
  const { search } = useLocation();
  return (
    <StyledOverlay {...{ isSelected }}>
      <StyledLink to={`/cards${search}`} />
    </StyledOverlay>
  );
};

export {
  Overlay,
  type OverlayProps,
};
