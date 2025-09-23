import { Effect } from 'effect';
import { getContext } from '../context';
import { ContextStore } from '../store';
import { getEventData } from './getter';
import { buildIntegrity } from '../tools';
import type { AuthorsResult, IInstitution } from '../fetch/types';
import type { IEvent } from './types';

const buildEvent = (
  partial: Omit<IEvent, 'dataIntegrity' | 'createdAt' | 'updatedAt' | 'hasBeenExtendedAt'>,
): Effect.Effect<IEvent, never, ContextStore> =>
  Effect.gen(function* () {
    const dataIntegrity: string = yield* buildIntegrity(getEventData(partial));
    const createdAt: string = new Date().toISOString();
    const event: IEvent = {
      ...partial,
      dataIntegrity,
      createdAt,
      updatedAt: createdAt,
      hasBeenExtendedAt: 'never',
    };
    return event;
  });

const buildPendingAuthorEvent = (
  partial: Omit<
    IEvent,
    'status' | 'dataIntegrity' | 'createdAt' | 'updatedAt' | 'hasBeenExtendedAt'
  >,
): Effect.Effect<IEvent, never, ContextStore> =>
  Effect.gen(function* () {
    const event: IEvent = yield* buildEvent({
      ...partial,
      status: 'pending',
    });
    return event;
  });

const buildAuthorResultsPendingEvents = (
  authors: AuthorsResult[],
): Effect.Effect<IEvent[], never, ContextStore> =>
  Effect.gen(function* () {
    const items: IEvent[] = [];
    const orcid: string | undefined = (yield* getContext()).id;
    if (!orcid) throw new Error('No orcid in context');
    for (const author of authors) {
      const openalexID = author.id;
      // Traitement des données personnelles de l'auteur
      for (const display_name_alternative of author.display_name_alternatives ?? []) {
        const event: IEvent = yield* buildPendingAuthorEvent({
          from: openalexID,
          id: orcid,
          entity: 'author',
          field: 'display_name_alternatives',
          value: display_name_alternative,
        });
        items.push(event);
      }
      // Traitement des affiliations
      for (const affiliation of author.affiliations) {
        const institution: IInstitution = affiliation.institution;
        const event: IEvent = yield* buildPendingAuthorEvent({
          from: openalexID,
          id: orcid,
          entity: 'author',
          field: 'affiliation',
          value: institution.id,
          label: institution.display_name,
        });
        items.push(event);
      }
    }
    return items;
  });

export { buildAuthorResultsPendingEvents };
