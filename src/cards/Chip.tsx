import { Dispatch, FC, useState } from 'react';

import { PeopleAction, PeopleActionType } from 'src/App';
import { Connection } from 'src/types';

import './Chip.scss';

interface ChipProps {
  personId: string;
  connection: Connection;
  setSearchInputValue: (name: string) => void;
  peopleDispatch: Dispatch<PeopleAction>;
} 

const Chip: FC<ChipProps> = ({ personId, connection, setSearchInputValue, peopleDispatch }: ChipProps) => {

  const [isActivated, setisActivated] = useState<boolean>(false);

  return (
    <div
      className={`chip ${isActivated ? 'activated' : ''}`}
      tabIndex={0}
      onClick={() => setisActivated(true)}
      onBlur={() => setisActivated(false)}
    >
      <div
        className='chip-text'
        title='Search connection'
        onClick={() => {
          if (!isActivated) return;
          setSearchInputValue(connection.name);
        }}
      >{connection.name}</div>
      <div 
        className='delete-chip-button'
        title='Delete connection'
        onClick={() => peopleDispatch({
          type: PeopleActionType.DELETE_CONNECTION,
          payload: { personId, connectionId: connection.id },
        })}
      >
        <svg
          fill='none'
          viewBox='0 0 24 24'
          className='delete-chip-icon'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </div>
    </div>
  );
}

export { Chip };