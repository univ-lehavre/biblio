import { Effect } from 'effect';
import { getEvents } from './getter';
import { updateEventsStore } from '../store';
import { filterPending, isInteresting } from './filter';
import type { IEvent, Status } from './types';

const updateEventStatusBasedOnAcceptedValues = (
  events: IEvent[],
  /** Accepted values from events */
  accepted: string[],
  opts: Partial<IEvent>,
): IEvent[] =>
  filterPending(events, opts).map(event => {
    const status: Status = accepted.includes(event.value) ? 'accepted' : 'rejected';
    return { ...event, status };
  });

const updateDate = (event: IEvent): IEvent => ({
  ...event,
  updatedAt: new Date().toISOString(),
});

const updateEventsStoreBasedOnAcceptedValues = (values: string[], opts: Partial<IEvent>) =>
  Effect.gen(function* () {
    const events = yield* getEvents();
    const updated = updateEventStatusBasedOnAcceptedValues(events, values, opts).map(updateDate);
    yield* updateEventsStore(updated);
  });

/**
 * Met à jour les nouveaux évènements avec les métadonnées (status et hasBeenExtendedAt) déjà présentes dans le store
 */
const updateNewEventsWithExistingMetadata = (existing: IEvent[], newEvents: IEvent[]) => {
  const updatedEvents: IEvent[] = [];
  for (const newEvent of newEvents) {
    const matched = existing.filter(e =>
      isInteresting(e, {
        id: newEvent.id,
        entity: newEvent.entity,
        field: newEvent.field,
        value: newEvent.value,
      }),
    );
    if (matched.length === 0) {
      updatedEvents.push(newEvent);
    } else {
      const alreadyExtended = matched.find(e => e.hasBeenExtendedAt !== 'never');
      if (alreadyExtended !== undefined)
        updatedEvents.push({
          ...newEvent,
          hasBeenExtendedAt: alreadyExtended.hasBeenExtendedAt,
        });
      const alreadyAcceptedOrRejected = matched.find(
        e => e.status === 'accepted' || e.status === 'rejected',
      );
      if (alreadyAcceptedOrRejected !== undefined) {
        updatedEvents.push({
          ...newEvent,
          status: alreadyAcceptedOrRejected.status,
        });
      }
      if (alreadyExtended === undefined && alreadyAcceptedOrRejected === undefined) {
        updatedEvents.push(newEvent);
      }
    }
  }
  return updatedEvents;
};

export { updateEventsStoreBasedOnAcceptedValues, updateNewEventsWithExistingMetadata };
