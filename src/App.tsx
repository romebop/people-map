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
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import styled, { css } from 'styled-components/macro';
import { v4 as uuidv4 } from 'uuid';

import { Cards, Graph } from 'src/components';
import { Connection, Person } from 'src/types';
import { parseDates } from 'src/util';

const TopContainer = styled.div`
  display: flex;
  width: var(--standard-width);
  margin-bottom: 40px;
`;

const LinksContainer = styled.div`
  display: flex;
  font-weight: 500;
  font-family: inherit;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  cursor: pointer;
  word-spacing: 2px;
  position: relative;
`;

const ActiveRouteHighlight = styled.div<{ path: string }>`
  border-radius: 4px;
  background-color: var(--highlight-color);
  position: absolute;
  width: 40px;
  height: 40px;
  transition: all 0.1s ease-in-out;
  z-index: -1;
  ${({ path }) => {
    switch (path) {
      case 'cards': {
        return css`left: 0`;
      }
      case 'graph': {
        return css`left: 40`;
      }
    }
  }}
`;

const Link = styled(NavLink)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: 40px;
  text-decoration: none;
  border-radius: 4px;
`;

const LinkIcon = styled.svg`
  width: 16px;
  height: 16px;
  opacity: 0.4;
  transition: all 0.1s ease-in-out;
  ${Link}.active & {
    stroke: #fff;
    opacity: 1;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  flex-grow: 1;
  box-sizing: border-box;
  border: 2px solid rgba(0, 0, 0, 0.16);
  background-color: #fff;
  border-radius: 4px;
  padding: 8px 16px;
  margin-right: 8px;
  &:focus-within {
    border: 2px solid var(--highlight-color);
  }
`;

const SearchIcon = styled.svg<{ isActive: boolean }>`
  width: 14px;
  margin-right: 12px;
  opacity: 0.25;
  stroke: #000;
  ${({ isActive }) => isActive && css`
    opacity: 1;
    stroke: var(--strong-highlight-color);
  `}
`;

const SearchInput = styled.input`
  flex-grow: 1;
  &::placeholder {
    opacity: 0.4;
    // font-weight: 500;
  }
`

const DeleteQueryButton = styled.button<{ show: boolean }>`
  display: ${({ show }) => show ? 'flex' : 'none'};
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  align-items: center;
  margin-left: 12px;
  margin-right: -2px;
`;  

const DeleteQueryIcon = styled.svg`
  width: 14px;
  height: 14px;
  stroke: #aaa;
`;

export enum PeopleActionType {
  ADD_PERSON = 'ADD_PERSON',
  DELETE_PERSON = 'DELETE_PERSON',
  PIN_PERSON = 'PIN_PERSON',
  UNPIN_PERSON = 'UNPIN_PERSON',
  SHOW_CONNECTIONS = 'SHOW_CONNECTIONS',
  HIDE_CONNECTIONS = 'HIDE_CONNECTIONS',
  ADD_CONNECTION = 'ADD_CONNECTION',
  DELETE_CONNECTION = 'DELETE_CONNECTION',
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
          showConnections: false,
          connections: [],
        };
        draftState.push(newPerson);
      });
    case PeopleActionType.DELETE_PERSON:
      return produce(people, draftState => {
        const idx = draftState.findIndex(p => p.id === payload.id);
        draftState.splice(idx, 1);
        draftState.forEach(p => {
          p.connections = p.connections.filter(c => c.id !== payload.id);
        });
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
    case PeopleActionType.SHOW_CONNECTIONS:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.id);
        person!.showConnections = true;
      });
    case PeopleActionType.HIDE_CONNECTIONS:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.id);
        person!.showConnections = false;
      });
    case PeopleActionType.ADD_CONNECTION:
      return produce(people, draftState => {
        const person1 = draftState.find(p => p.id === payload.id);
        person1?.connections.push(payload.connection);
        const person2 = draftState.find(p => p.id === payload.connection.id);
        person2?.connections.push({ name: person1?.name!, id: payload.id });
        // TODO: sort?
      });
    case PeopleActionType.DELETE_CONNECTION:
      return produce(people, draftState => {
        const person1 = draftState.find(p => p.id === payload.personId);
        const connectionIdx1 = person1?.connections?.findIndex(c => c.id === payload.connectionId);
        person1?.connections?.splice(connectionIdx1!, 1);
        const person2 = draftState.find(p => p.id === payload.connectionId);
        const connectionIdx2 = person2?.connections?.findIndex(c => c.id === payload.personId);
        person2?.connections?.splice(connectionIdx2!, 1);
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
  const allConnections: Connection[] = people.map(({ name, id }) => ({ name, id  }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const [query, setQuery] = useState<string>('');
  const hasQuery = query.trim().length > 0;

  const path = useLocation().pathname.slice(1);

  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const setSearchInputValue = (name: string) => {
    searchInputRef.current!.value = name;
    setQuery(name);
  };

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
      <TopContainer>
        <SearchContainer>
          <SearchIcon
            isActive={hasQuery}
            fill='none'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={3}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </SearchIcon>
          <SearchInput
            ref={searchInputRef}
            type='text'
            placeholder='Search by name, note'
            onChange={debouncedOnSearch}
          />
          <DeleteQueryButton
            show={hasQuery}
            onClick={() => setSearchInputValue('')}
            title='Clear'
          >
            <DeleteQueryIcon
              fill='none'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={3}
                d='M6 18L18 6M6 6l12 12'
              />
            </DeleteQueryIcon>
          </DeleteQueryButton>
        </SearchContainer>
        <LinksContainer>
          <Link
            to='/cards'
            title='Card View'
          >
            <LinkIcon
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
            </LinkIcon>
          </Link>
          <Link
            to='/graph'
            title='Graph View'
          >
            <LinkIcon
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
            </LinkIcon>
          </Link>
          <ActiveRouteHighlight path={path} />
        </LinksContainer>
      </TopContainer>
      <Routes>
        <Route
          path='/cards'
          element={
            <Cards
              people={sortedPeople}
              allConnections={allConnections}
              hasQuery={hasQuery}
              setSearchInputValue={setSearchInputValue}
              peopleDispatch={peopleDispatch}
            />
          }
        />
        <Route
          path='/graph'
          element={<Graph people={sortedPeople} />}
        />
        <Route
          path='/'
          element={<Navigate to='/cards' replace />}
        />
      </Routes>
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
