import { filterPending } from './filter';
import { IEvent } from './types';

const hasPending = (events: IEvent[], opts: Partial<IEvent>): boolean =>
  filterPending(events, opts).length > 0;

const hasORCID = (events: IEvent[], orcid: string): boolean =>
  events.some(e => e.entity === 'author' && e.id === orcid);

const isUnique = (events: IEvent[]): boolean => {
  const ids = new Set<string>();
  for (const event of events) {
    if (ids.has(event.dataIntegrity)) return true;
    ids.add(event.dataIntegrity);
  }
  return false;
};

const hasDuplicates = (existing: IEvent[], newItems: IEvent[]): boolean => {
  const newIDs = new Set<string>(newItems.map(e => e.dataIntegrity));
  for (const event of existing) {
    if (newIDs.has(event.dataIntegrity)) return true;
  }
  return false;
};

export { hasPending, hasORCID, isUnique, hasDuplicates };
