import { Person } from 'src/types';

export * from './getDemoData';
export * from './parseDates';
export * from './peopleReducer';

export function getAllCommunities(people: Person[]): string[] {
  return people.map(p => p.communities).flat().filter((c, i, a) => a.indexOf(c) === i);
}

export function getNameById(people: Person[], id: string): string {
  const nameIdPairs = people.map(({ name, id }) => ({ name, id })); 
  const idx = nameIdPairs.sort((a, b) => a.name.localeCompare(b.name))
    .findIndex(c => c.id === id);
  return nameIdPairs[idx].name;
}

function serializeLink(ids: [string, string]): string {
  return ids.sort().join(':');
}

export function getConnectionCount(people: Person[]): number {
  const links = new Set<string>();
  for (const person of people) {
    for (const connectionId of person.connections) {
      const link = serializeLink([person.id, connectionId]);
      if (people.find(p => p.id === person.id) && people.find(p => p.id === connectionId)) {
        links.add(link);
      }
    }
  }
  return links.size;
}

export function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
