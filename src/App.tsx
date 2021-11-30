import Fuse from 'fuse.js';
import produce from 'immer';
import React, { useState, useEffect, ChangeEvent } from 'react';

import './App.scss';
import { PersonCard } from './components/person';
import { Person } from './types';

function App() {

  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [query, updateQuery] = useState('');

  const fuse = new Fuse(allPersons, {
    keys: ['name', 'notes'],
  });
  
  const searchResults: Fuse.FuseResult<Person>[] = fuse.search(query);
  const filteredPersons: Person[] = query
    ? searchResults.map(result => result.item)
    : allPersons;

  useEffect(() => {
    if (typeof window !== undefined) {
      const data = localStorage.getItem('data');
      if (data !== null) {
        return setAllPersons(JSON.parse(data));
      }
      return setAllPersons([]);
    }
  }, [])

  const onSearch = ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
    updateQuery(currentTarget.value);
  }

  const addNote = (name: string, note: string) => {
    const nextState = produce(allPersons, draftState => {
      const person = draftState.find(p => p.name === name);
      person?.notes.push(note);
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('data', JSON.stringify(nextState));
    }
    setAllPersons(nextState);
  };

  const deleteNote = (name: string, idx: number) => {
    const nextState = produce(allPersons, draftState => {
      const person = draftState.find(p => p.name === name);
      person?.notes.splice(idx, 1);
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('data', JSON.stringify(nextState));
    }
    setAllPersons(nextState);
  };

  const addPerson = () => {
    const personInput = document.querySelector('#add-person-input') as HTMLInputElement;
    const name = personInput.value.trim();
    if (name) {
      const nextState = produce(allPersons, draftState => {
        const newPerson: Person = {
          name,
          notes: [],
        };
        draftState.push(newPerson);
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('data', JSON.stringify(nextState));
      }
      setAllPersons(nextState);
    }
  }

  return (
    <>
      <input
        type="text"
        value={query}
        onChange={onSearch}
      />
      {filteredPersons.map((person: Person) => {
        return <PersonCard
        key={person.name}
        name={person.name}
        notes={person.notes}
        addNote={addNote}
        deleteNote={deleteNote}
        />
      })}
      <div className="add-person-line">
        <input
          id="add-person-input"
          placeholder="Enter name"
        />
        <button onClick={addPerson}>Add person</button>
      </div>
    </>
  );
}

export default App;
