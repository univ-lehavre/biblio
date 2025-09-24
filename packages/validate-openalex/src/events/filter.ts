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
 * Filtre les événements en double (en se basant sur la propriété `dataIntegrity`) avant de les ajouter au store.
 * @param existing Existing events in the store
 * @param updated New events to add
 * @returns A new array containing the updated events and the existing events that do not have the same `dataIntegrity` as any updated event.
 */
const filterDuplicates = (existing: IEvent[], updated: IEvent[]): IEvent[] => {
  const uuids = updated.map(e => e.dataIntegrity);
  const unchanged = existing.filter(e => !uuids.includes(e.dataIntegrity));
  return [...unchanged, ...updated];
};

/**
 * Supprime les événements en double dans une liste donnée (en se basant sur la propriété `dataIntegrity`).
 * @param newItems Un tableau avec des nouveaux événements
 * @returns Un tableau ne contenant que les événements uniques (sans doublons).
 */
const removeDuplicates = (newItems: IEvent[]): IEvent[] => {
  const seen = new Set<string>();
  const uniques = newItems.filter(item => {
    if (seen.has(item.dataIntegrity)) return false;
    seen.add(item.dataIntegrity);
    return true;
  });
  return uniques;
};

export {
  filterPending,
  filterEventsByAttributes,
  filterAcceptedAuthorDisplayNameAlternatives,
  filterDuplicates,
  removeDuplicates,
  isInteresting,
};
