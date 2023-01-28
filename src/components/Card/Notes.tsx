import { Reorder } from 'framer-motion';
import { FC, useContext, useState } from 'react';
import styled from 'styled-components/macro';
import { v4 as uuid } from 'uuid';

import { Note } from './Note';
import { Note as NoteType, PeopleActionType } from 'src/types';
import { PeopleCtx } from 'src/util';

const Container = styled(Reorder.Group)`
  margin-top: 18px;
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  padding-inline-start: 0;
  box-shadow: inset 0 0 0 1000px rgb(0 0 0 / 5%);
`;

interface NotesProps {
  personId: string;
  notes: NoteType[];
}

interface TransientNote extends Partial<NoteType> {
  id: string;
  content: string;
  isAdder: boolean;
}

const Notes: FC<NotesProps> = ({ personId, notes }) => {

  const [transientNotes, setTransientNotes] = useState<TransientNote[]>([
    ...notes.map(note => ({ ...note, isAdder: false })),
    { id: uuid(), content: '', isAdder: true },
  ]);
  // console.log(transientNotes[0].id);

  const { dispatch } = useContext(PeopleCtx)!;

  const handleReorder = (transientNotes: TransientNote[]) => {
    setTransientNotes(transientNotes);
    const notes: NoteType[] = transientNotes
      .filter(tn => !tn.isAdder)
      .map(tn => ({ id: tn.id, content: tn.content, createdDate: tn.createdDate! }));
    dispatch({
      type: PeopleActionType.REORDER_NOTES,
      payload: { id: personId, notes },
    });
  };

  return (
    <Container
      axis='y'
      values={transientNotes}
      onReorder={handleReorder}
    >
      {transientNotes.map((transientNote, index) => (
        <Note
          {...{ transientNote, index, personId, setTransientNotes }}
          maxIndex={notes.length - 1}
          key={transientNote.id}
        />
      ))}
    </Container>
  );
};

export {
  Notes,
  type NotesProps,
  type TransientNote,
};

// const AddNoteContainer = styled.div<{ isAddNoteFocused: boolean }>`
//   display: flex;
//   border-top: 1px solid transparent;
//   border-bottom: 1px solid transparent;
//   background-color: #fff;
//   ${({ isAddNoteFocused }) => isAddNoteFocused && `
//     border-top: 1px solid #ddd;
//     border-bottom: 1px solid #ddd;
//   `}
// `;

// const AddNoteContent = styled.div`
//   outline: none;
//   width: 100%;
//   padding: 6px 0 6px 20px;
//   font-size: 14px;
//   line-height: 1.6;
//   &[placeholder]:empty:before {
//     content: attr(placeholder);
//     color: #aaa; 
//   }
// `;

// const [isAddNoteFocused, setIsAddNoteFocused] = useState(false);
// const addNote = (e: ChangeEvent<HTMLDivElement>) => {
//   dispatch({
//     type: PeopleActionType.ADD_NOTE,
//     payload: { id: person.id, content: e.target.innerText },
//   });
//   e.target.innerText = '';
//   setTimeout(() => {
//     const colLen = notesRef.current!.children.length;
//     const noteLi = notesRef.current!.children[colLen - 1];
//     const contentDiv = noteLi.children[1];
//     (contentDiv as HTMLDivElement).focus();
//   });
// };

// <Notes
//   ref={notesRef}
//   axis='y'
//   values={person.notes}
//   onReorder={notes => dispatch({
//     type: PeopleActionType.REORDER_NOTES,
//     payload: { id: person.id, notes },
//   })}
// >
//   {person.notes.map(note => (
//     <Note
//       {...{ note, notesRef }}
//       key={note.id}
//       personId={person.id}
//     />
//   ))}
// </Notes>
// <AddNoteContainer {...{ isAddNoteFocused }}>
//   <AddNoteContent
//     onFocus={() => setIsAddNoteFocused(true)}
//     onBlur={() => setIsAddNoteFocused(false)}
//     contentEditable
//     suppressContentEditableWarning
//     onInput={addNote}
//     placeholder='Add a note...'
//   />
// </AddNoteContainer>