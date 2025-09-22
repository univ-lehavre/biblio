import { Effect } from 'effect';
import { getEvents } from './getter';
import { getORCID } from '../context';
import { filterPending } from './filter';
import { event2option, multiselect } from '../prompt';
import { updateEventsStoreBasedOnAcceptedValues } from './updater';
import type { IEvent } from './types';
import { ContextStore, EventsStore } from '../store';

const mark_alternative_strings_reliable = (
  message: string,
  opts: Partial<IEvent>,
): Effect.Effect<void, Error, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    if (!opts.id) opts.id = yield* getORCID();
    const events = yield* getEvents();
    const options = filterPending(events, opts).map(event2option);
    const selected = yield* multiselect(message, false, options);
    if (selected instanceof Array && selected.length > 0)
      yield* updateEventsStoreBasedOnAcceptedValues(selected, opts);
  });

const mark_authors_display_name_reliable = (): Effect.Effect<
  void,
  Error,
  ContextStore | EventsStore
> =>
  mark_alternative_strings_reliable(
    'Sélectionnez les formes graphiques correspondantes à ce chercheur',
    {
      entity: 'author',
      field: 'display_name',
    },
  );

const mark_authors_alternative_strings_reliable = (): Effect.Effect<
  void,
  Error,
  ContextStore | EventsStore
> =>
  mark_alternative_strings_reliable(
    'Sélectionnez les formes graphiques correspondantes à ce chercheur',
    {
      entity: 'author',
      field: 'display_name_alternatives',
    },
  );

const mark_affiliations_alternative_strings_reliable = (): Effect.Effect<
  void,
  Error,
  ContextStore | EventsStore
> =>
  mark_alternative_strings_reliable('Sélectionnez les affiliations correspondantes au chercheur', {
    entity: 'author',
    field: 'affiliation',
  });

export {
  mark_authors_display_name_reliable,
  mark_authors_alternative_strings_reliable,
  mark_affiliations_alternative_strings_reliable,
};
