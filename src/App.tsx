import Fuse from 'fuse.js';
import produce from 'immer';
import { debounce } from 'lodash';
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
 } from 'react';

import './App.scss';
import { PersonCard } from './components/person';
import { Person } from './types';

function App() {

  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [query, setQuery] = useState<string>('');
  
  const addPersonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== undefined) {
      const data = localStorage.getItem('data');
      if (data !== null) {
        setAllPersons(JSON.parse(data));
      }
    }
  }, []);

  const filteredPersons: Person[] = query
    ? new Fuse(allPersons, { keys: ['name', 'notes'] })
      .search(query)
      .map(result => result.item)
    : allPersons;

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e?.target?.value);
  }
  const debouncedOnSearch = useMemo(() => (
    debounce(onSearch, 200)
  ), []);

  const deletePerson = (name: string) => {
    const nextState = produce(allPersons, draftState => {
      const idx = draftState.findIndex(p => p.name === name);
      draftState.splice(idx, 1);
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('data', JSON.stringify(nextState));
    }
    setAllPersons(nextState);
  };

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
    const name = addPersonInputRef.current!.value.trim();
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
      addPersonInputRef.current!.value = '';
    }
  };

  return (
    <>
      <input
        id="search-input"
        type="text"
        placeholder="Search"
        onChange={debouncedOnSearch}
      />
      {filteredPersons.map((person: Person, idx: number) => {
        return <PersonCard
          key={idx}
          name={person.name}
          notes={person.notes}
          deletePerson={deletePerson}
          addNote={addNote}
          deleteNote={deleteNote}
        />
      })}
      <div id="add-person-line">
        <input
          ref={addPersonInputRef}
          id="add-person-input"
          type="text"
          placeholder="Enter name"
        />
        <button onClick={addPerson}>Add person</button>
      </div>
    </>
  );
}

export default App;
