import { Dispatch } from 'react';

interface Note {
  id: string;
  content: string;
  createdDate: Date;
}

interface Person {
  id: string;
  name: string;
  notes: Note[];
  archive: Note[];
  showArchive: boolean;
  createdDate: Date;
  isPinned: boolean;
  connections: string[]
}

enum PeopleActionType {
  NEW_PERSON = 'NEW_PERSON',
  DELETE_PERSON = 'DELETE_PERSON',
  PIN_PERSON = 'PIN_PERSON',
  UNPIN_PERSON = 'UNPIN_PERSON',
  ADD_CONNECTION = 'ADD_CONNECTION',
  DELETE_CONNECTION = 'DELETE_CONNECTION',
  EDIT_NOTE = 'EDIT_NOTE',
  ADD_NOTE = 'ADD_NOTE',
  DELETE_NOTE = 'DELETE_NOTE',
  REORDER_NOTES = 'REORDER_NOTES',
  ARCHIVE_NOTE = 'ARCHIVE_NOTE',
  UNARCHIVE_NOTE = 'UNARCHIVE_NOTE',
  EDIT_ARCHIVED_NOTE = 'EDIT_ARCHIVED_NOTE',
  DELETE_ARCHIVED_NOTE = 'DELETE_ARCHIVED_NOTE',
  TOGGLE_ARCHIVE = 'TOGGLE_ARCHIVE',
  EDIT_NAME = 'EDIT_NAME',
  // UPLOAD_PEOPLE = 'UPLOAD_PEOPLE',
}

interface PeopleAction {
  type: PeopleActionType;
  payload?: any; // TODO: type
}

interface PeopleCtxInterface {
  state: Person[];
  staleState: Person[];
  dispatch: Dispatch<PeopleAction>;
}

export {
  type Note,
  type PeopleAction,
  PeopleActionType,
  type PeopleCtxInterface,
  type Person,
}
