import { Effect } from 'effect';
import { getORCID } from '../context';
import { searchAuthorByName, searchAuthorByORCID } from '../fetch';
import { setEventsStore } from '../store/setter';
import { log, print_title, text } from '../prompt';
import { ContextStore, EventsStore, updateContextStore, updateEventsStore } from '../store';
import { buildAuthorResultsPendingEvents, getEvents, hasORCID, isInteresting } from '../events';
import type { ConfigError } from 'effect/ConfigError';
import type { IEvent } from '../events/types';
import { uniqueSorted } from '../tools';
import { AuthorsResult } from '@univ-lehavre/biblio-openalex-types';

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

const extendsEventsWithAlternativeStrings = () =>
  Effect.gen(function* () {
    const orcid: string | undefined = yield* getORCID();
    if (!orcid) return;
    const events: IEvent[] = yield* getEvents();
    const alternatives = uniqueSorted(
      events
        .filter(event =>
          isInteresting(event, { id: orcid, entity: 'author', field: 'display_name_alternatives' }),
        )
        .map(event => event.value),
    );
    let updated: IEvent[] = [];
    for (const alt of alternatives) {
      const authors: AuthorsResult[] = yield* searchAuthorByName([alt]);
      const newItems: IEvent[] = yield* buildAuthorResultsPendingEvents(authors);
      // remove from newItems the events that are already in events
      const filteredNewItems = newItems.filter(
        newItem =>
          !events.some(
            event =>
              event.from === newItem.from &&
              event.id === newItem.id &&
              event.entity === newItem.entity &&
              event.field === newItem.field &&
              event.value === newItem.value,
          ),
      );
      // modifier le statut des newItems à accepted si un tuple (id, entity, field, value) est déjà accepté
      updated = filteredNewItems.map(newItem => {
        const event = events.find(
          event =>
            event.id === newItem.id &&
            event.entity === newItem.entity &&
            event.field === newItem.field &&
            event.value === newItem.value &&
            event.status === 'accepted',
        );
        if (event) {
          newItem.status = 'accepted';
        }
        return newItem;
      });
    }
    if (updated.length > 0) yield* updateEventsStore(updated);
  });

const hasEventsForThisORCID = (): Effect.Effect<boolean, never, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const orcid: string | undefined = yield* getORCID();
    if (!orcid) return false;
    const events: IEvent[] = yield* getEvents();
    if (events.length === 0) return false;
    const hasSome: boolean = events.some(event => event.entity === 'author' && event.id === orcid);
    return hasSome;
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

export {
  insert_new_ORCID,
  removeAuthorPendings,
  hasEventsForThisORCID,
  extendsEventsWithAlternativeStrings,
};
