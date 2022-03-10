import { format } from 'date-fns'; 
import Fuse from 'fuse.js';
import { Dispatch, FC, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import { FocusableItem, Menu, MenuGroup, MenuItem } from '@szhsin/react-menu';

import { PeopleAction, PeopleActionType } from 'src/App';
import { Chip } from 'src/cards';
import { Connection, Note, Person } from 'src/types';

import '@szhsin/react-menu/dist/index.css';
import '@szhsin/react-menu/dist/transitions/slide.css';

import './PersonCard.scss';

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

  const menuItemClassName = ({ hover }: { hover: boolean }) => hover ? 'menu-item hover' : 'menu-item';

  return (
    <div className='person-card'>
      <div className='top-section'>
        {person.isPinned && <button
          className='pin-button'
          title='Unpin'
          onClick={() => peopleDispatch({
            type: PeopleActionType.UNPIN_PERSON,
            payload: { id: person.id },
          })}
        >
          <svg
            className='pin-icon'
            width='24'
            height='24'
            viewBox='0 0 24 24'
          >
            <path
              fill='none'
              d='M0 0h24v24H0z'
            />
            <path
              className='pin-icon-path'
              d='M17 4a2 2 0 0 0-2-2H9c-1.1 0-2 .9-2 2v7l-2 3v2h6v5l1 1 1-1v-5h6v-2l-2-3V4z'
            />
          </svg>
        </button>}
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
        <div
          className='name-text'
          title={format(person.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}
        >{person.name}</div>
        <Menu
          menuClassName='menu'
          menuButton={
            ({ open }) =>
              <button
                className={`more-button ${open ? 'show opening' : ''}`}
              >
                <svg
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
                </svg>
              </button>
          }
          position='anchor'
        > 
          {
            person.isPinned
              ? <MenuItem
                  className={menuItemClassName}
                  onClick={() => peopleDispatch({
                    type: PeopleActionType.UNPIN_PERSON,
                    payload: { id: person.id },
                  })}
                >Unpin card</MenuItem>
              : <MenuItem
                  className={menuItemClassName}
                  onClick={() => peopleDispatch({
                    type: PeopleActionType.PIN_PERSON,
                    payload: { id: person.id },
                  })}
                >Pin card</MenuItem>
          }
          {
            person.showConnections
              ? <MenuItem
                  className={menuItemClassName}
                  onClick={() => peopleDispatch({
                    type: PeopleActionType.HIDE_CONNECTIONS,
                    payload: { id: person.id },
                  })}
                >Hide connections</MenuItem>
              : <MenuItem
                  className={menuItemClassName}
                  onClick={() => peopleDispatch({
                    type: PeopleActionType.SHOW_CONNECTIONS,
                    payload: { id: person.id },
                  })}
                >Show connections</MenuItem>
          }
          <MenuItem
            className={menuItemClassName}
            onClick={() => peopleDispatch({
              type: PeopleActionType.DELETE_PERSON,
              payload: { id: person.id },
            })}
          >Delete card</MenuItem>
        </Menu>
      </div>
      <div className={`connections ${person.showConnections ? 'show' : ''}`}>
        {person.connections.map(connection => {
          return <Chip
            key={connection.id}
            personId={person.id}
            connection={connection}
            setSearchInputValue={setSearchInputValue}
            peopleDispatch={peopleDispatch}
          />
        })}
        <Menu
          menuClassName='menu'
          menuButton={
            ({ open }) =>
              <button
                className={`add-connection-button ${open ? 'show opening' : (person.connections.length === 0 ? 'show' : '')}`}
                title='Add connection'
              >
                <svg
                  className='add-connection-icon'
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 4v16m8-8H4'
                  />
                </svg>  
              </button>
          }
          overflow='auto'
          setDownOverflow
          position='anchor'
          onMenuChange={e => e.open && setConnectionFilter('')}
        >
          <FocusableItem>
            {({ ref }) => (
              <input
                autoFocus
                ref={ref}
                className='connection-filter-input'
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
                  <MenuItem
                    key={id}
                    className={menuItemClassName}
                    onClick={() => peopleDispatch({
                      type: PeopleActionType.ADD_CONNECTION,
                      payload: { id: person.id, connection: { name, id } },
                    })}
                  >{name}</MenuItem>)}
              </MenuGroup>
            : (searchableConnections.length && connectionFilter.trim().length)
              ? <div className='no-connections-placeholder'>Person not found</div>
              : <div className='no-connections-placeholder'>None available</div>}
        </Menu>
      </div>
      {person.notes.length
        ? <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={person.id}>
              {(provided, snapshot) => (
                <div
                  className={`notes ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
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
                        {(provided, snapshot) => (
                          <div
                            className={`note ${snapshot.isDragging ? 'dragging' : ''}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <div
                              className='drag-note-handle'
                              {...provided.dragHandleProps}
                            >
                              <svg
                                className='drag-note-icon'
                                viewBox='0 0 24 36'
                              >
                                <path d='M9.17627 7.35286C9.17627 8.91224 7.91228 10.1765 6.35291 10.1765C4.79353 10.1765 3.5293 8.91224 3.5293 7.35286C3.5293 5.79349 4.79353 4.52949 6.35291 4.52949C7.91228 4.52949 9.17627 5.79349 9.17627 7.35286Z'/>
                                <path d='M9.17627 17.6471C9.17627 19.2064 7.91228 20.4707 6.35291 20.4707C4.79353 20.4707 3.5293 19.2064 3.5293 17.6471C3.5293 16.0877 4.79353 14.8235 6.35291 14.8235C7.91228 14.8235 9.17627 16.0877 9.17627 17.6471Z'/>
                                <path d='M9.17627 27.9414C9.17627 29.5008 7.91228 30.7647 6.35291 30.7647C4.79353 30.7647 3.5293 29.5008 3.5293 27.9414C3.5293 26.382 4.79353 25.1178 6.35291 25.1178C7.91228 25.1178 9.17627 26.382 9.17627 27.9414Z'/>
                                <path d='M20.4706 7.35286C20.4706 8.91224 19.2063 10.1765 17.647 10.1765C16.0876 10.1765 14.8236 8.91224 14.8236 7.35286C14.8236 5.79349 16.0876 4.52949 17.647 4.52949C19.2063 4.52949 20.4706 5.79349 20.4706 7.35286Z'/>
                                <path d='M20.4706 17.6471C20.4706 19.2064 19.2063 20.4707 17.647 20.4707C16.0876 20.4707 14.8236 19.2064 14.8236 17.6471C14.8236 16.0877 16.0876 14.8235 17.647 14.8235C19.2063 14.8235 20.4706 16.0877 20.4706 17.6471Z'/>
                                <path d='M20.4706 27.9414C20.4706 29.5008 19.2063 30.7647 17.647 30.7647C16.0876 30.7647 14.8236 29.5008 14.8236 27.9414C14.8236 26.382 16.0876 25.1178 17.647 25.1178C19.2063 25.1178 20.4706 26.382 20.4706 27.9414Z'/>
                              </svg>
                            </div>
                            <div
                              className='note-text'
                              title={format(note.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}
                            >{note.content}</div>
                            <button
                              className='delete-note-button'
                              title='Delete note'
                              onClick={() => peopleDispatch({
                                type: PeopleActionType.DELETE_NOTE,
                                payload: { personId: person.id, noteId: note.id },
                              })}
                            >
                              <svg
                                fill='none'
                                viewBox='0 0 24 24'
                                className='delete-note-icon'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M6 18L18 6M6 6l12 12'
                                />
                              </svg>
                            </button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        : <div className='notes'>
            <div className='no-notes-placeholder'>You currently have no notes for this person</div>
          </div>}
      <form className='note-input-section'>
        <input
          className='note-input'
          type='text'
          placeholder='Write a note'
          value={noteInputValue}
          onChange={e => setNoteInputValue(e.target.value)}
        />
        <button
          className='add-note-button'
          type='submit'
          onClick={onAddNote}
          disabled={noteInputValue.trim().length === 0}
          title='Add note'
        >+ Note</button>
      </form>
    </div>
  )
}

export { PersonCard };