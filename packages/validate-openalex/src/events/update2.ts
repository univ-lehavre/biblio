import { isInteresting } from './filter';
import type { IEvent } from './types';

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
      const alreadyAcceptedOrRejected = matched.find(
        e => e.status === 'accepted' || e.status === 'rejected',
      );
      if (alreadyExtended !== undefined && alreadyAcceptedOrRejected !== undefined) {
        updatedEvents.push({
          ...newEvent,
          status: alreadyAcceptedOrRejected.status,
          hasBeenExtendedAt: alreadyExtended.hasBeenExtendedAt,
        });
      } else if (alreadyExtended !== undefined) {
        updatedEvents.push({
          ...newEvent,
          hasBeenExtendedAt: alreadyExtended.hasBeenExtendedAt,
        });
      } else if (alreadyAcceptedOrRejected !== undefined) {
        updatedEvents.push({
          ...newEvent,
          status: alreadyAcceptedOrRejected.status,
        });
      } else {
        updatedEvents.push(newEvent);
      }
    }
  }
  return updatedEvents;
};

export { updateNewEventsWithExistingMetadata };
