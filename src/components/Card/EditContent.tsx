// import { format } from 'date-fns'; 
import Fuse from 'fuse.js';
import { FC, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components/macro';
import { FocusableItem, Menu, MenuGroup, MenuItem } from '@szhsin/react-menu';

import { Chip } from './Chip';
import { NotesArea } from './NotesArea';
import { Person, PeopleActionType } from 'src/types';
import { PeopleCtx } from 'src/util';

import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

const sidePadding = 24;
const cardViewHeight = 60;
const Container = styled.div`
  position: fixed;
  top: ${(100 - cardViewHeight) / 2}%;
  left: 50%;
  transform: translateX(-50%);
  max-height: ${cardViewHeight}vh;
  z-index: 1;
  background-color: #fff;
  box-sizing: border-box;
  width: var(--standard-width);
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: var(--shadow-elevation-medium);
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  padding: 26px ${sidePadding}px 0 ${sidePadding}px;
`;

const PinButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const PinIcon = styled.svg`
  width: 18px;
  height: 18px;
  ${PinButton}:active & {
    fill: var(--active-color);
  }
`;

const PinIconPath = styled.path`
  fill: var(--highlight-color);
  ${PinButton}:active & {
    fill: var(--active-color);
  }
`;

const NameInput = styled.input`
  font-weight: 500;
  font-size: 14px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-left: 4px;
  width: -webkit-fill-available;  
  width: -moz-available;
  width: fill-available;
  &::placeholder {
    opacity: 0.4;
  }
`;

const StyledMenu = styled(Menu)`
  font-size: 13px;
  padding: 8px 0;
`;

const StyledMenuItem = styled(MenuItem)`
  color: #444;
  height: 16px;
  & path {
    fill: #444;
  }
  &:active {
    background-color: var(--highlight-color) !important;
    color: #fff;
  }
  &:active path {
    fill: #fff;
  }
  &:hover {
    background-color: var(--gray-highlight-color);
  }
`;

const MoreButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  box-sizing: border-box;
  margin-left: auto;
  width: 28px;
  height: 26px;
  border-radius: 3px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  border: 0;
  padding: 0;
  background: transparent;
  ${({ isOpen }) => isOpen && `
    background-color: #fff;
    border: 1px solid #ccc;  
  `}
  &:hover {
    background-color: #fff;
    border: 1px solid #ccc;
  }
  &:active {
    background-color: var(--gray-highlight-color);
  }
  ${TopSection}:hover & {
    visibility: visible;
  }
`;

const MoreIcon = styled.svg`
  width: 18px;
  height: 18px;
  stroke: #777;
`;

const DeleteIcon = styled.svg`
  width: 14px;
  margin-right: 6px;
`;

const Connections = styled.div`
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  box-sizing: border-box;
  padding: 0 ${sidePadding}px 20px ${sidePadding}px;
  box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

const AddConnectionButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  border: 1px solid transparent;
  background: transparent;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  color: #aaa;
  ${({ isOpen }) => isOpen && `
    border: 1px solid #ccc;
  `};
  &:hover {
    border: 1px solid #ccc;
  }
  &:active {
    background-color: #0095ff08;
    border: 1px solid #0095ff5c;
  }
  ${Connections}:hover & {
    display: flex;
  }
`;

const AddConnectionIcon = styled.svg`
  stroke: #aaa;
  width: 12px;
  height: 12px;
  ${AddConnectionButton}:active & {
    stroke: #0095ff;
  }
`;

const AddConnectionText = styled.div`
  margin-left: 4px;
  font-size: 12px;
  ${AddConnectionButton}:active & {
    color: #0095ff;
  }
`;

const ConnectionFilterInput = styled.input`
  cursor: text;
  border-bottom: 1px solid #0095ff;
  padding-bottom: 2px;
  width: 100%;
  &::placeholder {
    opacity: 0.4;
  }
`;

const ConnectionName = styled.div``;

const ConnectionNamePlaceholder = styled.div`
  color: #aaa;
  ${StyledMenuItem}:active & {
    color: #fff;
  }
`;

const NoConnectionsPlaceholder = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  padding: 0.375rem 1.5rem;
  font-style: italic;
  opacity: 0.3;
`;

interface EditContentProps {
  person: Person;
}

const EditContent: FC<EditContentProps> = ({ person }) => {

  const { staleState, dispatch } = useContext(PeopleCtx)!;
  const [connectionFilter, setConnectionFilter] = useState<string>('');
  const navigate = useNavigate();
  
  if (!person) return null;

  const searchableConnections = staleState.filter(ac =>
    ac.id !== person.id
    && !person.connections.includes(ac.id)
  );
  const filteredConnections = connectionFilter
    ? new Fuse(searchableConnections, {
      keys: ['name'],
      threshold: 0.4,
    })
      .search(connectionFilter)
      .map(result => result.item)
    : searchableConnections;

  const onDeletePerson = () => {
    navigate(-1);
    dispatch({
      type: PeopleActionType.DELETE_PERSON,
      payload: { id: person.id },
    });
  }

  return (
    <Container>
      <TopSection>
        {person.isPinned
          ? <PinButton
              onClick={() => dispatch({
                type: PeopleActionType.UNPIN_PERSON,
                payload: { id: person.id },
              })}
              title='Unpin'
            >
              <PinIcon
                width='24'
                height='24'
                viewBox='0 0 24 24'
              >
                <path
                  fill='none'
                  d='M0 0h24v24H0z'
                />
                <PinIconPath d='M17 4a2 2 0 0 0-2-2H9c-1.1 0-2 .9-2 2v7l-2 3v2h6v5l1 1 1-1v-5h6v-2l-2-3V4z' />
              </PinIcon>
            </PinButton>
          : <PinButton
              onClick={() => dispatch({
                type: PeopleActionType.PIN_PERSON,
                payload: { id: person.id },
              })}
              title='Pin'
            >
              <PinIcon
                width='24'
                height='24'
                viewBox='0 0 24 24'
              >
                <path
                  fill='none'
                  d='M0 0h24v24H0z'
                />
              <PinIconPath d='M17 4v7l2 3v2h-6v5l-1 1-1-1v-5H5v-2l2-3V4c0-1.1.9-2 2-2h6c1.11 0 2 .89 2 2zM9 4v7.75L7.5 14h9L15 11.75V4H9z' />
              </PinIcon>
            </PinButton>
        }
        {/* <NameText title={format(person.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}>{person.name}</NameText> */}
        <NameInput
          value={person.name}
          placeholder='awaiting name.. （・⊝・ ∞）'
          onChange={e => dispatch({
            type: PeopleActionType.EDIT_NAME,
            payload: { id: person.id, name: e.target.value },
          })}
        />
        <StyledMenu
          menuButton={({ open }) =>
            <MoreButton isOpen={open}>
              <MoreIcon
                className='more-icon'
                fill='none'
                viewBox='0 0 24 24'
                stroke='#444'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z'
                />
              </MoreIcon>
            </MoreButton>}
          position='anchor'
        >
          <StyledMenuItem
            onClick={onDeletePerson}
          > 
            <DeleteIcon
              viewBox='0 0 25 28'
            >
              <path d='M0.959455 7.02488H2.29289V21.6917C2.29289 25.239 4.77681 27.9139 8.07082 27.9139H16.0709C19.3646 27.9139 21.8489 25.2387 21.8489 21.6917L21.8485 7.02488H23.182C23.6727 7.02488 24.0708 6.6265 24.0708 6.13606C24.0708 5.64529 23.6724 5.24724 23.182 5.24724H16.9598V1.69156C16.9598 1.20079 16.5615 0.802734 16.071 0.802734H8.07091C7.58014 0.802734 7.18208 1.20111 7.18208 1.69156V5.24724H0.959621C0.468853 5.24724 0.0708008 5.64562 0.0708008 6.13606C0.0708008 6.62652 0.468869 7.02488 0.959621 7.02488H0.959455ZM20.0708 21.6917C20.0708 24.2668 18.3887 26.1362 16.0709 26.1362H8.07082C5.75309 26.1362 4.07092 24.2668 4.07092 21.6917L4.07061 7.02488H20.0708L20.0708 21.6917ZM8.95956 2.58038H15.1817V5.24724H8.95956V2.58038Z' />
              <path d='M15.1819 11.4695C14.6911 11.4695 14.2931 11.8679 14.2931 12.3583V21.2473C14.2931 21.7381 14.6915 22.1361 15.1819 22.1361C15.6727 22.1361 16.0707 21.7378 16.0707 21.2473V12.3583C16.0707 11.8678 15.6727 11.4695 15.1819 11.4695Z' />
              <path d='M8.95962 11.4695C8.46885 11.4695 8.0708 11.8679 8.0708 12.3583V21.2473C8.0708 21.7381 8.46918 22.1361 8.95962 22.1361C9.45039 22.1361 9.84844 21.7378 9.84844 21.2473V12.3583C9.84844 11.8678 9.45006 11.4695 8.95962 11.4695Z' />
            </DeleteIcon>
            Delete card
          </StyledMenuItem>
        </StyledMenu>
      </TopSection>
      <Connections>
        {person.connections.map(connectionId =>
          <Chip
            key={connectionId}
            personId={person.id}
            connectionId={connectionId}
          />
        )}
        <Menu
          menuClassName='menu'
          menuButton={({ open }) =>
            <AddConnectionButton
              isOpen={open}
              title='Add connection'
            >
              <AddConnectionIcon
                viewBox='0 0 24 24'
                strokeWidth={2}
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 4v16m8-8H4'
                />
              </AddConnectionIcon>
              {person.connections.length === 0 &&
                <AddConnectionText>Add Connection</AddConnectionText>
              }
            </AddConnectionButton>}
          overflow='auto'
          setDownOverflow
          position='anchor'
          onMenuChange={e => e.open && setConnectionFilter('')}
        >
          <FocusableItem>
            {({ ref }) => (
              <ConnectionFilterInput
                autoFocus
                ref={ref}
                type='text'
                placeholder='Filter connections'
                value={connectionFilter}
                onChange={e => setConnectionFilter(e.target.value)}
              />
            )}
          </FocusableItem>
          {filteredConnections.length
            ? <MenuGroup takeOverflow>
                {filteredConnections.map((connection: Person) =>
                  <StyledMenuItem
                    key={connection.id}
                    onClick={() => dispatch({
                      type: PeopleActionType.ADD_CONNECTION,
                      payload: { personId: person.id, connectionId: connection.id },
                    })}
                  >
                    {connection.name.trim() === ''
                      ? <ConnectionNamePlaceholder>（・⊝・ ∞）</ConnectionNamePlaceholder>
                      : <ConnectionName>{connection.name}</ConnectionName>}
                  </StyledMenuItem>)}
              </MenuGroup>
            : (searchableConnections.length && connectionFilter.trim().length)
              ? <NoConnectionsPlaceholder>Person not found</NoConnectionsPlaceholder>
              : <NoConnectionsPlaceholder>None available</NoConnectionsPlaceholder>}
        </Menu>
      </Connections>
      <NotesArea
        personId={person.id}
        notes={person.notes}
        archive={person.archive}
        showArchive={person.showArchive}
      />
    </Container>
  );
};

export {
  EditContent,
  type EditContentProps,
};
