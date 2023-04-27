import { FC, useContext, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useMatch, useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';

import { PeopleActionType, Person } from 'src/types';
import { Card } from 'src/components';
import { getConnectionCount, PeopleCtx } from 'src/util';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: var(--standard-width);
  position: relative;
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BlurbSection = styled.div`
  color: #bbb;
`;

// const ModeSection = styled.div`
//   color: #aaa;
// `;

const NewPersonButton = styled.button`
  border: unset;
  background-color: unset;
  color: #aaa;
  font-family: inherit;
  cursor: pointer;
  &:hover {
    color: #0095ff;
  }
  &:disabled {
    text-decoration: line-through;
    color: #bbb;
    cursor: default;
  }
`;

const Placeholder = styled.div`
  font-style: italic;
  opacity: 0.4;
  font-size: 16px;
  margin: 40px 20px;s
`;

interface CardsProps {
  hasQuery: boolean;
}

const Cards: FC<CardsProps> = ({ hasQuery }) => {

  const { staleState: people, dispatch } = useContext(PeopleCtx)!;
  const match = useMatch('/cards/:id');
  const navigate = useNavigate();
  const lastCardRef = useRef<HTMLDivElement>(null)

  const onNewPerson = () => {
    const newId = crypto.randomUUID();
    flushSync(() => {
      dispatch({
        type: PeopleActionType.NEW_PERSON,
        payload: { id: newId },
      });
    });
    setTimeout(() => {
      lastCardRef.current!.scrollIntoView({ behavior: 'smooth', block: 'end' });
      navigate(newId);
    });
  };

  const connectionCount = getConnectionCount(people);

  return (
    <Container>
      <TopSection>
        <BlurbSection>{people.length} Card{people.length === 1 ? '' : 's'} · {connectionCount} Connection{connectionCount === 1 ? '' : 's'}</BlurbSection>
        {/* <ModeSection>List | Grid</ModeSection> */}
        <NewPersonButton
          onClick={onNewPerson}
          disabled={hasQuery}
          title={hasQuery ? 'Cannot add while searching' : ''}
        >+ New Person</NewPersonButton>
      </TopSection>
      {people.length > 0
        ? people.map((person: Person, idx: number) =>
          <Card
            key={person.id}
            person={person}
            isSelected={match?.params.id === person.id}
            lastCardRef={idx === people.length - 1 ? lastCardRef : null}
          />
        )
        : hasQuery
          ? <Placeholder>We didn't find anything</Placeholder>
          : <Placeholder>Add a new person!</Placeholder>}
    </Container>
  )
};

export {
  Cards,
  type CardsProps,
};