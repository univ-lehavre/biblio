import { Store } from '../store';
import { Effect, Ref } from 'effect';
import { searchAuthorByORCID } from '../fetch';
import { multiselect, print_title, text } from '../prompt';
import { buildPendingAuthorEvent, listPending, updateStatus } from '../events';
import type { IContext, IState } from '../store/types';
import type { AuthorsResult } from '../fetch/types';
import type { PendingOptions } from './types';
import type { IEvent } from '../events/types';

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

  // display_name and id per author
  authors.forEach(author => {
    items.push(
      buildPendingAuthorEvent({ orcid, field: 'display_name', value: author.display_name }),
    );
    items.push(buildPendingAuthorEvent({ orcid, field: 'id', value: author.id }));
  });

  // display_name_alternatives (flattened)
  authors
    .flatMap(author => author.display_name_alternatives ?? [])
    .forEach(alternative =>
      items.push(
        buildPendingAuthorEvent({ orcid, field: 'display_name_alternatives', value: alternative }),
      ),
    );

  // affiliations -> institution
  authors
    .flatMap(author => author.affiliations ?? [])
    .flatMap(aff => [aff.institution])
    .forEach(institution =>
      items.push(
        buildPendingAuthorEvent({
          orcid,
          field: 'affiliation',
          value: institution.id,
          label: institution.display_name,
        }),
      ),
    );

  return items;
};

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

    const current_state: IState = yield* Ref.get(store);

    const current_authors = current_state.events.filter(a => a.orcid === orcid) ?? [];

    const items = buildEvents(orcid, authors);
    const filtered = filterOutExisting(items, current_authors);

    yield* Ref.update(store, state => ({
      ...state,
      events: [...state.events, ...filtered],
    }));

    yield* setStatus('Sélectionnez les patronymes correspondants à ce chercheur', {
      orcid,
      entity: 'author',
      field: 'display_name',
    });

    yield* setStatus('Sélectionnez les affiliations correspondantes à ce chercheur', {
      orcid,
      entity: 'author',
      field: 'affiliation',
    });

    console.clear();
    yield* print_title();
  });

const setStatus = (message: string, opts: PendingOptions) =>
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

export { set_ORCID, setStatus };
