import type { ORCID } from '@univ-lehavre/biblio-openalex-types';
import type { IEvent } from './types';

const isInteresting = (event: IEvent, opts: Partial<IEvent>): boolean => {
  const keys = Object.keys(opts) as (keyof IEvent)[];
  if (keys.length === 0) return true;
  for (const key of keys) {
    if (event[key] !== opts[key]) return false;
  }
  return true;
};

const filterEventsByAttributes = (events: IEvent[], opts: Partial<IEvent>): IEvent[] =>
  events.filter(event => isInteresting(event, opts));

const filterPending = (events: IEvent[], opts: Partial<IEvent>): IEvent[] =>
  filterEventsByAttributes(events, {
    ...opts,
    status: 'pending',
  });

const filterAcceptedAuthorDisplayNameAlternatives = (events: IEvent[], orcid: ORCID): IEvent[] =>
  filterEventsByAttributes(events, {
    id: orcid,
    entity: 'author',
    field: 'display_name_alternatives',
    status: 'accepted',
  });

/**
 * Filtre les événements en double (en se ) avant de les ajouter au store.
 * @param existing Existing events in the store
 * @param updated New events to add
 * @returns
 */
const filterDuplicates = (existing: IEvent[], updated: IEvent[]): IEvent[] => {
  const uuids = updated.map(e => e.dataIntegrity);
  const unchanged = existing.filter(e => !uuids.includes(e.dataIntegrity));
  return [...unchanged, ...updated];
};

export {
  filterPending,
  filterEventsByAttributes,
  filterAcceptedAuthorDisplayNameAlternatives,
  filterDuplicates,
  isInteresting,
};
