import {
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useMatch } from 'react-router-dom';
import styled from 'styled-components/macro';

import { Connection, PeopleActionType, Person } from 'src/types';
import { Card } from 'src/components';
import { PeopleCtx } from 'src/util';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: var(--standard-width);
`;

const Placeholder = styled.div`
  font-style: italic;
  opacity: 0.4;
  font-size: 16px;
  margin: 40px 20px;
`;

const AddPersonLine = styled.form`
  display: flex;
  margin-top: 40px;
  width: var(--standard-width);
`;

const AddPersonInput = styled.input`
  flex-grow: 1;
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background-color: #fff;
  border-radius: 4px;
  padding: 8px 18px;
  margin-right: 8px;
  &:focus {
    border: 1px solid var(--highlight-color);
  }
  &::placeholder {
    opacity: 0.4;
  }
`;

const AddPersonButton = styled.button`
  background-color: var(--highlight-color);
  color: #fff;
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.4);
  border: 1px solid transparent;
  font-weight: 500;
  font-family: inherit;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding: 8px 14px;
  cursor: pointer;
  word-spacing: 2px;
  &[disabled] {
    background-color: #d0d0d0;
    cursor: default;
  }
  &:active {
    box-shadow: unset;
    background-color: var(--active-color);
  }
`;

interface CardsProps {
  hasQuery: boolean;
}

const Cards: FC<CardsProps> = ({ hasQuery }) => {

  const match = useMatch('/cards/:id');

  const [personInputValue, setPersonInputValue] = useState<string>('');
  const [shouldScroll, setShouldScroll] = useState<boolean>(false);
  const { state: people, dispatch } = useContext(PeopleCtx)!;

  useEffect(() => {
    if (!shouldScroll) return;
    addPersonFormRef.current!.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setShouldScroll(false);
  }, [shouldScroll])

  const addPersonFormRef = useRef<HTMLFormElement>(null);

  const onAddPerson = () => {
    const name = personInputValue.trim();
    if (name) {
      dispatch({
        type: PeopleActionType.ADD_PERSON,
        payload: { name },
      });
      setPersonInputValue('');
      setShouldScroll(true);
    }
  };

  return (
    <>
      <Container>
        {people.length > 0
          ? people.map((person: Person) =>
            <Card
              key={person.id}
              person={person}
              isSelected={match?.params.id === person.id}
            />
          )
          : hasQuery
            ? <Placeholder>We didn't find anything</Placeholder>
            : <Placeholder>Add a new person!</Placeholder>
        }
      </Container>
      {/* <AddPersonLine ref={addPersonFormRef}>
        <AddPersonInput
          type="text"
          placeholder="Enter a name"
          value={personInputValue}
          onChange={e => setPersonInputValue(e.target.value)}
        />
        <AddPersonButton 
          type="submit"
          onClick={onAddPerson}
          disabled={personInputValue.trim().length === 0}
          title="Add Person"
        >
          + Person
        </AddPersonButton>
      </AddPersonLine> */}
    </>
  )
};

export {
  Cards,
  type CardsProps,
};