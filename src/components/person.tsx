import React, { useRef } from 'react';

import './person.scss';

interface PersonCardProps {
  name: string;
  notes: string[];
  deletePerson: (name: string) => void;
  addNote: (name: string, note: string) => void;
  deleteNote: (name: string, idx: number) => void;
} 

const PersonCard: React.FC<PersonCardProps> = (props: PersonCardProps) => {

  const inputRef = useRef<HTMLInputElement>(null);

  const addNote = () => {
    const note = inputRef.current!.value.trim();
    if (note) {
      props.addNote(props.name, note);
      inputRef.current!.value = '';
    }
  }

  return(
    <div className="person-card">
      <div className="name-line">
        <div className="name-text">{props.name}</div>
        <button
          className="delete-person-button"
          onClick={() => props.deletePerson(props.name)}
        >Delete person</button>
      </div>
      <div className="note-input-line">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter note"
        />
        <button onClick={addNote}>Add note</button>
      </div>
      <div className="notes">
        {props.notes.map((note, idx) => {
          return (
            <div key={idx} className="note">
              <div className="note-text">{note}</div>
              <button
                className="note-button"
                onClick={() => props.deleteNote(props.name, idx)}
              >Delete note</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { PersonCard };