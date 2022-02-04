import Fuse from 'fuse.js';
import produce from 'immer';
import { debounce } from 'lodash';
import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
  useReducer,
 } from 'react';
//  import {
//   BrowserRouter as Router,
//   Switch,
//   Route,
//   Link
// } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

import './App.scss';
import { PersonCard } from './components';
import { Person } from './types';
import { parseDates } from './util';

export enum PeopleActionType {
  ADD_PERSON = 'ADD_PERSON',
  DELETE_PERSON = 'DELETE_PERSON',
  ADD_NOTE = 'ADD_NOTE',
  DELETE_NOTE = 'DELETE_NOTE',
  REORDER_NOTES = 'REORDER_NOTES',
}

export interface PeopleAction {
  type: PeopleActionType;
  payload?: any;
}

function init(initialVal: Person[]): Person[] {
  const data = localStorage.getItem('data');
  if (data !== null) {
    const parsedData = JSON.parse(data);
    parseDates(parsedData);
    return parsedData;
  }
  return initialVal;
}

function peopleReducer(people: Person[], { type, payload }: PeopleAction): Person[] {
  switch (type) {
    case PeopleActionType.ADD_PERSON:
      return produce(people, draftState => {
        const newPerson: Person = {
          id: uuidv4(),
          name: payload.name,
          notes: [],
          createdDate: new Date(),
        };
        draftState.push(newPerson);
      });
    case PeopleActionType.DELETE_PERSON:
      return produce(people, draftState => {
        const idx = draftState.findIndex(p => p.id === payload.id);
        draftState.splice(idx, 1);
      });
    case PeopleActionType.ADD_NOTE:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.id);
        person?.notes.push(payload.note);
      });
    case PeopleActionType.DELETE_NOTE:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.personId);
        const noteIdx = person?.notes?.findIndex(n => n.id === payload.noteId);
        person?.notes?.splice(noteIdx!, 1);
      });
    case PeopleActionType.REORDER_NOTES:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.id);
        const [removed] = person?.notes.splice(payload.startIdx, 1)!;
        person?.notes.splice(payload.endIdx, 0, removed);
      });
    default:
      return people;
  }
}

function App() {

  const [people, peopleDispatch] = useReducer(peopleReducer, [], init);
  const [query, setQuery] = useState<string>('');
  const hasQuery = query.trim().length > 0;
  const [personInputValue, setPersonInputValue] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('data', JSON.stringify(people));
  }, [people]);

  const filteredPeople: Person[] = query
    ? new Fuse(people, { keys: ['name', 'notes.content'] })
      .search(query)
      .map(result => result.item)
    : people;

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e?.target?.value);
  }
  const debouncedOnSearch = useRef(
    debounce(onSearch, 150)
  ).current;

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
        {filteredPeople.length > 0
          ? filteredPeople.map((person: Person) => {
            return <PersonCard
              key={person.id}
              id={person.id}
              name={person.name}
              notes={person.notes}
              createdDate={person.createdDate}
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
  );
}

export default App;
