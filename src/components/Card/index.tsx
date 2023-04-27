import { FC, RefObject, useContext } from 'react';
import styled from 'styled-components/macro';

import { Overlay } from './Overlay';
import { EditContent } from './EditContent';
import { ViewContent } from './ViewContent';
import { Person } from 'src/types';
import { PeopleCtx } from 'src/util';

const Container = styled.div`
  position: relative;
  background-color: #0095ff12;
  border-radius: 4px;
  &:not(:first-child) {
    margin-top: 20px;
  }
`;

interface CardProps {
  person: Person;
  isSelected: boolean;
  lastCardRef: RefObject<HTMLDivElement> | null;
}

const Card: FC<CardProps> = ({ person, isSelected, lastCardRef }) => {

  const { state: people } = useContext(PeopleCtx)!;
  const livePerson = people.find(p => p.id === person.id)!;

  return (
    <Container>
      <Overlay {...{ isSelected }} />
      <ViewContent
        {...{ person }}
        lastCardRef={null}
        isShadow
      />
      {isSelected
        ? <EditContent {...{ person: livePerson }} /> 
        : <ViewContent
          {...{ person, lastCardRef }}
            isShadow={false}
          />
      }
    </Container>
  )
};

export {
  Card,
  type CardProps,
};
