import { Effect, Ref } from 'effect';
import { EventsStore } from '../store';
import type { IEvent, IEventData } from './types';

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

const getDisplayNames = () =>
  Effect.gen(function* () {
    const events = yield* getEvents();
    return events
      .filter(e => e.entity === 'author' && e.field === 'display_name' && e.status === 'accepted')
      .map(e => e.value);
  });

export { getEventsData, getEvents, getEventData, getDisplayNames };
