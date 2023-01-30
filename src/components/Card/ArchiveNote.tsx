import { format } from 'date-fns';
import {
  ChangeEvent,
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import styled from 'styled-components/macro';

import { ArchiveButton, ArchiveIcon, Content, DeleteButton, DeleteIcon } from './Note';
import { TransientNote } from './NotesArea';
import { Note, PeopleActionType } from 'src/types';
import { PeopleCtx } from 'src/util';

const Container = styled.div<{ isFocused: boolean }>`
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

interface ArchiveNoteProps {
  note: Note;
  personId: string;
  setTransientNotes: Dispatch<SetStateAction<TransientNote[]>>
}

const ArchiveNote: FC<ArchiveNoteProps> = ({ note, personId, setTransientNotes }) => {

  const { dispatch } = useContext(PeopleCtx)!;
  const [isFocused, setIsFocused] = useState(false);
  const [initialValue] = useState(note.content);

  const handleArchive = () => {
    setTransientNotes(transientNotes => [
      ...transientNotes.slice(0, -1),
      { ...note, isAdder: false },
      ...transientNotes.slice(-1),
    ]);
    dispatch({
      type: PeopleActionType.UNARCHIVE_NOTE,
      payload: { personId, noteId: note.id },
    });
  };

  return (
    <Container
      {...{ isFocused }}
      title={note.createdDate && format(note.createdDate, "MM/dd/yyyy hh:mm aaaaa'm")}
    >
      <ArchiveButton
        onClick={handleArchive}
        title='Unarchive note'
      >
        <ArchiveIcon viewBox='0 0 18 18'>
          <path d='M16 0H2C0.9 0 0 0.9 0 2V16C0 17.1 0.9 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0ZM16 16H2V2H16V16Z' fill='black' />
          <path d='M15 6.00001L13.6 4.60001L7 11.2L4.4 8.60001L3 10L7 14L11 10L15 6.00001Z' fill='black' />
        </ArchiveIcon>
      </ArchiveButton>
      <Content
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        contentEditable
        suppressContentEditableWarning
        dangerouslySetInnerHTML={{ __html: initialValue }}
        onInput={(e: ChangeEvent<HTMLDivElement>) => dispatch({
          type: PeopleActionType.EDIT_ARCHIVED_NOTE,
          payload: { personId, noteId: note.id, content: e.target.innerText },
        })}
      />
      <DeleteButton
        hoverContainer={Container}
        onClick={() => dispatch({
          type: PeopleActionType.DELETE_ARCHIVED_NOTE,
          payload: { personId, noteId: note.id },
        })}
        title='Delete note'
      >
        <DeleteIcon
          fill='none'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </DeleteIcon>
      </DeleteButton>
    </Container>
  );
};

export {
  ArchiveNote,
  type ArchiveNoteProps,
};
