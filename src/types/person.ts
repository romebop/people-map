import { Note } from './Note';

export interface Person {
  id: string;
  name: string;
  notes: Note[];
  createdDate: Date;
}