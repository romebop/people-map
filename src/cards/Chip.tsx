import { FC, useState } from 'react';

import './Chip.scss';

interface ChipProps {
  name: string;
} 

const Chip: FC<ChipProps> = ({ name }: ChipProps) => {

  const [isActivated, setisActivated] = useState<boolean>(false);

  const onPersonClick = () => {
    if (!isActivated) return;
    console.log('--> nav to person card')
  };

  const onDeleteClick = () => {
    console.log('❌ clicked');
  };

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
        onClick={onPersonClick}
      >{name}</div>
      <div 
        className='delete-chip-button'
        title='Delete connection'
        onClick={onDeleteClick}
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