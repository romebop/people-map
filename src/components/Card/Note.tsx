import { format } from 'date-fns'; 
import { Reorder, useDragControls } from 'framer-motion';
import {
  ChangeEvent,
  Dispatch,
  FC,
  RefObject,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import styled, { StyledComponent } from 'styled-components/macro';
import { v4 as uuid } from 'uuid';

import { TransientNote } from './NotesArea';
import { Note as NoteType, PeopleActionType } from 'src/types';
import { PeopleCtx } from 'src/util';

const Container = styled(({ isFocused, notesMapRef, id, ...props }) => (
  <Reorder.Item
    ref={node => {
      if (node) {
        notesMapRef.current.set(id, node);
      } else {
        notesMapRef.current.delete(id);
      }
    }}
    {...props}
  />
))<{ isFocused: boolean }>`
  display: flex;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  position: relative;
  background-color: #fff;
  ${({ isFocused }) => isFocused && `
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
  `}
`;

const DragHandle = styled.div<{ isFocused: boolean }>`
  display: ${({ isFocused }) => isFocused ? 'flex' : 'none'};;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: stretch;
  cursor: grab;
  position: absolute;
  top: 5px;
  left: 0px;
  width: 16px;
  height: 24px;
  &:active {
    cursor: grabbing;
  }
  ${Container}:hover & {
    display: flex;
  }
`;

const DragIcon = styled.svg`
  height: 16px;
  path {
    fill: #999;
  }
`;

const ArchiveButton = styled.button`
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: stretch;
  cursor: grab;
  position: absolute;
  top: 5px;
  left: 20px;
  width: 16px;
  height: 24px;
  border: 0;
  padding: 0;
  background: transparent;
`;

const ArchiveIcon = styled.svg`
  width: 14px;
  height: 14px;
  stroke: #777;
  ${ArchiveButton}:active & {
    stroke: #444;
  }
`;

const Content = styled.div<{ isInArchive?: boolean }>`
  outline: none;
  width: 100%;
  padding: 6px 0 6px 40px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  &[placeholder]:empty:before {
    content: attr(placeholder);
    color: #aaa;
  }
  ${({ isInArchive }) => isInArchive && `
    text-decoration: line-through;
  `}
`;

const DeleteButton = styled.button<{ hoverContainer: StyledComponent<any, any> }>`
  visibility: hidden;
  display: flex;
  box-sizing: border-box;
  width: 24px;
  height: 19.6px;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  cursor: pointer;
  flex-shrink: 0;
  border: 0;
  padding: 0;
  background: transparent;
  ${({ hoverContainer }) => `
    ${hoverContainer}:hover & {
      visibility: visible;
    }
  `}
`;

const DeleteIcon = styled.svg`
  width: 14px;
  height: 14px;
  /* stroke: #777;
  ${DeleteButton}:active & {
    stroke: #444;
  } */
`;

interface NoteProps {
  transientNote: TransientNote;
  constraintsRef: RefObject<HTMLDivElement>;
  notesMapRef: RefObject<Map<string, HTMLLIElement>>;
  personId: string;
  setTransientNotes: Dispatch<SetStateAction<TransientNote[]>>
}

const Note: FC<NoteProps> = ({ transientNote, constraintsRef, notesMapRef, personId, setTransientNotes }) => {

  const { dispatch } = useContext(PeopleCtx)!;
  const [isFocused, setIsFocused] = useState(false);
  const [initialValue] = useState(transientNote.content);
  const dragControls = useDragControls();

  const handleInput = (val: string) => {
    if (transientNote.isAdder) {
      const newNote: NoteType = {
        id: transientNote.id,
        content: val,
        createdDate: new Date(),
      };
      setTransientNotes(transientNotes => [
        ...transientNotes.slice(0, -1),
        { ...newNote, isAdder: false },
        { id: uuid(), content: '', isAdder: true },
      ]);
      dispatch({
        type: PeopleActionType.ADD_NOTE,
        payload: { id: personId, note: newNote },
      });
    } else {
      setTransientNotes(transientNotes => {
        const idx = transientNotes.findIndex(tn => tn.id === transientNote.id);
        return [
          ...transientNotes.slice(0, idx),
          { ...transientNotes[idx], content: val },
          ...transientNotes.slice(idx + 1),
        ];
      });
      dispatch({
        type: PeopleActionType.EDIT_NOTE,
        payload: { personId, noteId: transientNote.id, content: val },
      });
    }
  };

  const handleArchive = () => {
    setTransientNotes(transientNotes => {
      const idx = transientNotes.findIndex(tn => tn.id === transientNote.id);
      return [
        ...transientNotes.slice(0, idx),
        ...transientNotes.slice(idx + 1),
      ];
    });
    dispatch({
      type: PeopleActionType.ARCHIVE_NOTE,
      payload: { personId, noteId: transientNote.id },
    });
  };

  const handleDelete = () => {
    setTransientNotes(transientNotes => {
      const idx = transientNotes.findIndex(tn => tn.id === transientNote.id);
      return [
        ...transientNotes.slice(0, idx),
        ...transientNotes.slice(idx + 1),
      ];
    });
    dispatch({
      type: PeopleActionType.DELETE_NOTE,
      payload: { personId, noteId: transientNote.id },
    });
  };

  return (
    <Container
      {...{ isFocused, notesMapRef }}
      id={transientNote.id}
      value={transientNote}
      transition={{
        duration: 0,
        ease: 'easeInOut',
      }}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={constraintsRef}
      dragElastic={0}
      dragMomentum={false}
      // whileDrag={{ scale: 1.02 }}
      title={transientNote.createdDate && format(transientNote.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}
    >
      {!transientNote.isAdder &&
        <>
          <DragHandle
            {...{ isFocused }}
            onPointerDown={e => dragControls.start(e)}
            title='Drag note'
          >
            <DragIcon viewBox='0 0 8 13'>
              <path d='M1.5 3C2.32843 3 3 2.32843 3 1.5C3 0.671573 2.32843 0 1.5 0C0.671573 0 0 0.671573 0 1.5C0 2.32843 0.671573 3 1.5 3Z' fill='black' />
              <path d='M6.5 3C7.32843 3 8 2.32843 8 1.5C8 0.671573 7.32843 0 6.5 0C5.67157 0 5 0.671573 5 1.5C5 2.32843 5.67157 3 6.5 3Z' fill='black' />
              <path d='M1.5 8C2.32843 8 3 7.32843 3 6.5C3 5.67157 2.32843 5 1.5 5C0.671573 5 0 5.67157 0 6.5C0 7.32843 0.671573 8 1.5 8Z' fill='black' />
              <path d='M6.5 8C7.32843 8 8 7.32843 8 6.5C8 5.67157 7.32843 5 6.5 5C5.67157 5 5 5.67157 5 6.5C5 7.32843 5.67157 8 6.5 8Z' fill='black' />
              <path d='M1.5 13C2.32843 13 3 12.3284 3 11.5C3 10.6716 2.32843 10 1.5 10C0.671573 10 0 10.6716 0 11.5C0 12.3284 0.671573 13 1.5 13Z' fill='black' />
              <path d='M6.5 13C7.32843 13 8 12.3284 8 11.5C8 10.6716 7.32843 10 6.5 10C5.67157 10 5 10.6716 5 11.5C5 12.3284 5.67157 13 6.5 13Z' fill='black' />
            </DragIcon>
          </DragHandle>
          <ArchiveButton
            onClick={handleArchive}
            title='Archive note'
          >
            <ArchiveIcon viewBox='0 0 18 18'>
              <path d='M16 2V16H2V2H16ZM16 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0Z' fill='black' />
            </ArchiveIcon>
          </ArchiveButton>
        </>
      }
      <Content
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: initialValue }}
        onInput={(e: ChangeEvent<HTMLDivElement>) => handleInput(e.target.innerText)}
        placeholder={transientNote.isAdder ? 'Add a note...' : undefined}
      />
      {!transientNote.isAdder &&
        <DeleteButton
          hoverContainer={Container}
          onClick={handleDelete}
          title='Delete note'
        >
          <DeleteIcon viewBox='0 0 14 14'>
            <path d='M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z' fill='black' />
          </DeleteIcon>
        </DeleteButton>
      }
    </Container>
  );
};

