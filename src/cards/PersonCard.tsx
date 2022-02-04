import { format } from 'date-fns'; 
import { Dispatch, FC, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { v4 as uuidv4 } from 'uuid';

import { PeopleAction, PeopleActionType } from '../App';
import { Note, Person } from '../types';

import './PersonCard.scss';

interface PersonCardProps {
  person: Person;
  peopleDispatch: Dispatch<PeopleAction>;
} 

const PersonCard: FC<PersonCardProps> = ({ person, peopleDispatch }: PersonCardProps) => {

  const [inputValue, setInputValue] = useState<string>('');

  const onAddNote = () => {
    const content = inputValue.trim();
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
      setInputValue('');
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

  return(
    <div className="person-card">
      <div className="name-section">
        <div
          className="name-text"
          title={format(person.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}
        >{person.name}</div>
        <div
          className="delete-person-button"
          title="Delete person card"
          onClick={() => peopleDispatch({
            type: PeopleActionType.DELETE_PERSON,
            payload: { id: person.id },
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

      {person.notes.length
        ? <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={person.id}>
            {provided => (
              <div
                className="notes"
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
                              onClick={() => peopleDispatch({
                                type: PeopleActionType.DELETE_NOTE,
                                payload: { personId: person.id, noteId: note.id },
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