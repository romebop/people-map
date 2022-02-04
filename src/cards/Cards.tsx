import { Dispatch, FC, useState } from 'react';

import { PeopleAction, PeopleActionType } from '../App';
import { Person } from '../types';
import { PersonCard } from '.';

import './Cards.scss';

interface CardsProps {
  people: Person[];
  hasQuery: boolean;
  peopleDispatch: Dispatch<PeopleAction>;
} 

const Cards: FC<CardsProps> = ({ people, hasQuery, peopleDispatch }: CardsProps) => {

  const [personInputValue, setPersonInputValue] = useState<string>('');

  const onAddPerson = () => {
    const name = personInputValue.trim();
    if (name) {
      peopleDispatch({
        type: PeopleActionType.ADD_PERSON,
        payload: { name },
      });
      setPersonInputValue('');
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
              peopleDispatch={peopleDispatch}
            />
          })
          : hasQuery
            ? <div className="no-people-placeholder">We didn't find anything</div>
            : <div className="no-people-placeholder">Add a new person!</div>
        }
      </div>
      <form id="add-person-line">
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