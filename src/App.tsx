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
 import {
  NavLink,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import './App.scss';
import { Cards } from './cards';
import { Graph } from './graph';
import { Person } from './types';
import { parseDates } from './util';

export enum PeopleActionType {
  ADD_PERSON = 'ADD_PERSON',
  DELETE_PERSON = 'DELETE_PERSON',
  PIN_PERSON = 'PIN_PERSON',
  UNPIN_PERSON = 'UNPIN_PERSON',
  ADD_NOTE = 'ADD_NOTE',
  DELETE_NOTE = 'DELETE_NOTE',
  REORDER_NOTES = 'REORDER_NOTES',
  // UPLOAD_PEOPLE = 'UPLOAD_PEOPLE',
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
          isPinned: false,
        };
        draftState.push(newPerson);
      });
    case PeopleActionType.DELETE_PERSON:
      return produce(people, draftState => {
        const idx = draftState.findIndex(p => p.id === payload.id);
        draftState.splice(idx, 1);
      });
    case PeopleActionType.PIN_PERSON:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.id);
        person!.isPinned = true;
      });
    case PeopleActionType.UNPIN_PERSON:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.id);
        person!.isPinned = false;
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

  const path = useLocation().pathname.slice(1);

  useEffect(() => {
    localStorage.setItem('data', JSON.stringify(people));
  }, [people]);

  const filteredPeople: Person[] = query
    ? new Fuse(people, {
        keys: ['name', 'notes.content'],
        threshold: 0.4,
      })
      .search(query)
      .map(result => result.item)
    : people;

  const sortedPeople: Person[] = [
    ...filteredPeople.filter(p => p.isPinned),
    ...filteredPeople.filter(p => !p.isPinned),
  ]

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e?.target?.value);
  }
  const debouncedOnSearch = useRef(
    debounce(onSearch, 150)
  ).current;

  // const onDataUpload = (e: ChangeEvent<HTMLInputElement>) => {
  //   const [file] = e.target.files!;
  //   const reader = new FileReader();
  //   reader.readAsText(file);
  //   reader.onload = (e: ProgressEvent<FileReader>) => {
  //     console.log(e.target?.result);
  //   };
  // }

  return (
    <>
      <div id='top-container'>
        <div id='search-container'>
          <svg
            id='search-icon'
            className={`${hasQuery ? 'active' : ''}`}
            fill='none'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={3}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
          <input
            id='search-input'
            type='text'
            placeholder='Search by name, note'
            onChange={debouncedOnSearch}
          />
        </div>
        <div id='links-container'>
          <NavLink
            to='/cards'
            title='Card View'
          >
            <svg
              fill='none'
              viewBox='0 0 24 24'
              stroke='#000'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
              />
            </svg>
          </NavLink>
          <NavLink
            to='/graph'
            title='Graph View'
          >
            <svg
              fill='none'
              viewBox='0 0 24 24'
              stroke='#000'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5'
              />
            </svg>
          </NavLink>
          <div className={`active-route-highlight ${path}`}></div>
        </div>
      </div>
      <Switch>
        <Route path='/cards'>
          <Cards
            people={sortedPeople}
            hasQuery={hasQuery}
            peopleDispatch={peopleDispatch}
          >
          </Cards>
        </Route>
        <Route path='/graph'>
          <Graph
            people={sortedPeople}
          ></Graph>
        </Route>
        <Route exact path='/'>
          <Redirect to='/cards' />
        </Route>
      </Switch>
      {/* <a
        style={{ marginTop: 40, display: 'block' }}
        href={`data:text/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(people, null, 2)
        )}`}
        download='people-data.json'
      >Export Data</a>
      <input
        style={{ marginTop: 20 }}
        type='file'
        onChange={onDataUpload}
      /> */}
    </>
  );
}

export default App;
