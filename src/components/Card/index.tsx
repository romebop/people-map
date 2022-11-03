import { FC } from 'react';
import styled from 'styled-components/macro';

import { Overlay } from './Overlay';
import { EditContent } from './EditContent';
import { ViewContent } from './ViewContent';
import { Person } from 'src/types';

const Container = styled.div`
  position: relative;
  &:not(:first-child) {
    margin-top: 30px;
  }
`;

interface CardProps {
  person: Person;
  isSelected: boolean;
}

const transitionDuration = 0.2;
const Card: FC<CardProps> = ({ person, isSelected }) => {
  return (
    <Container>
      <Overlay {...{ isSelected, transitionDuration }} />
      <ViewContent
        {...{ person, transitionDuration }}
        isShadow
      />
      {isSelected
        ? <EditContent {...{ person, transitionDuration }} /> 
        : <ViewContent
            {...{ person, transitionDuration }}
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
