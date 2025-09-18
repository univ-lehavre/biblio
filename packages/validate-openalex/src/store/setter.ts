import { listPending } from './getter';
import type { IEvent, IState, Status } from '../types';
import { PendingOptions } from './types';
import { Effect, Ref } from 'effect';
import { Store } from '.';

const updateEvents = (state: IState, values: string[], opts: PendingOptions): IEvent[] => {
  const pendings = listPending(state, opts);
  const updated = pendings.map(item => {
    const status: Status = values.includes(item.value) ? 'accepted' : 'rejected';
    return { ...item, status };
  });
  return updated;
};

const updateStatus = (values: string[], opts: PendingOptions) =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    const updated = updateEvents(state, values, opts);
    const uuids = updated.map(e => e.uuid);
    const unchanged = state.events.filter(e => !uuids.includes(e.uuid));
    console.log(updated);
    yield* Ref.update(store, s => ({
      context: s.context,
      events: [...unchanged, ...updated],
    }));
  });

export { updateStatus };
