import { motion } from 'framer-motion';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';

const StyledOverlay = styled(({ isSelected, ...props }) => (
  <motion.div {...props} />
))<{ isSelected: boolean }>`
  z-index: 1;
  background: rgba(0, 0, 0, 0.75);
  will-change: opacity;
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100vw;
  left: 50%;
  transform: translateX(-50%);
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

const Overlay: FC<OverlayProps> = ({ isSelected }) => (
  <StyledOverlay
    {...{ isSelected }}
    initial={false}
    animate={{ opacity: isSelected ? 1 : 0 }}
    transition={{ duration: 0.2 }}
  >
    <StyledLink to="/cards" />
  </StyledOverlay>
);

export {
  Overlay,
  type OverlayProps,
}
