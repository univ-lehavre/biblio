import { Effect } from 'effect';
import { getORCID } from '../context';
import { searchAuthorByName, searchAuthorByORCID } from '../fetch';
import { setEventsStore } from '../store/setter';
import { text, select, events2options } from '../prompt';
import { ContextStore, EventsStore, updateContextStore, updateEventsStore } from '../store';
import {
  buildAuthorResultsPendingEvents,
  getEvents,
  getManyEvent,
  isInteresting,
  updateNewEventsWithExistingMetadata,
} from '../events';
import type { ConfigError } from 'effect/ConfigError';
import type { IEvent } from '../events/types';
import { AuthorsResult } from '@univ-lehavre/biblio-openalex-types';
import { getAuthorAlternativeStrings } from './tester';

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
    const authors = yield* searchAuthorByORCID([orcid]);
    const items = yield* buildAuthorResultsPendingEvents(authors);
    yield* updateEventsStore(items);
  });

const extendsEventsWithAlternativeStrings = () =>
  Effect.gen(function* () {
    const orcid: string | undefined = yield* getORCID();
    if (!orcid) throw new Error('No ORCID in context');
    const authorAlternativeStringEvents: IEvent[] = yield* getAuthorAlternativeStrings();
    const options = events2options(authorAlternativeStringEvents);
    const selected: symbol | string = yield* select(
      "Sélectionnez la forme imprimée de l'auteur à rechercher",
      options,
    );
    if (typeof selected !== 'string') throw new Error('Sélection invalide');

    // Mise à jour de la date d'extension des événements existants
    const eventsToUpdate = yield* getManyEvent({
      id: orcid,
      entity: 'author',
      field: 'display_name_alternatives',
      value: selected,
    });
    const hasBeenExtendedAt = new Date().toISOString();
    const updatedEvents = eventsToUpdate.map(event => ({ ...event, hasBeenExtendedAt }));
    yield* updateEventsStore(updatedEvents);

    const authors: AuthorsResult[] = yield* searchAuthorByName([selected]);
    const newItems: IEvent[] = yield* buildAuthorResultsPendingEvents(authors);
    const events: IEvent[] = yield* getEvents();
    // remove from newItems the events that are already in events
    const filteredNewItems = updateNewEventsWithExistingMetadata(
      events,
      newItems.filter(
        newItem => !events.some(event => event.dataIntegrity === newItem.dataIntegrity),
      ),
    );

    const seen = new Set<string>();
    const uniques = filteredNewItems.filter(item => {
      if (seen.has(item.dataIntegrity)) return false;
      seen.add(item.dataIntegrity);
      return true;
    });

    if (uniques.length > 0) yield* updateEventsStore(uniques);
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

const extendsToWorks = () => Effect.gen(function* () {});

export {
  insert_new_ORCID,
  removeAuthorPendings,
  hasEventsForThisORCID,
  extendsEventsWithAlternativeStrings,
  extendsToWorks,
};
