import React from 'react';
import './person.scss';

interface PersonCardProps {
  name: string;
  notes: string[];
  addNote: (name: string, note: string) => void;
  deleteNote: (name: string, idx: number) => void;
} 

const PersonCard: React.FC<PersonCardProps> = (props: PersonCardProps) => {

  const addNote = () => {
    const noteInput = document.querySelector(`#${props.name}-note-input`) as HTMLInputElement;
    const note = noteInput.value.trim();
    if (note) {
      props.addNote(props.name, note);
      noteInput.value = '';
    }
  }

  return(
    <div className="person-card">
      <div className="name">{props.name}</div>
      <div className="note-input-line">
        <input
          id={`${props.name}-note-input`}
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