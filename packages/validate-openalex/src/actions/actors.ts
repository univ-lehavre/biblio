import { Effect } from 'effect';
import { buildAuthorResultsPendingEvents, getEvents, hasORCID, isInteresting } from '../events';
import { log, print_title, text } from '../prompt';
import { ContextStore, EventsStore, updateContextStore, updateEventsStore } from '../store';
import { searchAuthorByORCID } from '../fetch';
import { ConfigError } from 'effect/ConfigError';
import { getORCID } from '../context';
import { setEventsStore } from '../store/setter';

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

const hasEventsForThisORCID = (): Effect.Effect<boolean, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const orcid: string | undefined = yield* getORCID();
    if (!orcid) return false;
    const events = yield* getEvents();
    return events.some(event => event.entity === 'author' && event.id === orcid);
  });

const removeAuthorPendings = () =>
  Effect.gen(function* () {
    const orcid: string | undefined = yield* getORCID();
    const events = yield* getEvents();
    const notPendings = events.filter(
      event => !isInteresting(event, { id: orcid, status: 'pending' }),
    );
    yield* setEventsStore(notPendings);
  });

export { insert_new_ORCID, removeAuthorPendings, hasEventsForThisORCID };
