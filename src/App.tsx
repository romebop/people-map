import Fuse from 'fuse.js';
// import { debounce } from 'lodash';
import {
  ChangeEvent,
  useEffect,
  useMemo,
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
  useSearchParams,
} from 'react-router-dom';
import styled from 'styled-components/macro';

import { Cards, Graph } from 'src/components';
import { Connection, Person } from 'src/types';
import { init, PeopleCtx, peopleReducer } from 'src/util';

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
  background-color: #0095ffa3;
  position: absolute;
  width: 40px;
  height: 40px;
  transition: all 0.1s ease-in-out;
  z-index: -1;
  ${({ path }) => {
    if (path.includes('cards')) return `left: 0`;
    if (path.includes('graph')) return `left: 40px`;
  }}
`;

const StyledLink = styled(NavLink)`
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
  ${StyledLink}.active & {
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
  ${({ isActive }) => isActive && `
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

function App() {

  const [people, peopleDispatch] = useReducer(peopleReducer, [], init);
  const [stalePeople, setStalePeople] = useState<Person[]>(people);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState<string>(searchParams.get('search') ?? '');
  const location = useLocation();
  const path = location.pathname;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isEditingRegex = /\/cards\/.*/;
  const isEditing = isEditingRegex.test(path);

  useEffect(() => {
    if (!isEditing) setStalePeople(people);
  }, [people, isEditing])

  const sortedFilteredPeople: Person[] = useMemo(() => {
    const filteredPeople: Person[] = query
      ? new Fuse(stalePeople, {
          keys: ['name', 'notes.content'],
          threshold: 0.4,
        })
        .search(query)
        .map(result => result.item)
      : stalePeople;
    const sortedFilteredPeople: Person[] = [
      ...filteredPeople.filter(p => p.isPinned),
      ...filteredPeople.filter(p => !p.isPinned),
    ];
    return sortedFilteredPeople;
  }, [stalePeople, query]);
  const allConnections: Connection[] = useMemo(() => {
    return people.map(({ name, id }) => ({ name, id }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [people]);
  const hasQuery = useMemo(() => {
    return query.trim().length > 0;
  }, [query]);

  useEffect(() => {
    localStorage.setItem('data', JSON.stringify(people));
  }, [people]);

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e?.target?.value);
    const params = new URLSearchParams(e?.target?.value === '' ? {} : { search: e?.target?.value });
    setSearchParams(params);
  }
  // const debouncedOnSearch = useRef(
  //   debounce(onSearch, 150)
  // ).current;

  const setSearchInputValue = (name: string) => {
    searchInputRef.current!.value = name;
    setQuery(name);
    const params = new URLSearchParams(name === '' ? {} : { search: name });
    setSearchParams(params);
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
    <PeopleCtx.Provider value={{
      state: people,
      staleState: sortedFilteredPeople,
      allConnections,
      dispatch: peopleDispatch,
    }}>
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
            defaultValue={query}
            type='text'
            placeholder='Search by name, note'
            onChange={onSearch}
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
          <StyledLink
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
          </StyledLink>
          <StyledLink
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
          </StyledLink>
          <ActiveRouteHighlight path={path} />
        </LinksContainer>
      </TopContainer>
      <Routes>
        {['/cards', 'cards/:id'].map(path =>
          <Route
            key={path}
            path={path}
            element={<Cards {...{ hasQuery }} />}
          />
        )}
        <Route
          path='/graph'
          element={<Graph />}
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
    </PeopleCtx.Provider>
  );
};

export default App;