import { Store } from '../store';
import { Effect, Ref } from 'effect';
import { listPending } from './getter';
import type { PendingOptions } from '../actions/types';
import type { IEvent, Status } from './types';
import type { IState } from '../store/types';

const updateEvents = (state: IState, values: string[], opts: PendingOptions): IEvent[] => {
  const pendings = listPending(state, opts);
  const updated = pendings.map(item => {
    const status: Status = values.includes(item.value) ? 'accepted' : 'rejected';
    return { ...item, status, updated_at: new Date().toISOString() };
  });
  return updated;
};

const updateStatus = (values: string[], opts: PendingOptions): Effect.Effect<void, never, Store> =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state: IState = yield* Ref.get(store);
    const updated = updateEvents(state, values, opts);
    const uuids = updated.map(e => e.uuid);
    const unchanged = state.events.filter(e => !uuids.includes(e.uuid));
    yield* Ref.update(store, s => ({
      context: s.context,
      events: [...unchanged, ...updated],
    }));
  });

export { updateStatus };
