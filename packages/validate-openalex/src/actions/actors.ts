import { Effect } from 'effect';
import { getContext, getORCID } from '../context';
import { setEventsStore } from '../store/setter';
import { getAuthorAlternativeStrings } from './tester';
import { text, select, events2options, confirm } from '../prompt';
import { asORCID } from '@univ-lehavre/biblio-openalex-types';
import { searchAuthorByName, searchAuthorByORCID, searchWorksByAuthorIDs } from '../fetch';
import { ContextStore, EventsStore, updateContextStore, updateEventsStore } from '../store';
import {
  buildAuthorResultsPendingEvents,
  buildEvent,
  buildReference,
  getEvents,
  getManyEvent,
  getOpenAlexIDs,
  getStatusOfAffiliation,
  getStatusOfAuthorDisplayNameAlternative,
  isInteresting,
  removeDuplicates,
  updateNewEventsWithExistingMetadata,
} from '../events';
import type { AuthorsResult, ORCID, WorksResult } from '@univ-lehavre/biblio-openalex-types';
import type { ConfigError } from 'effect/ConfigError';
import type { IEvent, Status } from '../events/types';
import { IContext } from '../context/types';

const insert_new_ORCID = (): Effect.Effect<void, Error | ConfigError, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const orcid_raw = (yield* text(
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
    const orcid = asORCID(`https://orcid.org/${orcid_raw}`);
    yield* updateContextStore({ type: 'author', id: orcid });
    const authors = yield* searchAuthorByORCID([orcid]);
    const items = yield* buildAuthorResultsPendingEvents(authors);
    yield* updateEventsStore(items);
  });

const extendsEventsWithAlternativeStrings = (): Effect.Effect<
  void,
  Error | ConfigError,
  ContextStore | EventsStore
> =>
  Effect.gen(function* () {
    const orcid: ORCID = yield* getORCID();
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
    const uniques = removeDuplicates(filteredNewItems);
    if (uniques.length > 0) yield* updateEventsStore(uniques);
  });

const hasEventsForThisORCID = (): Effect.Effect<boolean, Error, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const orcid: string = yield* getORCID();
    const events: IEvent[] = yield* getEvents();
    if (events.length === 0) return false;
    const hasSome: boolean = events.some(event => event.entity === 'author' && event.id === orcid);
    return hasSome;
  });

const removeAuthorPendings = (): Effect.Effect<void, Error, ContextStore | EventsStore> =>
  Effect.gen(function* () {
    const orcid: ORCID = yield* getORCID();
    const events = yield* getEvents();
    const notPendings = events.filter(
      event => !isInteresting(event, { id: orcid, status: 'pending' }),
    );
    yield* setEventsStore(notPendings);
  });

