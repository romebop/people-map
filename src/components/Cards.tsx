import { FC, useContext, useRef } from 'react';
import { flushSync } from 'react-dom';
import Masonry from 'react-masonry-css'
import { useMatch, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components/macro';

import { PeopleActionType, Person } from 'src/types';
import { Card } from 'src/components';
import { getConnectionCount, getDemoData, PeopleCtx } from 'src/util';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
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
  margin-left: -${gapSize}px;
  width: auto;
  & .masonry-grid-column {
    width: var(--standard-width) !important;
    padding-left: ${gapSize}px;
    background-clip: padding-box;
  }
`;

const Placeholder = styled.div`
  font-size: 14px;
  margin-top: 80px;
  color: #bbb;
`;

const DemoDataText = styled.button`
  border: unset;
  background-color: #0095ff;
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 3px solid #0066b3;
  margin-left: 2px;
  transition: all 0.1s ease-in-out;
  &:hover {
    background-color: #00a5ff;
  }
  &:active {
    transform: translateY(2px);
    border-bottom-width: 1px;
  }
`;

interface CardsProps {
  hasQuery: boolean;
  layout: 'list' | 'grid';
}

const Cards: FC<CardsProps> = ({ hasQuery, layout }) => {

  const { sortedFilteredPeople: people, dispatch } = useContext(PeopleCtx)!;
  const match = useMatch('/cards/:id');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lastCardRef = useRef<HTMLDivElement>(null);

  const scrollToLastCard = () => {
    if (!lastCardRef.current) return;
    lastCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const onNewPerson = () => {
    const newId = crypto.randomUUID();
    flushSync(() => {
      dispatch({
        type: PeopleActionType.NEW_PERSON,
        payload: { id: newId },
      });
    });
    setTimeout(() => {
      scrollToLastCard();
      navigate(`${newId}${searchParams.toString() === '' ? '' : '?'}${searchParams.toString()}`);
    });
  };

  const communityCount = people.map(p => p.communities).flat().filter((c, i, a) => a.indexOf(c) === i).length;
  const connectionCount = getConnectionCount(people);
  
  const gridBreakpointCols = {
    default: 3,
    1900: 2,
    1260: 1,
  };

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
              {...{ person, gapSize, scrollToLastCard }}
              key={person.id}
              isSelected={match?.params.id === person.id}
              lastCardRef={idx === people.length - 1 ? lastCardRef : null}
            />
          )
          : hasQuery
            ? <Placeholder>We didn't find anything</Placeholder>
            : <Placeholder>
                <span>Add a new person or </span>
                <DemoDataText onClick={() => dispatch({
                  type: PeopleActionType.SET_PEOPLE,
                  payload: { newPeople: getDemoData() },
                })}>load demo data</DemoDataText>
                {/* <DemoDataText onClick={() => {
                  console.log(generateDemoData());
                }}>generate demo data</DemoDataText> */}
              </Placeholder>}
      </CardsContainer>
    </Container>
  )
};

export {
  Cards,
  type CardsProps,
};