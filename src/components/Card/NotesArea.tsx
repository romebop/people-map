import { Reorder } from 'framer-motion';
import { FC, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components/macro';
import { v4 as uuid } from 'uuid';

import { ArchiveNote } from './ArchiveNote';
import { Note } from './Note';
import { useWindowSize } from 'src/hooks';
import { Note as NoteType, PeopleActionType } from 'src/types';
import { PeopleCtx } from 'src/util';

const Container = styled.div``;

const NotesContainer = styled(Reorder.Group)`
  margin-top: 18px;
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  padding-inline-start: 0;
  box-shadow: inset 0 0 0 1000px rgb(0 0 0 / 5%);
  position: relative;
`;

const DragArea = styled.div<{ height: number }>`
  position: absolute;
  ${({ height }) => height && `height: ${height}px`};
  width: 100%;
`;

const ArchiveContainer = styled.div``;

const ArchiveBorder = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin: 5px 24px 14px 24px;
`;

const ArchiveToggleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const ToggleArchiveButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

const ToggleIcon = styled.svg<{ isActive: boolean }>`
  width: 14px;
  height: 14px;
  ${({ isActive }) => isActive && `
    transform: rotate(90deg);
  `}
`;

const ArchiveCountText = styled.div`
  margin-left: 10px;
`;

interface NotesAreaProps {
  personId: string;
  notes: NoteType[];
  archive: NoteType[];
}

interface TransientNote extends Partial<NoteType> {
  id: string;
  content: string;
  isAdder: boolean;
}

const NotesArea: FC<NotesAreaProps> = ({ personId, notes, archive }) => {

  const { dispatch } = useContext(PeopleCtx)!;
  const [transientNotes, setTransientNotes] = useState<TransientNote[]>([
    ...notes.map(note => ({ ...note, isAdder: false })),
    { id: uuid(), content: '', isAdder: true },
  ]);

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

  const constraintsRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<(Map<string, HTMLLIElement>) | null>(null);
  function getNotesRefMap(): Map<string, HTMLLIElement> {
    if (!notesRef.current) {
      notesRef.current = new Map<string, HTMLLIElement>();
    }
    return notesRef.current;
  }
  const [dragAreaHeight, setDragAreaHeight] = useState(0);
  useEffect(() => {
    const addNodeId = transientNotes.at(-1)?.id;
    let dragAreaHeight = 0;
    for (const [id, node] of getNotesRefMap()) {
      if (id === addNodeId) continue;
      dragAreaHeight += node.offsetHeight;      
    }
    console.log('setting dragAreaHeight:', dragAreaHeight);
    setDragAreaHeight(dragAreaHeight);
  }, [transientNotes]);
  const size = useWindowSize(); // work around dragConstraint bug on window resize

  const [showArchive, setShowArchive] = useState(archive.length === 0);

  return (
    <Container>
      <NotesContainer
        axis='y'
        values={transientNotes}
        onReorder={handleReorder}
      >
        <DragArea ref={constraintsRef} height={dragAreaHeight} />
        {transientNotes.map(transientNote => (
          <Note
            key={`${transientNote.id}:${JSON.stringify(size)}`}
            {...{ transientNote, constraintsRef, getNotesRefMap, personId, setTransientNotes }}
          />
        ))}
      </NotesContainer>
      {archive.length > 0 &&
        <ArchiveContainer>
          <ArchiveBorder />
          <ArchiveToggleContainer>
            <ToggleArchiveButton
              onClick={() => setShowArchive(currentValue => !currentValue)}
            >
              <ToggleIcon
                viewBox='0 0 6 10'
                isActive={showArchive}
              >
                <path d='M1.49994 0.5L0.439941 1.56L3.87994 5L0.439941 8.44L1.49994 9.5L5.99994 5L1.49994 0.5Z' fill='black' />
              </ToggleIcon>
            </ToggleArchiveButton>
            <ArchiveCountText>{archive.length} Archived note{archive.length > 1 ? 's' : ''}</ArchiveCountText>
          </ArchiveToggleContainer>
          {showArchive &&
            archive.map(note => (
              <ArchiveNote
                key={note.id}
                {...{ note, personId, setTransientNotes }}
              />
            ))
          }
        </ArchiveContainer>
      }
    </Container>
  );
};

//<svg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
//  <path d='M11.25 6.75H6.75V11.25H5.25V6.75H0.75V5.25H5.25V0.75H6.75V5.25H11.25V6.75Z' fill='black' />
//</svg>


export {
  NotesArea,
  type NotesAreaProps,
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