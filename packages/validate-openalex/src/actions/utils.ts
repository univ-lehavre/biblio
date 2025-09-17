import { listPending, Store } from '../store';
import { Effect, Ref } from 'effect';
import { multiselect, text } from '@clack/prompts';
import { fetchOpenAlexAPI } from '@univ-lehavre/fetch-openalex';
import type { AuthorsResult } from '@univ-lehavre/openalex-types';
import type { IContext, IEvent } from '../types';

const set_ORCID = () =>
  Effect.gen(function* () {
    const orcid = yield* Effect.tryPromise({
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

    const authors = yield* fetchOpenAlexAPI<AuthorsResult>('authors', {
      filter: `orcid:${orcid.toString()}`,
    });

    const context: IContext = {
      type: 'author',
      id: orcid.toString(),
      label: authors.results.map(author => author.display_name).join(', '),
    };
    const state = yield* Store;
    yield* Ref.update(state, state => ({
      ...state,
      context,
    }));

    const items: IEvent[] = [];

    authors.results.forEach(author =>
      items.push({
        orcid: orcid.toString(),
        entity: 'author',
        field: 'display_name',
        value: author.display_name,
        status: 'pending',
      }),
    );
    authors.results.forEach(author =>
      items.push({
        orcid: orcid.toString(),
        entity: 'author',
        field: 'id',
        value: author.id,
        status: 'pending',
      }),
    );
    authors.results
      .map(author => author.display_name_alternatives)
      .flat()
      .forEach(alternative => {
        items.push({
          orcid: orcid.toString(),
          entity: 'author',
          field: 'display_name_alternatives',
          value: alternative,
          status: 'pending',
        });
      });
    authors.results
      .map(author => author.affiliations)
      .flat()
      .map(affiliation => affiliation.institution)
      .forEach(institution => {
        items.push({
          orcid: orcid.toString(),
          entity: 'author',
          field: 'institution',
          value: institution.id,
          label: institution.display_name,
          status: 'pending',
        });
      });

    const current_state = yield* Ref.get(state);

    const current_authors = current_state.events.filter(a => a.orcid === orcid.toString()) ?? [];

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

    const filtered = filterOutExisting(items, current_authors);

    yield* Ref.update(state, state => ({
      ...state,
      events: [...(state.events ?? []), ...filtered],
    }));
  });

const set_graphical_forms = () =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    const pendings = listPending(state, {
      orcid: state.context.id,
      entity: 'author',
      field: 'display_name_alternatives',
    });
    const opts = pendings?.map(event => ({ value: event.value, label: event.value })) ?? [];
    const selected = yield* Effect.tryPromise({
      try: () =>
        multiselect({
          message: 'Sélectionnez les formes graphiques correspondantes au chercheur',
          options: opts,
        }),
      catch: cause => new Error('Erreur lors de la sélection de la forme graphique: ', { cause }),
    });
    return selected;
  });

export { set_ORCID, set_graphical_forms };
