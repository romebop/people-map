import { Connection } from './Connection';
import { Note } from './Note';

export interface Person {
  id: string;
  name: string;
  notes: Note[];
  createdDate: Date;
  isPinned: boolean;
  showConnections: boolean;
  connections: Connection[]
}
