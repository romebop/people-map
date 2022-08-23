import { Dispatch, FC } from 'react';

import { Connection, Person, PeopleAction } from 'src/types';
import { EditCard, Overlay, ViewCard } from 'src/components';

interface CardProps {
  person: Person;
  allConnections: Connection[];
  setSearchInputValue: (name: string) => void;
  peopleDispatch: Dispatch<PeopleAction>;
  isSelected: boolean;
}

const Card: FC<CardProps> = ({ person, allConnections, setSearchInputValue, peopleDispatch, isSelected }) => {
  return (
    <>
      <Overlay {...{ isSelected }}></Overlay>
      {isSelected
        ? <EditCard {...{ person, allConnections, setSearchInputValue, peopleDispatch }}></EditCard>
        : <ViewCard {...{ person }}></ViewCard>
      }
    </>
  )
}

export {
  Card,
  type CardProps,
}
