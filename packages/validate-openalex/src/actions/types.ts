import { Effect } from 'effect';
import { ContextStore, EventsStore } from '../store';

interface Action {
  name: string;
  group?: {
    name: string;
    index: number;
  };
  visible?: () => Effect.Effect<boolean, unknown, ContextStore | EventsStore>;
  action: () => Effect.Effect<void, unknown, ContextStore | EventsStore>;
}

export type { Action };
