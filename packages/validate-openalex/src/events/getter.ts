import { Effect, Ref } from 'effect';
import { EventsStore } from '../store';
import type { IEvent, IEventData } from './types';
import { getORCID } from '../context';
import { uniqueSorted } from '../tools';

const getEventsData = (): Effect.Effect<IEventData[], never, EventsStore> =>
  Effect.gen(function* () {
    const store: Ref.Ref<IEvent[]> = yield* EventsStore;
    const events: IEvent[] = yield* Ref.get(store);
    const data: IEventData[] = events.map(getEventData);
    return data;
  });

const getEventData = (event: Partial<IEvent> & IEventData): IEventData => ({
  from: event.from,
  id: event.id,
  entity: event.entity,
  field: event.field,
  value: event.value,
});

const getEvents = (): Effect.Effect<IEvent[], never, EventsStore> =>
  Effect.gen(function* () {
    const store: Ref.Ref<IEvent[]> = yield* EventsStore;
    const events: IEvent[] = yield* Ref.get(store) ?? [];
    return events;
  });

const getOpenAlexIDs = () =>
  Effect.gen(function* () {
    const orcid: string | undefined = yield* getORCID();
    if (orcid === undefined) return [];
    const events = yield* getEvents();
    return uniqueSorted(
      events.filter(e => e.id === orcid && e.status === 'accepted').map(e => e.from),
    );
  });

const getDisplayNames = () =>
  Effect.gen(function* () {
    const orcid: string | undefined = yield* getORCID();
    if (orcid === undefined) return [];
    const events = yield* getEvents();
    return uniqueSorted(
      events
        .filter(
          e =>
            e.id === orcid &&
            e.entity === 'author' &&
            e.field === 'display_name' &&
            e.status === 'accepted',
        )
        .map(e => e.value),
    );
  });

const getDisplayNameAlternatives = () =>
  Effect.gen(function* () {
    const orcid: string | undefined = yield* getORCID();
    if (orcid === undefined) return [];
    const events = yield* getEvents();
    return uniqueSorted(
      events
        .filter(
          e =>
            e.id === orcid &&
            e.entity === 'author' &&
            e.field === 'display_name_alternatives' &&
            e.status === 'accepted',
        )
        .map(e => e.value),
    );
  });

const getAffiliations = () =>
  Effect.gen(function* () {
    const orcid: string | undefined = yield* getORCID();
    if (orcid === undefined) return [];
    const events = yield* getEvents();
    return uniqueSorted(
      events
        .filter(
          e =>
            e.id === orcid &&
            e.entity === 'author' &&
            e.field === 'affiliation' &&
            e.status === 'accepted',
        )
        .map(e => e.label || e.value),
    );
  });

export {
  getEventsData,
  getEvents,
  getEventData,
  getDisplayNames,
  getDisplayNameAlternatives,
  getAffiliations,
  getOpenAlexIDs,
};
