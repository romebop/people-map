import { Dispatch } from 'react';

interface Connection {
  id: string;
  name: string;
}

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
  createdDate: Date;
  isPinned: boolean;
  showConnections: boolean;
  connections: Connection[]
}

enum PeopleActionType {
  ADD_PERSON = 'ADD_PERSON',
  DELETE_PERSON = 'DELETE_PERSON',
  PIN_PERSON = 'PIN_PERSON',
  UNPIN_PERSON = 'UNPIN_PERSON',
  SHOW_CONNECTIONS = 'SHOW_CONNECTIONS',
  HIDE_CONNECTIONS = 'HIDE_CONNECTIONS',
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
  // UPLOAD_PEOPLE = 'UPLOAD_PEOPLE',
}

interface PeopleAction {
  type: PeopleActionType;
  payload?: any; // TODO: type
}

interface PeopleCtxInterface {
  state: Person[];
  staleState: Person[];
  allConnections: Connection[];
  dispatch: Dispatch<PeopleAction>;
}

export {
  type Connection,
  type Note,
  type PeopleAction,
  PeopleActionType,
  type PeopleCtxInterface,
  type Person,
}
