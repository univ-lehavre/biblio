import { Effect } from 'effect';
import { getContext } from '../context';
import { getEvents, hasPending, isInteresting } from '../events';
import { ContextStore, EventsStore } from '../store';
import type { IEntity, IField, IEvent } from '../events/types';
import type { IContext } from '../store/types';

const hasPendings = (
  entity: IEntity,
  field?: IField,
): Effect.Effect<boolean, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const { type, id }: IContext = yield* getContext();
    if (type !== entity) return false;
    const events: IEvent[] = yield* getEvents();
    return field === undefined
      ? events.some(event => isInteresting(event, { id, entity, status: 'pending' }))
      : hasPending(events, {
          id,
          entity,
          field,
        });
  });

const notHasPendings = (
  entity: IEntity,
  field?: IField,
): Effect.Effect<boolean, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const has = yield* hasPendings(entity, field);
    return !has;
  });

const filterAuthorAlternativeStringsToExtend = (id: string): Partial<IEvent> => ({
  hasBeenExtendedAt: 'never',
  id,
  entity: 'author',
  field: 'display_name_alternatives',
  status: 'accepted',
});

const getAuthorAlternativeStrings = (): Effect.Effect<
  IEvent[],
  never,
  ContextStore | EventsStore
> =>
  Effect.gen(function* () {
    const { type, id }: IContext = yield* getContext();
    if (type !== 'author') return [];
    if (id === undefined) return [];
    const events: IEvent[] = yield* getEvents();
    return events.filter(event => isInteresting(event, filterAuthorAlternativeStringsToExtend(id)));
  });

const hasAuthorAlternativeStrings = (): Effect.Effect<boolean, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const { type, id }: IContext = yield* getContext();
    if (type !== 'author') return false;
    if (id === undefined) return false;
    const events: IEvent[] = yield* getEvents();
    return events.some(event => isInteresting(event, filterAuthorAlternativeStringsToExtend(id)));
  });

const isContext = (entity: IEntity): Effect.Effect<boolean, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const { type }: IContext = yield* getContext();
    return type === entity;
  });

export {
  hasPendings,
  isContext,
  notHasPendings,
  hasAuthorAlternativeStrings,
  getAuthorAlternativeStrings,
};
