import { FC, useContext, useRef } from 'react';
import { flushSync } from 'react-dom';
import Masonry from 'react-masonry-css'
import { useMatch, useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';

import { PeopleActionType, Person } from 'src/types';
import { Card } from 'src/components';
import { getConnectionCount, PeopleCtx } from 'src/util';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: var(--standard-width);
`;

const BlurbSection = styled.div`
  color: #bbb;
`;

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

const gapSize = 20;
const CardsContainer = styled(Masonry)`
  margin-top: 20px;

  display: flex;
  margin-left: -${gapSize}px; /* gutter size offset */
  width: auto;

  & .masonry-grid-column {
    width: var(--standard-width) !important;
    padding-left: ${gapSize}px;
    background-clip: padding-box;
  }
`;

const Placeholder = styled.div`
  font-style: italic;
  opacity: 0.4;
  font-size: 16px;
  margin: 40px 20px;
`;

interface CardsProps {
  hasQuery: boolean;
  layout: 'list' | 'grid';
}

const Cards: FC<CardsProps> = ({ hasQuery, layout }) => {

  const { sortedFilteredPeople: people, dispatch } = useContext(PeopleCtx)!;
  const match = useMatch('/cards/:id');
  const navigate = useNavigate();
  const lastCardRef = useRef<HTMLDivElement>(null);

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

  const communityCount = people.map(p => p.communities).flat().filter((c, i, a) => a.indexOf(c) === i).length;
  const connectionCount = getConnectionCount(people);
  
  const gridBreakpointCols = {
    default: 3,
    1900: 2,
    1260: 1,
  }

  return (
    <Container>
      <TopSection>
        <BlurbSection>{people.length} {people.length === 1 ? 'Person' : 'People'} · {communityCount} {communityCount === 1 ? 'Community' : 'Communities'} · {connectionCount} Connection{connectionCount === 1 ? '' : 's'}</BlurbSection>
        <NewPersonButton
          onClick={onNewPerson}
          disabled={hasQuery}
          title={hasQuery ? 'Cannot add while searching' : ''}
        >+ New Person</NewPersonButton>
      </TopSection>
      <CardsContainer
        breakpointCols={layout === 'grid' ? gridBreakpointCols : 1}
        className='masonry-grid'
        columnClassName='masonry-grid-column'
      >
        {people.length > 0
          ? people.map((person: Person, idx: number) =>
            <Card
              {...{ gapSize }}
              key={person.id}
              person={person}
              isSelected={match?.params.id === person.id}
              lastCardRef={idx === people.length - 1 ? lastCardRef : null}
            />
          )
          : hasQuery
            ? <Placeholder>We didn't find anything</Placeholder>
            : <Placeholder>Add a new person!</Placeholder>}
      </CardsContainer>
    </Container>
  )
};

export {
  Cards,
  type CardsProps,
};