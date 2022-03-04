import { FC, useState } from 'react';

import './Chip.scss';

interface ChipProps {
  name: string;
} 

const Chip: FC<ChipProps> = ({ name }: ChipProps) => {

  const [isFocused, setisFocused] = useState(false);
  const [isActivated, setisActivated] = useState(false);

  const onPersonClick = () => {
    console.log('onPersonClick trigger!');
    if (!isActivated) return;
    console.log('--> nav to person card')
  };

  const onDeleteClick = () => {
    console.log('onDeleteClick trigger!');
    console.log('❌ clicked');
  };

  return (
    <div
      className='chip'
      tabIndex={0}
      onFocus={() => {
        console.log('onFocus trigger!');
        if (isFocused) setisActivated(true);
        setisFocused(true);
      }}
      onBlur={() => {
        console.log('onBlur Trigger!');
        setisFocused(false);
        setisActivated(false);
      }}
    >
      <div
        className='chip-text'
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