export {
  Note,
  type NoteProps,
  ArchiveButton,
  ArchiveIcon,
  Content,
  DeleteButton,
  DeleteIcon,
};

// import { ChangeEvent, FC, MutableRefObject, useContext, useState } from 'react';
// import { Reorder, useDragControls, useMotionValue } from 'framer-motion';
// import styled from 'styled-components/macro';

// import { useNoteShadow } from 'src/hooks';
// import { Note as NoteType, PeopleActionType } from 'src/types';
// import { PeopleCtx } from 'src/util';

// const Container = styled(({ isFocused, ...props }) => (
//   <Reorder.Item {...props} />
// )) <{ isFocused: boolean }>`
//   display: flex;
//   border-top: 1px solid transparent;
//   border-bottom: 1px solid transparent;
//   position: relative;
//   background-color: #fff;
//   ${({ isFocused }) => isFocused && `
//     border-top: 1px solid #ddd;
//     border-bottom: 1px solid #ddd;
//   `}
// `;

// const DragHandle = styled.div<{ isFocused: boolean }>`
//   display: ${({ isFocused }) => isFocused ? 'flex' : 'none'};;
//   align-items: center;
//   justify-content: center;
//   flex-shrink: 0;
//   align-self: stretch;
//   cursor: grab;
//   position: absolute;
//   top: 5px;
//   left: 0px;
//   width: 16px;
//   height: 24px;
//   &:active {
//     cursor: grabbing;
//   }
//   ${Container}:hover & {
//     display: flex;
//   }
// `;

// const DragIcon = styled.svg`
//   height: 16px;
//   path {
//     fill: #999;
//   }
// `;

// const Content = styled.div`
//   outline: none;
//   width: 100%;
//   padding: 6px 0 6px 20px;
//   font-size: 14px;
//   line-height: 1.6;
// `;

