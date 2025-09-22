import { Effect } from 'effect';
import { getEvents } from '../events/getter';
import { getORCID } from '../context';
import { filterPending } from '../events/filter';
import { ContextStore, EventsStore } from '../store';
import { event2option, multiselect } from '../prompt';
import { updateEventsStoreBasedOnAcceptedValues } from '../events/updater';
import type { IEvent } from '../events/types';

const mark_alternative_strings_reliable = (
  message: string,
  opts: Partial<IEvent>,
): Effect.Effect<void, Error, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    if (!opts.id) opts.id = yield* getORCID();
    const events = yield* getEvents();
    const options = filterPending(events, opts).map(event2option);
    const selected = yield* multiselect(message, false, options);
    if (selected instanceof Array) yield* updateEventsStoreBasedOnAcceptedValues(selected, opts);
  });

//const searchAlternativeReliableStrings = () =>
// Effect.gen(function* () {
//   const orcid = yield* getORCID();
//   const events = yield* getEvents();
// });

export { mark_alternative_strings_reliable };
