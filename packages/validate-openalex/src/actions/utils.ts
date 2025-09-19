import { Store } from '../store';
import { Effect, Ref } from 'effect';
import { searchAuthorByORCID } from '../fetch';
import { update_store_context, update_store_events } from '../store';
import { event2option, log, multiselect, print_title, select, text } from '../prompt';
import {
  create_events_from_author_results,
  filter_pending,
  hasORCID,
  update_status,
} from '../events';
import type { PendingOptions } from './types';
import type { IState } from '../store/types';
import type { ConfigError } from '../types';

const insert_new_ORCID = (): Effect.Effect<void, Error | ConfigError, Store> =>
  Effect.gen(function* () {
    const orcid = (yield* text(
      'Saisissez l’ORCID d’un chercheur',
      '0000-0000-0000-0000',
      (value: string | undefined) => {
        if (!value) return 'L’ORCID est requis';
        const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}(\d|X)$/;
        if (!orcidRegex.test(value)) return 'L’ORCID doit être au format 0000-0000-0000-0000';
      },
    ))
      .toString()
      .trim();

    const store = yield* Store;
    const state: IState = yield* Ref.get(store);

    yield* update_store_context({
      type: 'author',
      id: orcid,
    });

    if (hasORCID(state, orcid)) {
      console.clear();
      yield* print_title();
      log.info(`L’ORCID ${orcid} a déjà été ajouté`);
      return;
    }

    const authors = yield* searchAuthorByORCID([orcid]);
    const items = create_events_from_author_results(orcid, authors);
    yield* update_store_events([...state.events, ...items]);

    console.clear();
    yield* print_title();
  });

const mark_display_name_reliable = (message: string, opts: PendingOptions) =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
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
  insert_new_ORCID,
  mark_display_name_reliable,
  mark_authors_alternative_strings_reliable,
  mark_affiliations_alternative_strings_reliable,
};
