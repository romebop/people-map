import produce from 'immer';
import { createContext } from 'react';

import { parseDates } from 'src/util';
import {
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
    case PeopleActionType.NEW_PERSON:
      const { id } = payload;
      return produce(people, draftState => {
        const newPerson: Person = {
          id,
          isPinned: false,
          name: '',
          communities: [],
          connections: [],
          notes: [],
          archive: [],
          showArchive: true,
          createdDate: new Date(),
        };
        draftState.push(newPerson);
      });
    case PeopleActionType.COPY_PERSON: {
      const { personId, newPersonId, newNoteIds, newArchiveIds } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === personId)!;
        const newPerson: Person = {
          id: newPersonId,
          isPinned: false,
          name: `${person.name} Copy`,
          communities: [...person.communities],
          connections: [...person.connections],
          notes: [...person.notes.map((n, i) => ({ ...n, id: newNoteIds[i], createdDate: new Date() }))],
          archive: [...person.archive.map((n, i) => ({ ...n, id: newArchiveIds[i], createdDate: new Date() }))],
          showArchive: true,
          createdDate: new Date(),
        };
        newPerson.connections.forEach(c => {
          const target = draftState.find(p => p.id === c)!;
          target.connections.push(newPersonId);
        });
        draftState.push(newPerson);
      });
    }
    case PeopleActionType.DELETE_PERSON: {
      const { id } = payload;
      return produce(people, draftState => {
        const idx = draftState.findIndex(p => p.id === id);
        draftState.splice(idx, 1);
        draftState.forEach(p => {
          p.connections = p.connections.filter(c => c !== id);
        });
      });
    }
    case PeopleActionType.PIN_PERSON: {
      const { id } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === id)!;
        person.isPinned = true;
      });
    }
    case PeopleActionType.UNPIN_PERSON: {
      const { id } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === id)!;
        person.isPinned = false;
      });
    }
    case PeopleActionType.EDIT_NAME: {
      const { id, name } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === id)!;
        person.name = name;
      });
    }
    case PeopleActionType.JOIN_COMMUNITY: {
      const { personId, community } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === personId)!;
        person.communities.push(community);
      });
    }
    case PeopleActionType.LEAVE_COMMUNITY: {
      const { personId, community } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === personId)!;
        const communityIdx = person.communities.findIndex(c => c === community);
        person.communities.splice(communityIdx!, 1);
      });
    }
    case PeopleActionType.ADD_CONNECTION: {
      const { personId, connectionId } = payload;
      return produce(people, draftState => {
        const person1 = draftState.find(p => p.id === personId)!;
        person1.connections.push(connectionId);
        const person2 = draftState.find(p => p.id === connectionId)!;
        person2.connections.push(personId);
        // TODO: sort?
      });
    }
    case PeopleActionType.DELETE_CONNECTION: {
      const { personId, connectionId } = payload;
      return produce(people, draftState => {
        const person1 = draftState.find(p => p.id === personId)!;
        const connectionIdx1 = person1.connections.findIndex(c => c === connectionId);
        person1.connections.splice(connectionIdx1!, 1);
        const person2 = draftState.find(p => p.id === connectionId)!;
        const connectionIdx2 = person2.connections.findIndex(c => c === personId);
        person2.connections.splice(connectionIdx2!, 1);
      });
    }
    case PeopleActionType.EDIT_NOTE: {
      const { personId, noteId, content } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === personId)!;
        const note = person.notes.find(n => n.id === noteId)!;
        note.content = content;
      });
    }
    case PeopleActionType.ADD_NOTE: {
      const { id, note } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === id)!;
        person.notes.push(note);
      });
    }
    case PeopleActionType.DELETE_NOTE: {
      const { personId, noteId } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === personId)!;
        const noteIdx = person.notes.findIndex(n => n.id === noteId);
        person.notes.splice(noteIdx, 1);
      });
    }
    case PeopleActionType.REORDER_NOTES: {
      const { id, notes } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === id)!;
        person.notes = notes;
      });
    }
    case PeopleActionType.ARCHIVE_NOTE: {
      const { personId, noteId } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === personId)!;
        const noteIdx = person.notes.findIndex(n => n.id === noteId);
        const note = person.notes.splice(noteIdx, 1)[0];
        person.archive.push(note);
      });
    }
    case PeopleActionType.UNARCHIVE_NOTE: {
      const { personId, noteId } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === personId)!;
        const archiveIdx = person.archive.findIndex(n => n.id === noteId);
        const note = person.archive.splice(archiveIdx, 1)[0];
        person.notes.push(note);
      });
    }
    case PeopleActionType.EDIT_ARCHIVED_NOTE: {
      const { personId, noteId, content } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === personId)!;
        const note = person.archive.find(n => n.id === noteId)!;
        note.content = content;
      });
    }
    case PeopleActionType.DELETE_ARCHIVED_NOTE: {
      const { personId, noteId } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === personId)!;
        const noteIdx = person.archive.findIndex(n => n.id === noteId);
        person.archive.splice(noteIdx, 1);
      });
    }
    case PeopleActionType.TOGGLE_ARCHIVE: {
      const { id } = payload;
      return produce(people, draftState => {
        const person = draftState.find(p => p.id === id)!;
        person.showArchive = !person.showArchive;
      });
    }
    case PeopleActionType.SET_PEOPLE: {
      const { newPeople } = payload;
      return newPeople;
    }
    case PeopleActionType.CLEAR_PEOPLE: {
      return [];
    }
    default:
      return people;
  }
}

const PeopleCtx = createContext<PeopleCtxInterface | null>(null);

export { init, PeopleCtx, peopleReducer };
