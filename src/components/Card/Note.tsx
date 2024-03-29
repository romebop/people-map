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

const AddNoteIcon =  styled.svg`
  height: 14px;
  position: absolute;
  left: 28px;
  top: 9px;
  opacity: 0.45;
`

const DragHandle = styled.div<{ isFocused: boolean }>`
  display: none;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: stretch;
  cursor: grab;
  position: absolute;
  top: 4px;
  left: 0px;
  width: 26px;
  height: 26px;
  &:active {
    cursor: grabbing;
  }
  ${Container}:hover & {
    display: flex;
  }
`;

const DragIcon = styled.svg`
  height: 16px;
  opacity: 0.4;
`;

const ArchiveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: absolute;
  top: 10px;
  left: 28px;
  width: 14px;
  height: 14px;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

const ArchiveIcon = styled.svg`
  opacity: 0.5;
  ${ArchiveButton}:hover & {
    opacity: 0.9;
  }
`;

const Content = styled.div<{ isInArchive?: boolean }>`
  outline: none;
  width: 100%;
  padding: 6px 44px 6px 52px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  &[placeholder]:empty:before {
    content: attr(placeholder);
    color: #aaa;
  }
  ${({ isInArchive }) => isInArchive && `
    text-decoration: line-through;
  `}
`;

const DeleteButton = styled.button < { isFocused: boolean, hoverContainer: StyledComponent<any, any>, isInArchive?: boolean }>`
  width: 26px;
  height: 26px;
  box-sizing: border-box;
  display: none;
  ${({ isFocused }) => isFocused && `
    display: flex;
  `}
  ${({ hoverContainer }) => `
    ${hoverContainer}:hover & {
      display: flex;
    }
  `}
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: absolute;
  right: 10px;
  top: 4px;
  border: 0;
  padding: 0;
  background: transparent;
  border-radius: 3px;
  cursor: pointer;
  &:hover {
    background-color: ${({ isInArchive }) => isInArchive ? '#fff' : '#f4f4f4'}
  }
`;

const DeleteIcon = styled.svg`
  height: 9px;
  opacity: 0.6;
  ${DeleteButton}:hover & {
    opacity: 0.7;
  }
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
        { id: crypto.randomUUID(), content: '', isAdder: true },
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
      {transientNote.isAdder
        ? <AddNoteIcon viewBox='0 0 12 12'>
            <path d='M11.25 6.75H6.75V11.25H5.25V6.75H0.75V5.25H5.25V0.75H6.75V5.25H11.25V6.75Z' fill='black' />
          </AddNoteIcon>
        : <>
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
        placeholder={transientNote.isAdder ? 'New note' : undefined}
      />
      {!transientNote.isAdder &&
        <DeleteButton
          { ...{ isFocused }}
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
