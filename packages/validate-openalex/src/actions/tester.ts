import { Effect } from 'effect';
import { getContext } from '../context';
import { getEvents, hasPending } from '../events';
import { ContextStore, EventsStore } from '../store';
import type { IEntity, IField, IEvent } from '../events/types';
import type { IContext } from '../store/types';

const hasPendings = (
  entity: IEntity,
  field: IField,
): Effect.Effect<boolean, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const { type, id }: IContext = yield* getContext();
    if (type !== entity) return false;
    const events: IEvent[] = yield* getEvents();
    return hasPending(events, {
      id,
      entity,
      field,
    });
  });

const isContext = (entity: IEntity): Effect.Effect<boolean, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const { type }: IContext = yield* getContext();
    return type === entity;
  });

export { hasPendings, isContext };
