import { ChangeEvent, FC, MutableRefObject, useContext, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import styled from 'styled-components/macro';

import { Note as NoteType, PeopleActionType } from 'src/types';
import { PeopleCtx } from 'src/util';

const Container = styled(({ isFocused, ...props }) => (
  <Reorder.Item {...props} />
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

const DragNoteHandle = styled.div<{ isFocused: boolean }>`
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

const DragNoteIcon = styled.svg`
  height: 16px;
  path {
    fill: #999;
  }
`;

const NoteContent = styled.div`
  outline: none;
  width: 100%;
  padding: 6px 0 6px 20px;
  font-size: 14px;
  line-height: 1.6;
`;

const DeleteNoteButton = styled.button`
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
  ${Container}:hover & {
    visibility: visible;
  }
`;

const DeleteNoteIcon = styled.svg`
  width: 14px;
  height: 14px;
  stroke: #777;
  ${DeleteNoteButton}:active & {
    stroke: #444;
  }
`;

interface NoteProps {
  personId: string;
  note: NoteType;
  notesRef: MutableRefObject<HTMLUListElement | null>;
}

const Note: FC<NoteProps> = ({ personId, note, notesRef }) => {

  const { dispatch } = useContext(PeopleCtx)!;
  const [isFocused, setIsFocused] = useState(false);
  const [initialValue] = useState(note.content);
  const dragControls = useDragControls();

  return (
    <Container
      {...{ isFocused }}
      value={note}
      transition={{
        duration: 0,
        ease: 'easeInOut',
      }}
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={notesRef}
      dragElastic={0}
      whileDrag={{ scale: 1.02 }}
    >
      <DragNoteHandle
        {...{ isFocused }}
        onPointerDown={e => dragControls.start(e)}
        title='Drag note'
      >
        <DragNoteIcon viewBox='0 0 17 28'>
          <path d='M6.5293 3.52937C6.5293 5.18622 5.18628 6.52949 3.52942 6.52949C1.87257 6.52949 0.529297 5.18622 0.529297 3.52937C0.529297 1.87251 1.87257 0.529494 3.52942 0.529494C5.18628 0.529494 6.5293 1.87251 6.5293 3.52937Z' fill='black' />
          <path d='M6.5293 13.8235C6.5293 15.4802 5.18628 16.8235 3.52942 16.8235C1.87257 16.8235 0.529297 15.4802 0.529297 13.8235C0.529297 12.1667 1.87257 10.8235 3.52942 10.8235C5.18628 10.8235 6.5293 12.1667 6.5293 13.8235Z' fill='black' />
          <path d='M6.5293 24.1179C6.5293 25.7748 5.18628 27.1178 3.52942 27.1178C1.87257 27.1178 0.529297 25.7748 0.529297 24.1179C0.529297 22.4611 1.87257 21.1178 3.52942 21.1178C5.18628 21.1178 6.5293 22.4611 6.5293 24.1179Z' fill='black' />
          <path d='M16.8236 3.52937C16.8236 5.18622 15.4803 6.52949 13.8235 6.52949C12.1666 6.52949 10.8236 5.18622 10.8236 3.52937C10.8236 1.87251 12.1666 0.529494 13.8235 0.529494C15.4803 0.529494 16.8236 1.87251 16.8236 3.52937Z' fill='black' />
          <path d='M16.8236 13.8235C16.8236 15.4802 15.4803 16.8235 13.8235 16.8235C12.1666 16.8235 10.8236 15.4802 10.8236 13.8235C10.8236 12.1667 12.1666 10.8235 13.8235 10.8235C15.4803 10.8235 16.8236 12.1667 16.8236 13.8235Z' fill='black' />
          <path d='M16.8236 24.1179C16.8236 25.7748 15.4803 27.1178 13.8235 27.1178C12.1666 27.1178 10.8236 25.7748 10.8236 24.1179C10.8236 22.4611 12.1666 21.1178 13.8235 21.1178C15.4803 21.1178 16.8236 22.4611 16.8236 24.1179Z' fill='black' />
        </DragNoteIcon>
      </DragNoteHandle>
      <NoteContent
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: initialValue }}
        onInput={(e: ChangeEvent<HTMLDivElement>) => dispatch({
          type: PeopleActionType.EDIT_NOTE,
          payload: { personId, noteId: note.id, content: e.target.innerText },
        })}
      />
      <DeleteNoteButton
        onClick={() => dispatch({
          type: PeopleActionType.DELETE_NOTE,
          payload: { personId, noteId: note.id },
        })}
        title='Delete note'
      >
        <DeleteNoteIcon
          fill='none'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </DeleteNoteIcon>
      </DeleteNoteButton>
    </Container>
  );
};

export {
  Note,
  type NoteProps,
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

// const DragNoteHandle = styled.div<{ isFocused: boolean }>`
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

// const DragNoteIcon = styled.svg`
//   height: 16px;
//   path {
//     fill: #999;
//   }
// `;

// const NoteContent = styled.div`
//   outline: none;
//   width: 100%;
//   padding: 6px 0 6px 20px;
//   font-size: 14px;
//   line-height: 1.6;
// `;

// const DeleteNoteButton = styled.button`
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

// const DeleteNoteIcon = styled.svg`
//   width: 14px;
//   height: 14px;
//   stroke: #777;
//   ${DeleteNoteButton}:active & {
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
//       <DragNoteHandle
//         {...{ isFocused }}
//         onPointerDown={e => dragControls.start(e)
//         }>
//         <DragNoteIcon viewBox='0 0 17 28'>
//           <path d='M6.5293 3.52937C6.5293 5.18622 5.18628 6.52949 3.52942 6.52949C1.87257 6.52949 0.529297 5.18622 0.529297 3.52937C0.529297 1.87251 1.87257 0.529494 3.52942 0.529494C5.18628 0.529494 6.5293 1.87251 6.5293 3.52937Z' fill='black' />
//           <path d='M6.5293 13.8235C6.5293 15.4802 5.18628 16.8235 3.52942 16.8235C1.87257 16.8235 0.529297 15.4802 0.529297 13.8235C0.529297 12.1667 1.87257 10.8235 3.52942 10.8235C5.18628 10.8235 6.5293 12.1667 6.5293 13.8235Z' fill='black' />
//           <path d='M6.5293 24.1179C6.5293 25.7748 5.18628 27.1178 3.52942 27.1178C1.87257 27.1178 0.529297 25.7748 0.529297 24.1179C0.529297 22.4611 1.87257 21.1178 3.52942 21.1178C5.18628 21.1178 6.5293 22.4611 6.5293 24.1179Z' fill='black' />
//           <path d='M16.8236 3.52937C16.8236 5.18622 15.4803 6.52949 13.8235 6.52949C12.1666 6.52949 10.8236 5.18622 10.8236 3.52937C10.8236 1.87251 12.1666 0.529494 13.8235 0.529494C15.4803 0.529494 16.8236 1.87251 16.8236 3.52937Z' fill='black' />
//           <path d='M16.8236 13.8235C16.8236 15.4802 15.4803 16.8235 13.8235 16.8235C12.1666 16.8235 10.8236 15.4802 10.8236 13.8235C10.8236 12.1667 12.1666 10.8235 13.8235 10.8235C15.4803 10.8235 16.8236 12.1667 16.8236 13.8235Z' fill='black' />
//           <path d='M16.8236 24.1179C16.8236 25.7748 15.4803 27.1178 13.8235 27.1178C12.1666 27.1178 10.8236 25.7748 10.8236 24.1179C10.8236 22.4611 12.1666 21.1178 13.8235 21.1178C15.4803 21.1178 16.8236 22.4611 16.8236 24.1179Z' fill='black' />
//         </DragNoteIcon>
//       </DragNoteHandle>
//       <NoteContent
//         onFocus={() => setIsFocused(true)}
//         onBlur={() => setIsFocused(false)}
//         contentEditable
//         suppressContentEditableWarning
//         dangerouslySetInnerHTML={{ __html: initialValue }}
//         onInput={(e: ChangeEvent<HTMLDivElement>) => dispatch({
//           type: PeopleActionType.EDIT_NOTE,
//           payload: { personId, noteId: note.id, content: e.target.innerText },
//         })}
//       />
//       <DeleteNoteButton
//         onClick={() => dispatch({
//           type: PeopleActionType.DELETE_NOTE,
//           payload: { personId, noteId: note.id },
//         })}
//         title='Delete note'
//       >
//         <DeleteNoteIcon
//           fill='none'
//           viewBox='0 0 24 24'
//         >
//           <path
//             strokeLinecap='round'
//             strokeLinejoin='round'
//             strokeWidth={2}
//             d='M6 18L18 6M6 6l12 12'
//           />
//         </DeleteNoteIcon>
//       </DeleteNoteButton>
//     </Container>
//   );
// };

// export {
//   Note,
//   type NoteProps,
// };
