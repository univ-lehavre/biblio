import { Store } from '../store';
import { Effect, Ref } from 'effect';
import { searchAuthorByORCID } from '../fetch';
import { update_store_context, update_store_events } from '../store';
import { log, print_title, text } from '../prompt';
import { create_events_from_author_results, hasORCID } from '../events';
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

export { insert_new_ORCID };