const checkWork = (orcid: ORCID, authorOpenalexID: string, work: WorksResult) =>
  Effect.gen(function* () {
    // On regarde chaque publication
    const authorships = work.authorships;
    if (authorships.length === 0) return;
    const authorship = authorships.find(author => author.author.id === authorOpenalexID);
    if (authorship === undefined) {
      const event = yield* buildEvent({
        from: work.id,
        id: orcid,
        entity: 'work',
        field: 'id',
        value: work.id,
        label: buildReference(work),
        status: 'rejected',
      });
      yield* updateEventsStore([event]);
      return;
    }
    const status = getStatusOfAuthorDisplayNameAlternative(
      authorship.raw_author_name,
      orcid,
      yield* getEvents(),
    );
    if (status === 'rejected') {
      const event = yield* buildEvent({
        from: work.id,
        id: orcid,
        entity: 'work',
        field: 'id',
        value: work.id,
        label: buildReference(work),
        status: 'rejected',
      });
      yield* updateEventsStore([event]);
      return;
    } else if (status === undefined) {
      const confirmed = yield* confirm(
        `Acceptez-vous d'ajouter "${authorship.raw_author_name}" comme forme imprimée pour l'ORCID ${orcid} ?`,
      );
      if (typeof confirmed !== 'boolean') throw new Error('Réponse invalide');
      if (confirmed) {
        const event = yield* buildEvent({
          from: work.id,
          id: orcid,
          entity: 'author',
          field: 'display_name_alternatives',
          value: authorship.raw_author_name,
          status: 'accepted',
        });
        yield* updateEventsStore([event]);
      } else {
        const event = yield* buildEvent({
          from: work.id,
          id: orcid,
          entity: 'author',
          field: 'display_name_alternatives',
          value: authorship.raw_author_name,
          status: 'rejected',
        });
        const event2 = yield* buildEvent({
          from: work.id,
          id: orcid,
          entity: 'work',
          field: 'id',
          value: work.id,
          label: buildReference(work),
          status: 'rejected',
        });
        yield* updateEventsStore([event, event2]);
        return;
      }
    }
    // On passe aux affiliations
    for (const affiliation of authorship.affiliations) {
      const raw_affiliation_string = affiliation.raw_affiliation_string;
      // On regarde s’il n’y a pas déjà une affiliation rejetée
      for (const institutionID of affiliation.institution_ids) {
        const status: Status | undefined = getStatusOfAffiliation(
          institutionID,
          orcid,
          yield* getEvents(),
        );
        if (status === 'rejected') {
          const toPush: IEvent[] = [];
          toPush.push(
            yield* buildEvent({
              from: work.id,
              id: orcid,
              entity: 'work',
              field: 'id',
              value: work.id,
              label: buildReference(work),
              status: 'rejected',
            }),
          );
          toPush.push(
            yield* buildEvent({
              from: work.id,
              id: orcid, // Irrelevant here
              entity: 'institution',
              field: 'display_name_alternatives',
              value: raw_affiliation_string,
              status: 'rejected',
            }),
          );
          yield* updateEventsStore(toPush);
          return;
        } else if (status === undefined) {
          const selected = yield* confirm(
            `${raw_affiliation_string}: Est-ce une affiliation valide pour ce chercheur ?`,
          );
          if (typeof selected !== 'boolean') throw new Error('Réponse invalide');
          if (selected) {
            const toPush: IEvent[] = [];
            toPush.push(
              yield* buildEvent({
                from: work.id,
                id: orcid, // Irrelevant here
                entity: 'institution',
                field: 'display_name_alternatives',
                value: raw_affiliation_string,
                status: 'accepted',
              }),
            );
            yield* updateEventsStore(toPush);
          } else {
            const toPush: IEvent[] = [];
            toPush.push(
              yield* buildEvent({
                from: work.id,
                id: orcid, // Irrelevant here
                entity: 'institution',
                field: 'display_name_alternatives',
                value: raw_affiliation_string,
                status: 'rejected',
              }),
            );
            toPush.push(
              yield* buildEvent({
                from: work.id,
                id: orcid,
                entity: 'work',
                field: 'id',
                value: work.id,
                label: buildReference(work),
                status: 'rejected',
              }),
            );
            for (const institutionID of affiliation.institution_ids) {
              toPush.push(
                yield* buildEvent({
                  from: work.id,
                  id: orcid,
                  entity: 'author',
                  field: 'affiliation',
                  value: institutionID,
                  status: 'rejected',
                }),
              );
            }
            yield* updateEventsStore(toPush);
            return;
          }
        }
      }
      // Si elle est inconnue, on demande à l’utilisateur
      // si il confirme, on émet un événement d’acceptation pour la forme imprimée de l’affiliation
      // si il refuse, on émet un événement de rejet pour la publication et de la forme imprimée de l’affiliation
    }
    const event: IEvent = yield* buildEvent({
      from: work.id,
      id: orcid,
      entity: 'work',
      field: 'id',
      value: work.id,
      label: buildReference(work),
      status: 'accepted',
    });
    const event2: IEvent = yield* buildEvent({
      from: work.id,
      id: orcid,
      entity: 'author',
      field: 'openalexID',
      value: authorOpenalexID,
      status: 'accepted',
    });
    yield* updateEventsStore([event, event2]);
  });

const extendsToWorks = () =>
  Effect.gen(function* () {
    const { id }: IContext = yield* getContext();
    if (id === undefined) return;
    const openalexIDs = getOpenAlexIDs(id, yield* getEvents());
    for (const authorOpenalexID of openalexIDs) {
      // On travaille sur un chercheur
      const works = yield* searchWorksByAuthorIDs([authorOpenalexID]);
      if (works.length === 0) continue;
      for (const work of works) {
        yield* checkWork(id, authorOpenalexID, work);
      }
    }
  });

export {
  insert_new_ORCID,
  removeAuthorPendings,
  hasEventsForThisORCID,
  extendsEventsWithAlternativeStrings,
  extendsToWorks,
};
