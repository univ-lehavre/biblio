import { Effect } from 'effect';
import { buildAuthorResultsPendingEvents, hasORCID } from '../events';
import { log, print_title, text } from '../prompt';
import { ContextStore, EventsStore, updateContextStore, updateEventsStore } from '../store';
import { searchAuthorByORCID } from '../fetch';
import { ConfigError } from 'effect/ConfigError';

const insert_new_ORCID = (): Effect.Effect<void, Error | ConfigError, ContextStore | EventsStore> =>
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

    yield* updateContextStore({ type: 'author', id: orcid });

    if (yield* hasORCID(orcid)) {
      console.clear();
      yield* print_title();
      log.info(`L’ORCID ${orcid} a déjà été ajouté`);
      return;
    } else {
      const authors = yield* searchAuthorByORCID([orcid]);
      const items = yield* buildAuthorResultsPendingEvents(authors);
      yield* updateEventsStore(items);
      console.clear();
      yield* print_title();
    }
  });

export { insert_new_ORCID };
