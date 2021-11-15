import React, { useState, useEffect } from 'react';
import produce from 'immer';

import './App.scss';
import { PersonCard } from './components/person';
import { Person } from './types';

function App() {

  const [data, setData] = useState<Person[]>([]);

  useEffect(() => {
    if (typeof window !== undefined) {
      const data = localStorage.getItem('data');
      if (data !== null) {
        return setData(JSON.parse(data));
      }
      return setData([]);
    }
  }, [])

  const addNote = (name: string, note: string) => {
    const nextState = produce(data, draftState => {
      const person = draftState.find(p => p.name === name);
      person?.notes.push(note);
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('data', JSON.stringify(nextState));
    }
    setData(nextState);
  };

  return (
    <>
      {data.map((person: Person) => {
        return <PersonCard
          key={person.name}
          name={person.name}
          notes={person.notes}
          addNote={addNote}
        />
      })}
    </>
  );
}

export default App;
