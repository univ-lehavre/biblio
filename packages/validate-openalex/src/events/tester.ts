import { filterPending } from './filter';
import type { PendingOptions } from '../actions/types';
import { IEvent } from './types';

const hasPending = (events: IEvent[], opts: PendingOptions): boolean =>
  filterPending(events, opts).length > 0;

const hasORCID = (events: IEvent[], orcid: string): boolean =>
  events.some(e => e.entity === 'author' && e.id === orcid);

const isUnique = (events: IEvent[]): boolean => {
  const ids = new Set<string>();
  for (const event of events) {
    if (ids.has(event.uuid)) return true;
    ids.add(event.uuid);
  }
  return false;
};

const hasDuplicates = (existing: IEvent[], newItems: IEvent[]): boolean => {
  const newIDs = new Set<string>(newItems.map(e => e.uuid));
  for (const event of existing) {
    if (newIDs.has(event.uuid)) return true;
  }
  return false;
};

export { hasPending, hasORCID, isUnique, hasDuplicates };
