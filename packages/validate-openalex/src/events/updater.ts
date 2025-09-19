import { listPending } from './getter';
import type { PendingOptions } from '../actions/types';
import type { IEvent, Status } from './types';
import type { IState } from '../store/types';

const update_status_events = (state: IState, values: string[], opts: PendingOptions): IEvent[] =>
  listPending(state, opts).map(item => {
    const status: Status = values.includes(item.value) ? 'accepted' : 'rejected';
    return { ...item, status };
  });

const update_date = (event: IEvent): IEvent => ({
  ...event,
  updated_at: new Date().toISOString(),
});

const update_status = (state: IState, values: string[], opts: PendingOptions): IEvent[] => {
  const updated = update_status_events(state, values, opts).map(update_date);
  const uuids = updated.map(e => e.uuid);
  const unchanged = state.events.filter(e => !uuids.includes(e.uuid));
  return [...unchanged, ...updated];
};

export { update_status };
