import { format } from 'date-fns'; 
import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { v4 as uuidv4 } from 'uuid';

import { PeopleAction, PeopleActionType } from '../App';
import { Note } from '../types';

import './PersonCard.scss';

interface PersonCardProps {
  id: string;
  name: string;
  notes: Note[];
  createdDate: Date;
  peopleDispatch: React.Dispatch<PeopleAction>;
} 

const PersonCard: React.FC<PersonCardProps> = (props: PersonCardProps) => {

  const [inputValue, setInputValue] = useState<string>('');

  const onAddNote = () => {
    const content = inputValue.trim();
    if (content) {
      const newNote: Note = {
        id: uuidv4(),
        content,
        createdDate: new Date(),
      };
      props.peopleDispatch({
        type: PeopleActionType.ADD_NOTE,
        payload: { id: props.id, note: newNote },
      });
      setInputValue('');
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    props.peopleDispatch({
      type: PeopleActionType.REORDER_NOTES,
      payload: { id: props.id, startIdx: result.source.index, endIdx: result.destination.index },
    });
  };

  return(
    <div className="person-card">
      <div className="name-section">
        <div
          className="name-text"
          title={format(props.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}
        >{props.name}</div>
        <div
          className="delete-person-button"
          title="Delete person card"
          onClick={() => props.peopleDispatch({
            type: PeopleActionType.DELETE_PERSON,
            payload: { id: props.id },
          })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 delete-person-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#444"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>

      {props.notes.length
        ? <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={props.id}>
            {provided => (
              <div
                className="notes"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {props.notes.map((note: Note, idx: number) => {
                  return (
                    <Draggable
                      key={note.id}
                      draggableId={note.id}
                      index={idx}
                    >
                      {provided => (
                        <div
                          className="note"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div
                            className="note-text"
                            title={format(note.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}
                          >{note.content}</div>
                          <div className="delete-note-button-container">
                            <div
                              className="delete-note-button"
                              title="Delete note"
                              onClick={() => props.peopleDispatch({
                                type: PeopleActionType.DELETE_NOTE,
                                payload: { personId: props.id, noteId: note.id },
                              })}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 delete-note-icon"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="#444"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </div>
                          </div>
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
        : <div className="notes">
          <div className="no-notes-placeholder">You have no notes for this person</div>
        </div> 
      }
      <form className="note-input-section">
        <input
          className="note-input"
          type="text"
          placeholder="Write a note"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        <button
          className="add-note-button"
          type="submit"
          onClick={onAddNote}
          disabled={inputValue.trim().length === 0}
          title="Add note"
        >+ Note</button>
      </form>
    </div>
  )
}

export { PersonCard };