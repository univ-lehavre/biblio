import type { IEvent } from './types';

const filterByAttributes = (events: IEvent[], opts: Partial<IEvent>): IEvent[] =>
  events
    .map(item => {
      // Filter on meta
      if (opts.from && item.from !== opts.from) return;
      if (opts.status && item.status !== opts.status) return;
      if (opts.label && item.label !== opts.label) return;
      if (opts.dataIntegrity && item.dataIntegrity !== opts.dataIntegrity) return;
      // Filter on data
      if (opts.id && item.id !== opts.id) return;
      if (opts.entity && item.entity !== opts.entity) return;
      if (opts.field && item.field !== opts.field) return;
      if (opts.value && item.value !== opts.value) return;
      return item;
    })
    .filter(item => item !== undefined);

const filterPending = (events: IEvent[], opts: Partial<IEvent>): IEvent[] =>
  filterByAttributes(events, {
    ...opts,
    status: 'pending',
  });

const filterAcceptedAuthorDisplayNameAlternatives = (events: IEvent[], orcid: string): IEvent[] =>
  filterByAttributes(events, {
    id: orcid,
    entity: 'author',
    field: 'display_name_alternatives',
    status: 'accepted',
  });

const filterDuplicates = (existing: IEvent[], updated: IEvent[]): IEvent[] => {
  const uuids = updated.map(e => e.dataIntegrity);
  const unchanged = existing.filter(e => !uuids.includes(e.dataIntegrity));
  return [...unchanged, ...updated];
};

export { filterPending, filterAcceptedAuthorDisplayNameAlternatives, filterDuplicates };
