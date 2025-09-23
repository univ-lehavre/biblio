import { Effect, Ref } from 'effect';
import { EventsStore } from '../store';
import type { IEvent, IEventData } from './types';
import { getORCID } from '../context';
import { uniqueSorted } from '../tools';
import { filterEventsByAttributes } from './filter';

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

const getManyEvent = (opts: Partial<IEvent>): Effect.Effect<IEvent[], never, EventsStore> =>
  Effect.gen(function* () {
    const events = yield* getEvents();
    const event: IEvent[] = filterEventsByAttributes(events, opts);
    return event;
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
    const affiliations = events
      .filter(
        e =>
          e.id === orcid &&
          e.entity === 'author' &&
          e.field === 'affiliation' &&
          e.status === 'accepted',
      )
      .map(e => e.from);

    const display_name_alternatives = events
      .filter(
        e =>
          e.id === orcid &&
          e.entity === 'author' &&
          e.field === 'display_name_alternatives' &&
          e.status === 'accepted',
      )
      .map(e => e.from);
    const intersection = affiliations.filter(value => display_name_alternatives.includes(value));
    if (intersection.length > 0) return uniqueSorted(intersection);
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
  getManyEvent,
  getEvents,
  getEventData,
  getDisplayNameAlternatives,
  getAffiliations,
  getOpenAlexIDs,
};
