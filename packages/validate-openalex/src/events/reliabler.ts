import { Effect, Ref } from 'effect';
import { event2option, multiselect } from '../prompt';
import { PendingOptions } from '../actions/types';
import { getORCID } from '../context';
import { filterPending } from './filter';
import { getEvents } from './getter';
import { updateStatusEventsBasedOnAcceptedValues } from './updater';
import { updateEventsStore } from '../store';

const uniqueSorted = (items: string[]): string[] =>
  Array.from(new Set(items))
    .filter(item => item !== undefined)
    .sort((a, b) => a.localeCompare(b, 'en'));

const mark_alternative_strings_reliable = (
  message: string,
  opts: PendingOptions,
  addORCID = true,
) =>
  Effect.gen(function* () {
    if (addORCID) opts.id = yield* getORCID();
    const options = filterPending(yield* getEvents(), opts).map(event2option);
    const selected = yield* multiselect(message, false, options);
    if (selected instanceof Array && selected.length > 0) {
      // Mise à jour des événements
      const updated = updateStatusEventsBasedOnAcceptedValues(yield* getEvents(), selected, opts);
      yield* updateEventsStore(updated);
      // Mise à jour des éventuels identifiants OpenAlex
      const ids = uniqueSorted(
        updated.filter(e => e.status === 'accepted').map(e => e.openalex_id),
      );
      const openalex_ids = update_status(state, ids, {
        orcid: opts.orcid,
        entity: 'author',
        field: 'id',
      });
      yield* update_store_events(openalex_ids);
      if (opts.entity === 'author' && opts.field === 'display_name') {
        yield* update_store_context({
          type: 'author',
          id: state.context.id,
          label: selected.toString(),
        });
      }
    }
  });

const mark_authors_display_name_reliable = () =>
  mark_alternative_strings_reliable(
    'Sélectionnez les formes graphiques correspondantes à ce chercheur',
    {
      entity: 'author',
      field: 'display_name',
    },
    true,
  );

const mark_authors_alternative_strings_reliable = () =>
  mark_alternative_strings_reliable(
    'Sélectionnez les formes graphiques correspondantes à ce chercheur',
    {
      entity: 'author',
      field: 'display_name_alternatives',
    },
    true,
  );

const mark_affiliations_alternative_strings_reliable = () =>
  mark_alternative_strings_reliable(
    'Sélectionnez les affiliations correspondantes au chercheur',
    {
      entity: 'author',
      field: 'affiliation',
    },
    true,
  );

export {
  mark_authors_display_name_reliable,
  mark_authors_alternative_strings_reliable,
  mark_affiliations_alternative_strings_reliable,
};
