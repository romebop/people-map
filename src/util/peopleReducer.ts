import produce from 'immer';
import { createContext } from 'react';
import { v4 as uuid } from 'uuid';

import { parseDates } from 'src/util';
import {
  Note,
  Person,
  PeopleAction,
  PeopleActionType,
  PeopleCtxInterface,
 } from 'src/types';

function init(initialVal: Person[]): Person[] {
  const data = localStorage.getItem('data');
  if (data !== null) {
    const parsedData = JSON.parse(data);
    parseDates(parsedData);
    return parsedData;
  }
  return initialVal;
}

function peopleReducer(people: Person[], { type, payload }: PeopleAction): Person[] {
  switch (type) {
    case PeopleActionType.ADD_PERSON:
      return produce(people, draftState => {
        const newPerson: Person = {
          id: uuid(),
          name: payload.name,
          notes: [],
          createdDate: new Date(),
          isPinned: false,
          showConnections: false,
          connections: [],
        };
        draftState.push(newPerson);
      });
    case PeopleActionType.DELETE_PERSON:
      return produce(people, draftState => {
        const idx = draftState.findIndex(p => p.id === payload.id);
        draftState.splice(idx, 1);
        draftState.forEach(p => {
          p.connections = p.connections.filter(c => c.id !== payload.id);
        });
      });
    case PeopleActionType.PIN_PERSON:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.id)!;
        person.isPinned = true;
      });
    case PeopleActionType.UNPIN_PERSON:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.id)!;
        person.isPinned = false;
      });
    case PeopleActionType.SHOW_CONNECTIONS:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.id)!;
        person.showConnections = true;
      });
    case PeopleActionType.HIDE_CONNECTIONS:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.id)!;
        person.showConnections = false;
      });
    case PeopleActionType.ADD_CONNECTION:
      return produce(people, draftState => {
        const person1 = draftState.find(p => p.id === payload.id)!;
        person1.connections.push(payload.connection);
        const person2 = draftState.find(p => p.id === payload.connection.zid)!;
        person2.connections.push({ name: person1.name!, id: payload.id });
        // TODO: sort?
      });
    case PeopleActionType.DELETE_CONNECTION:
      return produce(people, draftState => {
        const person1 = draftState.find(p => p.id === payload.personId)!;
        const connectionIdx1 = person1.connections.findIndex(c => c.id === payload.connectionId);
        person1.connections.splice(connectionIdx1!, 1);
        const person2 = draftState.find(p => p.id === payload.connectionId)!;
        const connectionIdx2 = person2.connections.findIndex(c => c.id === payload.personId);
        person2.connections.splice(connectionIdx2!, 1);
      });
    case PeopleActionType.EDIT_NOTE:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.personId)!;
        const note = person.notes.find(n => n.id === payload.noteId)!;
        note.content = payload.content;
      });
    case PeopleActionType.ADD_NOTE:
      return produce(people, draftState => {
        const newNote: Note = {
          id: uuid(),
          content: payload.content,
          createdDate: new Date(),
        };
        const person = draftState.find(p => p.id === payload.id)!;
        person.notes.push(newNote);
      });
    case PeopleActionType.DELETE_NOTE:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.personId)!;
        const noteIdx = person.notes.findIndex(n => n.id === payload.noteId);
        person.notes.splice(noteIdx, 1);
      });
    case PeopleActionType.REORDER_NOTES:
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === payload.id)!;
        person.notes = payload.notes;
      });
    default:
      return people;
  }
}

const PeopleCtx = createContext<PeopleCtxInterface | null>(null);

export { init, PeopleCtx, peopleReducer };