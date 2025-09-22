// import { Effect, Ref } from 'effect';
// import { EventsStore } from '../store';
// import { getEvents, hasDuplicates, isUnique } from '../events';
// import type { IEvent } from './types';

// const insertManyEvents = (newEvents: IEvent[]) =>
//   Effect.gen(function* () {
//     if (!isUnique(newEvents)) throw new Error(`Duplicate event UUID detected in new events`);
//     if (hasDuplicates(yield* getEvents(), newEvents))
//       throw new Error(`Duplicate event UUID detected between existing and new events`);
//     yield* updateEventsStores([...events, ...newEvents]);
//     const store = yield* EventsStore;
//     yield* Ref.update(store, events => [...events, ...newEvents]);
//   });

// const upsertManyAuthors = () =>
//   Effect.gen(function* () {
//     const events = yield* getEvents();
//     const orcid = yield* getORCID();
//     const names = filterAuthorDisplayNameAlternativesAccepted(events, orcid).map(e => e.value);
//     const authors = yield* searchAuthorByName(names);
//     const items = yield* buildAuthorResultsPendingEvents(authors);
//     // Supprimer les doublons dans l’existant
//     yield* update_store_events([...state.events, ...items]);
//   });

// export { insertManyEvents };
