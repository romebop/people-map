import { FC, useContext } from 'react';
import styled from 'styled-components/macro';

import { PeopleActionType } from 'src/types';
import { getNameById, PeopleCtx } from 'src/util';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #ccc;
  box-sizing: border-box;
  border-radius: 4px;
  user-select: none;
  background-color: transparent;
  height: 28px;
  &:hover {
    border: 1px solid #0095ff5c;
    background-color: #0095ff08;
  }
`;

const ChipText = styled.div`
  color: #666;
  font-size: 12px;
  padding: 2px 0px 2px 8px;
  cursor: pointer;
  ${Container}:hover & {
    color: #0095ff;
  }
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
`;

interface ChipProps {
  personId: string;
  connectionId: string;
} 

const Chip: FC<ChipProps> = ({ personId, connectionId }) => {

  const { staleState, dispatch } = useContext(PeopleCtx)!;
  const connectionName = getNameById(staleState, connectionId);
  const displayName = connectionName.trim() === '' ? '（・⊝・ ∞）' : connectionName;

  return (
    <Container tabIndex={0}>
      <ChipText>{displayName}</ChipText>
      <DeleteChipButton
        title='Delete connection'
        onClick={() => dispatch({
          type: PeopleActionType.DELETE_CONNECTION,
          payload: { personId, connectionId },
        })}
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
};

export {
  Chip,
  type ChipProps,
};
