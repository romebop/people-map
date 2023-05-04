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
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import styled from 'styled-components/macro';

import { Cards, Graph } from 'src/components';
import { Person } from 'src/types';
import { init, PeopleCtx, peopleReducer } from 'src/util';

const TopContainer = styled.div`
  display: flex;
  width: var(--standard-width);
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
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

const StyledLink = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  width: 40px;
  text-decoration: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
`;

const LinkIcon = styled.svg<{ isActive: boolean }>`
  width: 16px;
  height: 16px;
  opacity: 0.4;
  transition: all 0.1s ease-in-out;
  ${({ isActive }) => isActive && `
    stroke: #fff;
    opacity: 1;
  `}
`;

const GridIcon = styled.svg<{ isActive: boolean }>`
  width: 14px;
  height: 14px;
  opacity: 0.4;
  transition: all 0.1s ease-in-out;
  stroke: unset;
  ${({ isActive }) => isActive && `
    opacity: 1;
    path {
      fill: #fff;
    }
  `}
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
  let cardsLayout = localStorage.getItem('cardsLayout') as 'list' | 'grid';
  if (cardsLayout === null) {
    localStorage.setItem('cardsLayout', 'list');
    cardsLayout = 'list';
  }
  const [query, setQuery] = useState<string>(searchParams.get('search') ?? '');
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isEditing = /\/cards\/.*/.test(path);

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
  const hasQuery = useMemo(() => {
    return query.trim().length > 0;
  }, [query]);

  useEffect(() => {
    localStorage.setItem('data', JSON.stringify(people));
  }, [people]);

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e?.target?.value);
    const mergedParams = new URLSearchParams(searchParams);
    if (e?.target?.value === '') {
      mergedParams.delete('search');
    } else {
      mergedParams.set('search', e?.target?.value);
    }
    setSearchParams(mergedParams);
  }
  // const debouncedOnSearch = useRef(
  //   debounce(onSearch, 150)
  // ).current;

  const setSearchInputValue = (name: string) => {
    searchInputRef.current!.value = name;
    setQuery(name);
    const mergedParams = new URLSearchParams(searchParams);
    if (name === '') {
      mergedParams.delete('search');
    } else {
      mergedParams.set('search', name);
    }
    setSearchParams(mergedParams);
  };

  const handleCardsButtonClick = () => {
    navigate(`/cards${searchParams.toString() === '' ? '' : '?'}${searchParams.toString()}`);
    if (path === '/graph') return;
    if (cardsLayout === 'list') {
      localStorage.setItem('cardsLayout', 'grid'); 
    } else {
      localStorage.setItem('cardsLayout', 'list');
    }
  };

  const handleGraphButtonClick = () => {
    navigate(`/graph${searchParams.toString() === '' ? '' : '?'}${searchParams.toString()}`);
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
      staleState: stalePeople,
      sortedFilteredPeople,
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
            placeholder='Search'
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
            title='Card View (List · Grid toggle)'
            onClick={handleCardsButtonClick}
          >
            {cardsLayout === 'list'
              ? <LinkIcon
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='#000'
                  isActive={path.includes('/cards')}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </LinkIcon>
              : <GridIcon
                  fill='#000'
                  viewBox='0 0 24 24'
                  isActive={path.includes('/cards')}
                >
                  <path d='M8.96854 0.0224609H1.82578C0.841444 0.0224609 0.0336914 0.830213 0.0336914 1.81455V8.93207C0.0336914 9.91641 0.841444 10.7242 1.82578 10.7242H8.9433C9.92764 10.7242 10.7354 9.91641 10.7354 8.93207L10.7352 1.81455C10.7604 0.830213 9.95266 0.0224609 8.96832 0.0224609H8.96854ZM8.96854 8.95722H1.80054L1.82589 1.78922H8.94342L8.96859 1.8144L8.96854 8.95722Z' />
                  <path d='M22.219 0.0224609H15.0763C14.0919 0.0224609 13.2842 0.830213 13.2842 1.81455V8.93207C13.2842 9.91641 14.0919 10.7242 15.0763 10.7242H22.1938C23.1781 10.7242 23.9859 9.91641 23.9859 8.93207L23.9857 1.81455C24.0109 0.830213 23.2031 0.0224609 22.2188 0.0224609H22.219ZM22.219 8.95722L15.0763 8.93205L15.1014 1.78929H22.219L22.2441 1.81446L22.219 8.95722Z' />
                  <path d='M8.96854 13.2729H1.82578C0.841444 13.2729 0.0336914 14.0807 0.0336914 15.065V22.1826C0.0336914 23.1669 0.841444 23.9747 1.82578 23.9747H8.9433C9.92764 23.9747 10.7354 23.1669 10.7354 22.1826L10.7352 15.065C10.7604 14.0807 9.95266 13.2729 8.96832 13.2729H8.96854ZM8.96854 22.2329L1.80054 22.2076L1.82572 15.0648H8.94324L8.96842 15.09L8.96854 22.2329Z' />
                  <path d='M22.219 13.2729H15.0763C14.0919 13.2729 13.2842 14.0807 13.2842 15.065V22.1826C13.2842 23.1669 14.0919 23.9747 15.0763 23.9747H22.1938C23.1781 23.9747 23.9859 23.1669 23.9859 22.1826L23.9857 15.065C24.0109 14.0807 23.2031 13.2729 22.2188 13.2729H22.219ZM22.219 22.2329L15.0763 22.2078L15.1014 15.065H22.219L22.2441 15.0902L22.219 22.2329Z' />
                </GridIcon>}
          </StyledLink>
          <StyledLink
            title='Graph View'
            onClick={handleGraphButtonClick}
          >
            <LinkIcon
              fill='none'
              viewBox='0 0 24 24'
              stroke='#000'
              isActive={path.includes('/graph')}
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
            element={<Cards {...{ hasQuery }} layout={cardsLayout} />}
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