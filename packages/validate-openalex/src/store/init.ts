import { v7 } from 'uuid';
import { Context, Effect, Ref } from 'effect';
import type { IEvent } from '../events/types';
import type { IContext } from './types';

const initialEvents: IEvent[] = [];

class EventsStore extends Context.Tag('EventsStore')<EventsStore, Ref.Ref<IEvent[]>>() {}
const provideEventsStore = () => Effect.provideServiceEffect(EventsStore, Ref.make(initialEvents));

const initialContext: IContext = {
  type: 'none',
  id: undefined,
  NAMESPACE: v7(),
  backup: false,
  context_file: 'context.json',
  events_file: 'events.json',
};

class ContextStore extends Context.Tag('ContextStore')<ContextStore, Ref.Ref<IContext>>() {}
const provideContextStore = () =>
  Effect.provideServiceEffect(ContextStore, Ref.make(initialContext));

export { provideEventsStore, provideContextStore, EventsStore, ContextStore };
