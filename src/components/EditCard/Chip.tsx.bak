import { FC, useContext, useState } from 'react';
import styled from 'styled-components/macro';

import { Connection, PeopleActionType } from 'src/types';
import { PeopleCtx } from 'src/util';

const Container = styled.div<{ isActivated: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid ${({ isActivated }) => isActivated ? '#0095ff5c' : '#ccc'};
  box-sizing: border-box;
  border-radius: 4px;
  user-select: none;
  background-color: ${({ isActivated }) => isActivated ? '#0095ff08' : 'transparent'};
  &:active {
    background-color: var(--gray-highlight-color);
  }
`;

const ChipText = styled.div<{ isActivated: boolean }>`
  color: ${({ isActivated }) => isActivated ? '#0095ff' : '#666'};
  font-size: 12px;
  padding: 4px ${({ isActivated }) => isActivated ? '2px' : '8px'} 6px 8px;
  cursor: pointer;
`;

const DeleteChipButton = styled.div<{ isActivated: boolean}>`
  display: ${({ isActivated }) => isActivated ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  align-self: stretch;
  padding: 0 8px 0 2px;
  cursor: pointer;
`;

const DeleteChipIcon = styled.svg`
  width: 12px;
  height: 12px;
  stroke: #0095ff;
`;

interface ChipProps {
  personId: string;
  connection: Connection;
  setSearchInputValue: (name: string) => void;
} 

const Chip: FC<ChipProps> = ({ personId, connection, setSearchInputValue }) => {

  const [isActivated, setisActivated] = useState<boolean>(false);
  const { dispatch } = useContext(PeopleCtx)!;

  return (
    <Container
      {...{ isActivated }}
      tabIndex={0}
      onClick={() => setisActivated(true)}
      onBlur={() => setisActivated(false)}
    >
      <ChipText
        {...{ isActivated }}
        title='Search connection'
        onClick={() => isActivated && setSearchInputValue(connection.name)}
      >{connection.name}</ChipText>
      <DeleteChipButton
        {...{ isActivated }}
        title='Delete connection'
        onClick={() => dispatch({
          type: PeopleActionType.DELETE_CONNECTION,
          payload: { personId, connectionId: connection.id },
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
