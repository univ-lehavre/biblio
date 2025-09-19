import { Store } from '../store';
import { Effect, Ref } from 'effect';
import { update_store_context, update_store_events } from '../store';
import { event2option, multiselect, print_title, select } from '../prompt';
import { filter_pending, update_status } from '../events';
import { PendingOptions } from '../actions/types';

const mark_display_name_reliable = (message: string, opts: PendingOptions, addORCID = true) =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    if (addORCID) opts.orcid = state.context.id;
    const options = filter_pending(state, opts).map(event2option);
    const selected = yield* select(message, options);
    const updated = update_status(state, [selected.toString()], opts);
    yield* update_store_events(updated);
    yield* update_store_context({
      type: 'author',
      id: state.context.id,
      label: selected.toString(),
    });
    console.clear();
    yield* print_title();
  });

const mark_author_display_name_reliable = () =>
  mark_display_name_reliable('Sélectionnez le patronyme correspondant à ce chercheur', {
    entity: 'author',
    field: 'display_name',
  });

const mark_alternative_strings_reliable = (
  message: string,
  opts: PendingOptions,
  addORCID = true,
): Effect.Effect<void, Error, Store> =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    if (addORCID) opts.orcid = state.context.id;
    const options = filter_pending(state, opts).map(event2option);
    const selected = yield* multiselect(message, false, options);
    if (selected instanceof Array) {
      const updated = update_status(state, selected, opts);
      yield* update_store_events(updated);
    }
  });

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
  mark_display_name_reliable,
  mark_authors_alternative_strings_reliable,
  mark_affiliations_alternative_strings_reliable,
  mark_author_display_name_reliable,
};
