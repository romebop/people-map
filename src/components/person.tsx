import React from 'react';

interface PersonCardProps {
  name: string;
  notes: string[];
  addNote: (name: string, note: string) => void;
} 

const PersonCard: React.FC<PersonCardProps> = (props: PersonCardProps) => {

  const handleAddNote = () => {
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
      <input id={`${props.name}-note-input`} type="text" placeholder="Enter a new note" />
      <button onClick={handleAddNote}>Add note</button>
      <div className="notes">
        {props.notes.map((note, idx) => {
          return <div key={idx} className="note">{note}</div>
        })}
      </div>
    </div>
  )
}

export { PersonCard }