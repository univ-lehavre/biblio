import { listPending, Store, updateStatus } from '../store';
import { Effect, Ref } from 'effect';
import { multiselect, text } from '@clack/prompts';
import { fetchOpenAlexAPI } from '@univ-lehavre/fetch-openalex';
import type { AuthorsResult } from '@univ-lehavre/openalex-types';
import type { IContext, IEvent } from '../types';
import { PendingOptions } from '../store/types';
import { v7 } from 'uuid';
import { print_title } from '../prompt';

const searchAuthorByName = (names: string[]) =>
  Effect.gen(function* () {
    const authors = yield* fetchOpenAlexAPI<AuthorsResult>('authors', {
      filter: `search:${names.join('|')}`,
    });
    return authors.results;
  });

const filterOutExisting = (incoming: IEvent[], existing: IEvent[]) =>
  incoming.filter(
    i =>
      !existing.some(
        e =>
          e.orcid === i.orcid &&
          e.entity === i.entity &&
          e.field === i.field &&
          e.value === i.value,
      ),
  );

const buildEvents = (orcid: string, authors: AuthorsResult[]): IEvent[] => {
  const items: IEvent[] = [];

  authors.forEach(author =>
    items.push({
      uuid: v7(),
      orcid,
      entity: 'author',
      field: 'display_name',
      value: author.display_name,
      status: 'pending',
      updated_at: new Date().toISOString(),
    }),
  );
  authors.forEach(author =>
    items.push({
      uuid: v7(),
      orcid,
      entity: 'author',
      field: 'id',
      value: author.id,
      status: 'pending',
      updated_at: new Date().toISOString(),
    }),
  );
  authors
    .map(author => author.display_name_alternatives)
    .flat()
    .forEach(alternative => {
      items.push({
        uuid: v7(),
        orcid,
        entity: 'author',
        field: 'display_name_alternatives',
        value: alternative,
        status: 'pending',
        updated_at: new Date().toISOString(),
      });
    });
  authors
    .map(author => author.affiliations)
    .flat()
    .map(affiliation => affiliation.institution)
    .forEach(institution => {
      items.push({
        uuid: v7(),
        orcid,
        entity: 'author',
        field: 'affiliation',
        value: institution.id,
        label: institution.display_name,
        status: 'pending',
        updated_at: new Date().toISOString(),
      });
    });
  return items;
};

const searchAuthorByORCID = (orcid: string[]) =>
  Effect.gen(function* () {
    const authors = yield* fetchOpenAlexAPI<AuthorsResult>('authors', {
      filter: `orcid:${orcid}`,
    });
    return authors.results;
  });

const set_ORCID = () =>
  Effect.gen(function* () {
    const _orcid = yield* Effect.tryPromise({
      try: () =>
        text({
          message: 'Saisissez l’ORCID d’un chercheur',
          placeholder: '0000-0002-1825-0097',
          validate: value => {
            if (!value) return 'L’ORCID est requis';
            const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}(\d|X)$/;
            if (!orcidRegex.test(value)) return 'L’ORCID doit être au format 0000-0000-0000-0000';
          },
        }),
      catch: () => process.exit(0),
    });
    const orcid = _orcid?.toString().trim();

    const authors = yield* searchAuthorByORCID([orcid]);

    const context: IContext = {
      type: 'author',
      id: orcid,
      label: authors.map(author => author.display_name).join(', '),
    };
    const store = yield* Store;
    yield* Ref.update(store, state => ({
      ...state,
      context,
    }));

    // Build events from fetched authors

    const current_state = yield* Ref.get(store);

    const current_authors = current_state.events.filter(a => a.orcid === orcid) ?? [];

    const items = buildEvents(orcid, authors);
    const filtered = filterOutExisting(items, current_authors);

    yield* Ref.update(store, state => ({
      ...state,
      events: [...state.events, ...filtered],
    }));

    yield* setStatus(
      {
        orcid,
        entity: 'author',
        field: 'affiliation',
      },
      'Sélectionnez les affiliations correspondantes à ce chercheur',
    );

    console.clear();
    yield* print_title();
  });

const setStatus = (opts: PendingOptions, message: string) =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    const pendings = listPending(state, opts);
    const options = pendings.map(event => ({
      value: event.value,
      label: event.label ?? event.value,
    }));
    const selected = yield* Effect.tryPromise({
      try: () =>
        multiselect({
          message,
          options,
          required: false,
        }),
      catch: cause => new Error('Erreur lors de la sélection: ', { cause }),
    });
    if (selected instanceof Array) yield* updateStatus(selected, opts);
  });

export { set_ORCID, setStatus, searchAuthorByName, searchAuthorByORCID };
