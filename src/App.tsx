import Fuse from 'fuse.js';
import produce from 'immer';
import { debounce } from 'lodash';
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
 } from 'react';
 import { v4 as uuidv4 } from 'uuid';

 import './App.scss';
 import { PersonCard } from './components';
 import { Person, Note } from './types';
 import { parseDates } from './util';

function App() {

  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [query, setQuery] = useState<string>('');
  const hasQuery = query.trim().length > 0;
  const [personInputValue, setPersonInputValue] = useState<string>('');
  
  useEffect(() => {
    if (typeof window !== undefined) {
      const data = localStorage.getItem('data');
      if (data !== null) {
        const parsedData = JSON.parse(data);
        parseDates(parsedData);
        setAllPersons(parsedData);
      }
    }
  }, []);

  const filteredPersons: Person[] = query
    ? new Fuse(allPersons, { keys: ['name', 'notes.content'] })
      .search(query)
      .map(result => result.item)
    : allPersons;

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e?.target?.value);
  }
  const debouncedOnSearch = useRef(
    debounce(onSearch, 150)
  ).current;

  const deletePerson = (id: string) => {
    const nextState = produce(allPersons, draftState => {
      const idx = draftState.findIndex(p => p.id === id);
      draftState.splice(idx, 1);
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('data', JSON.stringify(nextState));
    }
    setAllPersons(nextState);
  };

  const addNote = (id: string, note: Note) => {
    const nextState = produce(allPersons, draftState => {
      const person = draftState.find(p => p.id === id);
      person?.notes.push(note);
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('data', JSON.stringify(nextState));
    }
    setAllPersons(nextState);
  };

  const deleteNote = (personId: string, noteId: string) => {
    const nextState = produce(allPersons, draftState => {
      const person = draftState.find(p => p.id === personId);
      const noteIdx = person?.notes?.findIndex(n => n.id === noteId);
      person?.notes?.splice(noteIdx!, 1);
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('data', JSON.stringify(nextState));
    }
    setAllPersons(nextState);
  };

  const reorderNotes = (personId: string, startIdx: number, endIdx: number) => {
    const nextState = produce(allPersons, draftState => {
      const person = draftState.find(p => p.id === personId);
      const [removed] = person?.notes.splice(startIdx, 1)!;
      person?.notes.splice(endIdx, 0, removed);
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('data', JSON.stringify(nextState));
    }
    setAllPersons(nextState);
  };

  const addPerson = () => {
    const name = personInputValue.trim();
    if (name) {
      const nextState = produce(allPersons, draftState => {
        const newPerson: Person = {
          id: uuidv4(),
          name,
          notes: [],
          createdDate: new Date(),
        };
        draftState.push(newPerson);
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('data', JSON.stringify(nextState));
      }
      setAllPersons(nextState);
      setPersonInputValue('');
    }
  };

  return (
    <>
      <div id="search-container">
        <svg
          id="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 ${hasQuery ? 'active' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke={hasQuery ? '#0095ffcc' : 'black'}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          id="search-input"
          type="text"
          placeholder="Search by name, note"
          onChange={debouncedOnSearch}
        />
      </div>
      <div id="person-cards-container">
        {filteredPersons.length > 0
          ? filteredPersons.map((person: Person) => {
            return <PersonCard
              key={person.id}
              id={person.id}
              name={person.name}
              notes={person.notes}
              createdDate={person.createdDate}
              deletePerson={deletePerson}
              addNote={addNote}
              deleteNote={deleteNote}
              reorderNotes={reorderNotes}
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
          onClick={addPerson}
          disabled={personInputValue.trim().length === 0}
          title="Add Person"
        >+ Person</button>
      </form>
    </>
  );
}

export default App;
