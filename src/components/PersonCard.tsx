import { format } from 'date-fns'; 
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Note } from '../types';

import './PersonCard.scss';

interface PersonCardProps {
  id: string;
  name: string;
  notes: Note[];
  createdDate: Date;
  deletePerson: (id: string) => void;
  addNote: (id: string, note: Note) => void;
  deleteNote: (personId: string, noteId: string) => void;
} 

const PersonCard: React.FC<PersonCardProps> = (props: PersonCardProps) => {

  const [inputValue, setInputValue] = useState<string>('');

  const addNote = () => {
    const content = inputValue.trim();
    if (content) {
      const newNote: Note = {
        id: uuidv4(),
        content,
        createdDate: new Date(),
      };
      props.addNote(props.id, newNote);
      setInputValue('');
    }
  }

  return(
    <div className="person-card">
      <div className="name-section">
        <div
          className="name-text"
          title={format(props.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}
        >{props.name}</div>
        <div
          className="delete-person-button"
          title="Delete Person Card"
          onClick={() => props.deletePerson(props.id)}
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
      <div className="notes">
        {props.notes.length
          ? props.notes.map((note: Note) => {
            return (
              <div key={note.id} className="note">
                <div
                  className="note-text"
                  title={format(note.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}
                >{note.content}</div>
                <div className="delete-note-button-container">
                  <div
                    className="delete-note-button"
                    title="Delete Note"
                    onClick={() => props.deleteNote(props.id, note.id)}
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
            )
          })
          : <div className="no-notes-placeholder">You have no notes for this person</div>
        }
      </div>
      <form className="note-input-section">
        <input
          className="note-input"
          type="text"
          placeholder="Write a Note"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        <button
          className="add-note-button"
          type="submit"
          onClick={addNote}
          disabled={inputValue.trim().length === 0}
          title="Add Note"
        >+ Note</button>
      </form>
    </div>
  )
}

export { PersonCard };