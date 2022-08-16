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
  createdDate: Date;
  isPinned: boolean;
  showConnections: boolean;
  connections: Connection[]
}

export {
  type Connection,
  type Note,
  type Person,
}