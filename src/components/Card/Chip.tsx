import { FC } from 'react';
import styled from 'styled-components/macro';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #666;
  box-sizing: border-box;
  border-radius: 3px;
  background-color: transparent;
  height: 28px;
  &:hover {
    border: 1px solid #0095ff;
    background-color: #0095ff08;
  };
  transition: all 0.1s ease-in;
`;

const ChipText = styled.div`
  color: #666;
  font-size: 12px;
  padding: 2px 0px 2px 8px;
  ${Container}:hover & {
    color: #0095ff;
  }
  transition: all 0.1s ease-in;
`;

const DeleteChipButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  padding: 0 6px 0 4px;
  cursor: pointer;
`;

const DeleteChipIcon = styled.svg`
  width: 12px;
  height: 12px;
  stroke: #666;
  ${Container}:hover & {
    stroke: #0095ff;
  }
  transition: all 0.1s ease-in;
`;

interface ChipProps {
  text: string;
  onDelete: () => void;
  deleteTitle: string;
} 

const Chip: FC<ChipProps> = ({ text, onDelete, deleteTitle }) => (
  <Container tabIndex={0}>
    <ChipText>{text}</ChipText>
    <DeleteChipButton
      onClick={onDelete}
      title={deleteTitle}
    >
      <DeleteChipIcon
        fill='none'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M6 18L18 6M6 6l12 12'
        />
      </DeleteChipIcon>
    </DeleteChipButton>
  </Container>
);

export {
  Chip,
  type ChipProps,
};
