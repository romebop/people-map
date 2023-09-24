import { Person } from 'src/types';
import { parseDates } from 'src/util';

import demoData from 'src/util/demo-data.json';

function getDemoData(): Person[] {
  parseDates(demoData);
  return demoData as unknown as Person[];
}

export { getDemoData };