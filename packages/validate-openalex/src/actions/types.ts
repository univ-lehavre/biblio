import { Effect } from 'effect';
import { ContextStore, EventsStore } from '../store';
import type { ConfigError } from 'effect/ConfigError';

interface Action {
  name: string;
  group?: {
    name: string;
    index: number;
  };
  visible?: (() => Effect.Effect<boolean, never, ContextStore | EventsStore>)[];
  action: () => Effect.Effect<void, Error | ConfigError, ContextStore | EventsStore>;
}

export type { Action };
