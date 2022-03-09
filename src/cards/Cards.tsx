import {
  Dispatch,
  FC,
  useEffect,
  useRef,
  useState,
} from 'react';

import { PeopleAction, PeopleActionType } from '../App';
import { Connection, Person } from '../types';
import { PersonCard } from '.';

import './Cards.scss';

interface CardsProps {
  people: Person[];
  allConnections: Connection[];
  hasQuery: boolean;
  setSearchInputValue: (name: string) => void;
  peopleDispatch: Dispatch<PeopleAction>;
} 

const Cards: FC<CardsProps> = ({ people, allConnections, hasQuery, setSearchInputValue, peopleDispatch }: CardsProps) => {

  const [personInputValue, setPersonInputValue] = useState<string>('');
  const [shouldScroll, setShouldScroll] = useState<boolean>(false);

  useEffect(() => {
    if (!shouldScroll) return;
    addPersonFormRef.current!.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setShouldScroll(false);
  }, [shouldScroll])

  const addPersonFormRef = useRef<HTMLFormElement>(null);

  const onAddPerson = () => {
    const name = personInputValue.trim();
    if (name) {
      peopleDispatch({
        type: PeopleActionType.ADD_PERSON,
        payload: { name },
      });
      setPersonInputValue('');
      setShouldScroll(true);
    }
  };

  return (
    <>
      <div id="person-cards-container">
        {people.length > 0
          ? people.map((person: Person) => {
            return <PersonCard
              key={person.id}
              person={person}
              allConnections={allConnections}
              setSearchInputValue={setSearchInputValue}
              peopleDispatch={peopleDispatch}
            />
          })
          : hasQuery
            ? <div className="no-people-placeholder">We didn't find anything</div>
            : <div className="no-people-placeholder">Add a new person!</div>
        }
      </div>
      <form
        ref={addPersonFormRef}
        id="add-person-line"
      >
        <input
          id="add-person-input"
          type="text"
          placeholder="Enter a name"
          value={personInputValue}
          onChange={e => setPersonInputValue(e.target.value)}
        />
        <button 
          id="add-person-button"
          type="submit"
          onClick={onAddPerson}
          disabled={personInputValue.trim().length === 0}
          title="Add Person"
        >+ Person</button>
      </form>
    </>
  )
}

export { Cards };