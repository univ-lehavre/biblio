import { filterPending } from './filter';
import type { PendingOptions } from '../actions/types';
import type { IEvent, Status } from './types';

const updatePendingStatusEventsBasedOnAcceptedValues = (
  events: IEvent[],
  /** Accepted values from events */
  accepted: string[],
  opts: PendingOptions,
): IEvent[] =>
  filterPending(events, opts).map(event => {
    const status: Status = accepted.includes(event.value) ? 'accepted' : 'rejected';
    return { ...event, status };
  });

const updateDate = (event: IEvent): IEvent => ({
  ...event,
  updated_at: new Date().toISOString(),
});

const updateStatusEventsBasedOnAcceptedValues = (
  events: IEvent[],
  values: string[],
  opts: PendingOptions,
): IEvent[] => {
  const updated = updatePendingStatusEventsBasedOnAcceptedValues(events, values, opts).map(
    updateDate,
  );
  const uuids = updated.map(e => e.uuid);
  const unchanged = events.filter(e => !uuids.includes(e.uuid));
  return [...unchanged, ...updated];
};

export { updateStatusEventsBasedOnAcceptedValues };
