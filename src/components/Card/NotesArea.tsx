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

const cardBottomPadding = 34;
const NotesContainer = styled(({ hasArchive, ...props }) => (
  <Reorder.Group {...props} />
))<{ hasArchive: boolean }>`
  margin-top: 18px;
  margin-bottom: ${({ hasArchive }) => hasArchive ? `0` : `${cardBottomPadding}px`};
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

const ArchiveContainer = styled.div`
  padding-bottom: ${cardBottomPadding}px;
  background-color: #0095ff14;
  border-radius: 0 0 4px 4px;
`;

const ArchiveToggleContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 25px;
  cursor: pointer;
`;

const ToggleArchiveButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  height: 20px;
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ToggleIcon = styled.svg<{ isActive: boolean }>`
  width: 12px;
  height: 12px;
  display: flex;
  opacity: 0.5;
  ${({ isActive }) => isActive && `
    transform: rotate(90deg);
  `}
`;

const ArchiveCountText = styled.div`
  margin-left: 10px;
  user-select: none;
`;

interface NotesAreaProps {
  personId: string;
  notes: NoteType[];
  archive: NoteType[];
  showArchive: boolean;
}

interface TransientNote extends Partial<NoteType> {
  id: string;
  content: string;
  isAdder: boolean;
}

const NotesArea: FC<NotesAreaProps> = ({ personId, notes, archive, showArchive }) => {

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
  const notesMapRef = useRef<Map<string, HTMLLIElement>>(new Map<string, HTMLLIElement>());
  const [dragAreaHeight, setDragAreaHeight] = useState(0);
  useEffect(() => {
    const addNodeId = transientNotes.at(-1)?.id;
    let dragAreaHeight = 0;
    for (const [id, node] of notesMapRef.current) {
      if (id === addNodeId) continue;
      dragAreaHeight += node.getBoundingClientRect().height;      
    }
    setDragAreaHeight(dragAreaHeight);
  }, [transientNotes]);
  const size = useWindowSize(); // work around dragConstraint bug on window resize

  return (
    <Container>
      <NotesContainer hasArchive={archive.length > 0}
        axis='y'
        values={transientNotes}
        onReorder={handleReorder}
      >
        <DragArea ref={constraintsRef} height={dragAreaHeight} />
        {transientNotes.map(transientNote => (
          <Note
            key={`${transientNote.id}:${JSON.stringify(size)}`}
            {...{ transientNote, constraintsRef, notesMapRef, personId, setTransientNotes }}
          />
        ))}
      </NotesContainer>
      {archive.length > 0 &&
        <ArchiveContainer>
          <ArchiveToggleContainer
            onClick={() => dispatch({
              type: PeopleActionType.TOGGLE_ARCHIVE,
              payload: { id: personId },
            })}
          >
            <ToggleArchiveButton>
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