// const DeleteButton = styled.button`
//   visibility: hidden;
//   display: flex;
//   box-sizing: border-box;
//   width: 24px;
//   height: 19.6px;
//   align-items: center;
//   justify-content: center;
//   position: absolute;
//   right: 0;
//   cursor: pointer;
//   flex-shrink: 0;
//   border: 0;
//   padding: 0;
//   background: transparent;
//   ${Container}:hover & {
//     visibility: visible;
//   }
// `;

// const DeleteIcon = styled.svg`
//   width: 14px;
//   height: 14px;
//   stroke: #777;
//   ${DeleteButton}:active & {
//     stroke: #444;
//   }
// `;

// interface NoteProps {
//   note: NoteType;
//   personId: string;
//   notesRef: MutableRefObject<HTMLUListElement>;
// }

// const Note: FC<NoteProps> = ({ note, personId, notesRef }) => {

//   const { dispatch } = useContext(PeopleCtx)!;
//   const [isFocused, setIsFocused] = useState(false);
//   const [initialValue] = useState(note.content);
//   const y = useMotionValue(0);
//   const boxShadow = useNoteShadow(y);
//   const dragControls = useDragControls();

//   return (
//     <Container
//       {...{ isFocused }}
//       value={note}
//       style={{ boxShadow, y }}
//       transition={{
//         duration: 0.2,
//         ease: 'easeInOut',
//       }}
//       dragListener={false}
//       dragControls={dragControls}
//       dragConstraints={notesRef}
//       dragElastic={0}
//       whileDrag={{ scale: 1.02 }}
//     >
//       <DragHandle
//         {...{ isFocused }}
//         onPointerDown={e => dragControls.start(e)
//         }>
//         <DragIcon viewBox='0 0 17 28'>
//           <path d='M6.5293 3.52937C6.5293 5.18622 5.18628 6.52949 3.52942 6.52949C1.87257 6.52949 0.529297 5.18622 0.529297 3.52937C0.529297 1.87251 1.87257 0.529494 3.52942 0.529494C5.18628 0.529494 6.5293 1.87251 6.5293 3.52937Z' fill='black' />
//           <path d='M6.5293 13.8235C6.5293 15.4802 5.18628 16.8235 3.52942 16.8235C1.87257 16.8235 0.529297 15.4802 0.529297 13.8235C0.529297 12.1667 1.87257 10.8235 3.52942 10.8235C5.18628 10.8235 6.5293 12.1667 6.5293 13.8235Z' fill='black' />
//           <path d='M6.5293 24.1179C6.5293 25.7748 5.18628 27.1178 3.52942 27.1178C1.87257 27.1178 0.529297 25.7748 0.529297 24.1179C0.529297 22.4611 1.87257 21.1178 3.52942 21.1178C5.18628 21.1178 6.5293 22.4611 6.5293 24.1179Z' fill='black' />
//           <path d='M16.8236 3.52937C16.8236 5.18622 15.4803 6.52949 13.8235 6.52949C12.1666 6.52949 10.8236 5.18622 10.8236 3.52937C10.8236 1.87251 12.1666 0.529494 13.8235 0.529494C15.4803 0.529494 16.8236 1.87251 16.8236 3.52937Z' fill='black' />
//           <path d='M16.8236 13.8235C16.8236 15.4802 15.4803 16.8235 13.8235 16.8235C12.1666 16.8235 10.8236 15.4802 10.8236 13.8235C10.8236 12.1667 12.1666 10.8235 13.8235 10.8235C15.4803 10.8235 16.8236 12.1667 16.8236 13.8235Z' fill='black' />
//           <path d='M16.8236 24.1179C16.8236 25.7748 15.4803 27.1178 13.8235 27.1178C12.1666 27.1178 10.8236 25.7748 10.8236 24.1179C10.8236 22.4611 12.1666 21.1178 13.8235 21.1178C15.4803 21.1178 16.8236 22.4611 16.8236 24.1179Z' fill='black' />
//         </DragIcon>
//       </DragHandle>
//       <Content
//         onFocus={() => setIsFocused(true)}
//         onBlur={() => setIsFocused(false)}
//         contentEditable
//         suppressContentEditableWarning
//         dangerouslySetInnerHTML={{ __html: initialValue }}
//         onInput={(e: ChangeEvent<HTMLUListElement>) => dispatch({
//           type: PeopleActionType.EDIT_NOTE,
//           payload: { personId, noteId: note.id, content: e.target.innerText },
//         })}
//       />
//       <DeleteButton
//         onClick={() => dispatch({
//           type: PeopleActionType.DELETE_NOTE,
//           payload: { personId, noteId: note.id },
//         })}
//         title='Delete note'
//       >
//         <DeleteIcon
//           fill='none'
//           viewBox='0 0 24 24'
//         >
//           <path
//             strokeLinecap='round'
//             strokeLinejoin='round'
//             strokeWidth={2}
//             d='M6 18L18 6M6 6l12 12'
//           />
//         </DeleteIcon>
//       </DeleteButton>
//     </Container>
//   );
// };

// export {
//   Note,
//   type NoteProps,
// };
