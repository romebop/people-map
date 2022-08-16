import { format } from 'date-fns'; 
import Fuse from 'fuse.js';
import { Dispatch, FC, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import styled, { css } from 'styled-components/macro';
import { v4 as uuidv4 } from 'uuid';
import { FocusableItem, Menu, MenuGroup, MenuItem } from '@szhsin/react-menu';

import { PeopleAction, PeopleActionType } from 'src/App';
import { Chip } from 'src/components';
import { Connection, Note, Person } from 'src/types';

import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

const Container = styled.div`
  box-shadow: var(--shadow-elevation-low);
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #fff;
  &:not(:first-child) {
    margin-top: 40px;
  }
`;

const StyledMenu = styled(Menu)`
  font-size: 13px;
  padding: 8px 0;
`;

const StyledMenuItem = styled(MenuItem)`
  &:active {
    background-color: var(--highlight-color) !important;
    color: #fff;
  }
  &.hover {
    background-color: var(--gray-highlight-color);
  }
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid #efefef;
  padding: 12px 20px 14px 20px;
  // background-color: var(--card-shade);
`;

const PinButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin-right: 8px;
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

const NameText = styled.div`
  font-weight: 500;
  font-size: 16px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-right: 6px;
`;

const MoreButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  visibility: ${({ isOpen }) => isOpen ? 'visible' : 'hidden'};
  box-sizing: border-box;
  margin-left: auto;
  width: 26px;
  height: 24px;
  border-radius: 3px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  border: 0;
  padding: 0;
  background: transparent;
  ${({ isOpen }) => isOpen && css`
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
  width: 16px;
  height: 16px;
`;

const Connections = styled.div<{ show: boolean }>`
  display: ${({ show }) => show ? 'flex' : 'none'};
  flex-wrap: wrap;
  gap: 6px;
  border-bottom: 1px solid #efefef;
  padding: 12px 20px 14px 20px;
  min-height: 55.09px;
  box-sizing: border-box;
`;

const AddConnectionButton = styled.input<{ isOpen: boolean, show: boolean }>`
  display: ${({ show }) => show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  width: 30px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  color: #aaa;
  font-size: 16px;
  &:active {
    background-color: #0095ff08;
    border: 1px solid #0095ff5c;
  }
  ${({ isOpen }) => isOpen && css`
    border: 1px solid #ccc;
  `};
  &:hover {
    border: 1px solid #ccc;
  }
  ${Connections}:hover & {
    display: flex;
  }
`;

const AddConnectionIcon = styled.svg`
  stroke: #888;
  width: 12px;
  height: 12px;
  ${AddConnectionButton}:active & {
    stroke: #0095ff;
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

const NoConnectionsPlaceholder = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  padding: 0.375rem 1.5rem;
  font-style: italic;
  opacity: 0.3;
`;

const Notes = styled.div`
  padding: 10px 14px 14px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledNote = styled.div<{ isDragging: boolean, isDraggingOver: boolean }>`
  display: flex;
  align-items: flex-start;
  padding: 8px 10px 10px 0;
  box-sizing: border-box;
  border-radius: 4px;
  background-color: ${({ isDragging }) => isDragging ? 'var(--gray-highlight-color)' : 'transparent'};
  ::selection {
    background-color: papayawhip;
  }
  ${({ isDraggingOver }) => !isDraggingOver && css`
    &:hover {
      background-color: var(--gray-highlight-color);
    }
  `}
`;

const DragNoteHandle = styled.div<{ isDragging: boolean, isDraggingOver: boolean }>`
  visibility: ${({ isDragging }) => isDragging ? 'visible' : 'hidden'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  padding-left: 10px;
  margin-right: 8px;
  align-self: stretch;
  ${({ isDraggingOver }) => !isDraggingOver && css`
    ${StyledNote}:hover & {
      visibility: visible;
    }
  `}
`;

const DragNoteIcon = styled.svg`
  width: 14px;
  height: 14px;
  path {
    fill: #aaa;
  }
`;

const NoteText = styled.div`
  line-height: 1.4;
`;

const NoNotesPlaceholder = styled.div`
  font-style: italic;
  opacity: 0.3;
  display: flex;
  align-items: center;
  padding: 8px 10px 10px 36px;
  line-height: 1.4;
`;

const DeleteNoteButton = styled.button<{ isDraggingOver: boolean }>`
  visibility: hidden;
  display: flex;
  box-sizing: border-box;
  width: 24px;
  height: 19.6px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  border: 0;
  padding: 0;
  background: transparent;
  margin-left: auto;
  ${({ isDraggingOver }) => !isDraggingOver && css`
    ${StyledNote}:hover & {
      visibility: visible;
    }
  `}
`;

const DeleteNoteIcon = styled.svg`
  width: 14px;
  height: 14px;
  stroke: #777;
  ${DeleteNoteButton}:active & {
    stroke: #444;
  }
`;

const NoteInputSection = styled.form`
  display: flex;
  padding: 12px 20px 16px 20px;
  border-top: 1px solid #efefef;
  font-size: 12px;
  // background-color: var(--card-shade);
`;

const NoteInput = styled.input`
  box-sizing: border-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background-color: #fff;
  border-radius: 3px;
  padding: 4px 10px;
  flex-grow: 1;
  margin-right: 8px;
  &:focus {
    border: 1px solid var(--highlight-color);
  }
  &::placeholder {
    opacity: 0.4;
  }
`;

const AddNoteButton = styled.button`
  background-color: var(--highlight-color);
  color: #fff;
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.4);
  border: 1px solid transparent;
  font-weight: 500;
  font-family: inherit;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding: 8px 14px;
  cursor: pointer;
  word-spacing: 2px;
  &[disabled] {
    background-color: #d0d0d0;
    cursor: default;
  }
  &:active {
    box-shadow: unset;
    background-color: var(--active-color);
  }
`;

interface PersonCardProps {
  person: Person;
  allConnections: Connection[];
  setSearchInputValue: (name: string) => void;
  peopleDispatch: Dispatch<PeopleAction>;
} 

const PersonCard: FC<PersonCardProps> = ({ person, allConnections, setSearchInputValue, peopleDispatch }: PersonCardProps) => {

  const [connectionFilter, setConnectionFilter] = useState<string>('');
  const searchableConnections = allConnections.filter(ac =>
    ac.id !== person.id
    && !person.connections.map(pc => pc.id).includes(ac.id)
  );
  const filteredConnections: Connection[] = connectionFilter
    ? new Fuse(searchableConnections, {
        keys: ['name'],
        threshold: 0.4,
      })
      .search(connectionFilter)
      .map(result => result.item)
    : searchableConnections;
  const [noteInputValue, setNoteInputValue] = useState<string>('');

  const onAddNote = () => {
    const content = noteInputValue.trim();
    if (content) {
      const newNote: Note = {
        id: uuidv4(),
        content,
        createdDate: new Date(),
      };
      peopleDispatch({
        type: PeopleActionType.ADD_NOTE,
        payload: { id: person.id, note: newNote },
      });
      setNoteInputValue('');
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    peopleDispatch({
      type: PeopleActionType.REORDER_NOTES,
      payload: { id: person.id, startIdx: result.source.index, endIdx: result.destination.index },
    });
  };

  const menuItemClassName = ({ hover }: { hover: boolean }) => hover ? 'hover' : '';

  return (
    <Container>
      <TopSection>
        {person.isPinned &&
          <PinButton
            onClick={() => peopleDispatch({
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
        }
        {/* <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
        >
          <path
            fill='none'
            d='M0 0h24v24H0z'
          />
          <path
            fill='#000'
            d='M17 4v7l2 3v2h-6v5l-1 1-1-1v-5H5v-2l2-3V4c0-1.1.9-2 2-2h6c1.11 0 2 .89 2 2zM9 4v7.75L7.5 14h9L15 11.75V4H9z'
          />
        </svg> */}
        <NameText title={format(person.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}>{person.name}</NameText>
        <StyledMenu
          menuButton={
            ({ open }) =>
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
              </MoreButton>
          }
          position='anchor'
        > 
          {
            person.isPinned
              ? <StyledMenuItem
                  className={menuItemClassName}
                  onClick={() => peopleDispatch({
                    type: PeopleActionType.UNPIN_PERSON,
                    payload: { id: person.id },
                  })}
                >Unpin card</StyledMenuItem>
              : <StyledMenuItem
                  className={menuItemClassName}
                  onClick={() => peopleDispatch({
                    type: PeopleActionType.PIN_PERSON,
                    payload: { id: person.id },
                  })}
                >Pin card</StyledMenuItem>
          }
          {
            person.showConnections
              ? <StyledMenuItem
                  className={menuItemClassName}
                  onClick={() => peopleDispatch({
                    type: PeopleActionType.HIDE_CONNECTIONS,
                    payload: { id: person.id },
                  })}
                >Hide connections</StyledMenuItem>
              : <StyledMenuItem
                  className={menuItemClassName}
                  onClick={() => peopleDispatch({
                    type: PeopleActionType.SHOW_CONNECTIONS,
                    payload: { id: person.id },
                  })}
                >Show connections</StyledMenuItem>
          }
          <StyledMenuItem
            className={menuItemClassName}
            onClick={() => peopleDispatch({
              type: PeopleActionType.DELETE_PERSON,
              payload: { id: person.id },
            })}
          >Delete card</StyledMenuItem>
        </StyledMenu>
      </TopSection>
      <Connections show={person.showConnections}>
        {person.connections.map(connection =>
          <Chip
            key={connection.id}
            personId={person.id}
            connection={connection}
            setSearchInputValue={setSearchInputValue}
            peopleDispatch={peopleDispatch}
          />
        )}
        <Menu
          menuClassName='menu'
          menuButton={
            ({ open }) =>
              <AddConnectionButton
                // className={`add-connection-AddConnectionButton ${open ? 'show opening' : (person.connections.length === 0 ? 'show' : '')}`}
                isOpen={open}
                show={open || (person.connections.length === 0)}
                title='Add connection'
              >
                <AddConnectionIcon
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 4v16m8-8H4'
                  />
                </AddConnectionIcon>  
              </AddConnectionButton>
          }
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
                {filteredConnections.map(({ name, id }) =>
                  <StyledMenuItem
                    key={id}
                    className={menuItemClassName}
                    onClick={() => peopleDispatch({
                      type: PeopleActionType.ADD_CONNECTION,
                      payload: { id: person.id, connection: { name, id } },
                    })}
                  >{name}</StyledMenuItem>)}
              </MenuGroup>
            : (searchableConnections.length && connectionFilter.trim().length)
              ? <NoConnectionsPlaceholder>Person not found</NoConnectionsPlaceholder>
              : <NoConnectionsPlaceholder>None available</NoConnectionsPlaceholder>}
        </Menu>
      </Connections>
      {person.notes.length
        ? <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={person.id}>
              {(provided, droppableSnapshot) => (
                <Notes
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {person.notes.map((note: Note, idx: number) => {
                    return (
                      <Draggable
                        key={note.id}
                        draggableId={note.id}
                        index={idx}
                      >
                        {(provided, draggableSnapshot) => (
                          <StyledNote
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            isDragging={draggableSnapshot.isDragging}
                            isDraggingOver={droppableSnapshot.isDraggingOver}
                          >
                            <DragNoteHandle
                              {...provided.dragHandleProps}
                              isDragging={draggableSnapshot.isDragging}
                              isDraggingOver={droppableSnapshot.isDraggingOver}
                            >
                              <DragNoteIcon viewBox='0 0 24 36'>
                                <path d='M9.17627 7.35286C9.17627 8.91224 7.91228 10.1765 6.35291 10.1765C4.79353 10.1765 3.5293 8.91224 3.5293 7.35286C3.5293 5.79349 4.79353 4.52949 6.35291 4.52949C7.91228 4.52949 9.17627 5.79349 9.17627 7.35286Z'/>
                                <path d='M9.17627 17.6471C9.17627 19.2064 7.91228 20.4707 6.35291 20.4707C4.79353 20.4707 3.5293 19.2064 3.5293 17.6471C3.5293 16.0877 4.79353 14.8235 6.35291 14.8235C7.91228 14.8235 9.17627 16.0877 9.17627 17.6471Z'/>
                                <path d='M9.17627 27.9414C9.17627 29.5008 7.91228 30.7647 6.35291 30.7647C4.79353 30.7647 3.5293 29.5008 3.5293 27.9414C3.5293 26.382 4.79353 25.1178 6.35291 25.1178C7.91228 25.1178 9.17627 26.382 9.17627 27.9414Z'/>
                                <path d='M20.4706 7.35286C20.4706 8.91224 19.2063 10.1765 17.647 10.1765C16.0876 10.1765 14.8236 8.91224 14.8236 7.35286C14.8236 5.79349 16.0876 4.52949 17.647 4.52949C19.2063 4.52949 20.4706 5.79349 20.4706 7.35286Z'/>
                                <path d='M20.4706 17.6471C20.4706 19.2064 19.2063 20.4707 17.647 20.4707C16.0876 20.4707 14.8236 19.2064 14.8236 17.6471C14.8236 16.0877 16.0876 14.8235 17.647 14.8235C19.2063 14.8235 20.4706 16.0877 20.4706 17.6471Z'/>
                                <path d='M20.4706 27.9414C20.4706 29.5008 19.2063 30.7647 17.647 30.7647C16.0876 30.7647 14.8236 29.5008 14.8236 27.9414C14.8236 26.382 16.0876 25.1178 17.647 25.1178C19.2063 25.1178 20.4706 26.382 20.4706 27.9414Z'/>
                              </DragNoteIcon>
                            </DragNoteHandle>
                            <NoteText title={format(note.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}>{note.content}</NoteText>
                            <DeleteNoteButton
                              isDraggingOver={droppableSnapshot.isDraggingOver}
                              onClick={() => peopleDispatch({
                                type: PeopleActionType.DELETE_NOTE,
                                payload: { personId: person.id, noteId: note.id },
                              })}
                              title='Delete note'
                            >
                              <DeleteNoteIcon
                                fill='none'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M6 18L18 6M6 6l12 12'
                                />
                              </DeleteNoteIcon>
                            </DeleteNoteButton>
                          </StyledNote>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </Notes>
              )}
            </Droppable>
          </DragDropContext>
        : <Notes>
            <NoNotesPlaceholder>You currently have no notes for this person</NoNotesPlaceholder>
          </Notes>}
      <NoteInputSection>
        <NoteInput
          type='text'
          placeholder='Write a note'
          value={noteInputValue}
          onChange={e => setNoteInputValue(e.target.value)}
        />
        <AddNoteButton
          type='submit'
          onClick={onAddNote}
          disabled={noteInputValue.trim().length === 0}
          title='Add note'
        >
          + Note
        </AddNoteButton>
      </NoteInputSection>
    </Container>
  )
}

export { PersonCard };