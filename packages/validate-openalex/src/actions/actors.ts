import { Effect } from 'effect';
import { getORCID } from '../context';
import { searchAuthorByName, searchAuthorByORCID } from '../fetch';
import { setEventsStore } from '../store/setter';
import { log, text, string2option, select } from '../prompt';
import { ContextStore, EventsStore, updateContextStore, updateEventsStore } from '../store';
import {
  buildAuthorResultsPendingEvents,
  getEvents,
  getManyEvent,
  hasORCID,
  isInteresting,
} from '../events';
import type { ConfigError } from 'effect/ConfigError';
import type { IEvent } from '../events/types';
import { uniqueSorted } from '../tools';
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

    if (yield* hasORCID(orcid)) {
      log.info(`L’ORCID ${orcid} a déjà été ajouté`);
      return;
    } else {
      const authors = yield* searchAuthorByORCID([orcid]);
      const items = yield* buildAuthorResultsPendingEvents(authors);
      yield* updateEventsStore(items);
    }
  });

const extendsEventsWithAlternativeStrings = () =>
  Effect.gen(function* () {
    const orcid: string | undefined = yield* getORCID();
    if (!orcid) return;
    const events: IEvent[] = yield* getAuthorAlternativeStrings();
    const alternatives = uniqueSorted(events.map(event => event.value));
    const selected: symbol | string = yield* select(
      "Sélectionnez la forme imprimée de l'auteur à rechercher",
      alternatives.map(string2option),
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

    let updated: IEvent[] = [];
    const authors: AuthorsResult[] = yield* searchAuthorByName([selected]);
    const newItems: IEvent[] = yield* buildAuthorResultsPendingEvents(authors);
    // remove from newItems the events that are already in events
    const filteredNewItems = newItems
      // Filtre les données pré-existantes
      .filter(
        newItem =>
          !events.some(
            event =>
              event.from === newItem.from &&
              event.id === newItem.id &&
              event.entity === newItem.entity &&
              event.field === newItem.field &&
              event.value === newItem.value,
          ),
      )
      // Met à jour le statut si l'événement existe déjà avec un statut "accepted" ou "rejected"
      .map(newItem => {
        const event = events.find(
          event =>
            event.id === newItem.id &&
            event.entity === 'author' &&
            event.field === newItem.field &&
            event.value === newItem.value &&
            event.status === 'accepted',
        );
        if (event) {
          newItem.status = 'accepted';
        }
        return newItem;
      })
      .map(newItem => {
        const event = events.find(
          event =>
            event.id === newItem.id &&
            event.entity === 'author' &&
            event.field === newItem.field &&
            event.value === newItem.value &&
            event.status === 'rejected',
        );
        if (event) {
          newItem.status = 'rejected';
        }
        return newItem;
      });
    updated = [...updated, ...filteredNewItems];

    const seen = new Set<string>();
    const uniques = updated.filter(item => {
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
