import { Effect } from 'effect';
import { ContextStore, EventsStore } from '../store';
import type { IEventData, Status } from '../events/types';

type PendingOptions = IEventData & {
  status: Status;
};

interface Action {
  name: string;
  group?: {
    name: string;
    index: number;
  };
  visible: () => Effect.Effect<void, unknown, ContextStore | EventsStore>;
  action: () => Effect.Effect<void, unknown, EventsStore>;
}

export type { Action, PendingOptions };
