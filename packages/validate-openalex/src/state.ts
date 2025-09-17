import { Context, Effect, Ref } from 'effect';
import { existsSync, readFileSync } from 'fs';
import { log, text } from '@clack/prompts';
import { IAuthor, IContext, IState } from './types';
import { AuthorsResult } from '@univ-lehavre/openalex-types';
import { fetchOpenAlexAPI } from '@univ-lehavre/fetch-openalex';

class State extends Context.Tag('State')<State, Ref.Ref<IState>>() {}

const loadState = (file: string): Effect.Effect<void, never, State> =>
  Effect.gen(function* () {
    const state = yield* State;
    if (existsSync(file)) {
      const data = readFileSync(file, 'utf-8');
      const parsed: IState = JSON.parse(data);
      yield* Ref.set(state, parsed);
      log.info(`État précédent chargé depuis le fichier "${file}"`);
    }
  });

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
    const state = yield* State;

    const authors = yield* fetchOpenAlexAPI<AuthorsResult>('authors', {
      filter: `orcid:${orcid.toString()}`,
    });

    const context: IContext = {
      type: 'author',
      id: orcid.toString(),
      label: authors.results[0]?.display_name,
    };
    yield* Ref.update(state, state => ({
      ...state,
      context,
    }));

    const items: IAuthor[] = [];

    authors.results.forEach(author =>
      items.push({
        orcid: orcid.toString(),
        type: 'id',
        value: author.id,
        label: author.display_name,
        status: 'pending',
      }),
    );
    authors.results
      .map(author => author.display_name_alternatives)
      .flat()
      .forEach(alternative => {
        items.push({
          orcid: orcid.toString(),
          type: 'display_name_alternatives',
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
          type: 'institution',
          value: institution.id,
          label: institution.display_name,
          status: 'pending',
        });
      });
    const current_state = yield* Ref.get(state);

    const current_authors = current_state.authors?.filter(a => a.orcid === orcid.toString()) ?? [];

    const filterOutExisting = (incoming: IAuthor[], existing: IAuthor[]) =>
      incoming.filter(
        i => !existing.some(e => e.orcid === i.orcid && e.type === i.type && e.value === i.value),
      );

    const filtered = filterOutExisting(items, current_authors);

    yield* Ref.update(state, state => ({
      ...state,
      authors: [...(state.authors ?? []), ...filtered],
    }));
  });

// const set_graphical_forms = () =>
//   Effect.gen(function* () {
//     yield* Effect.logInfo('Fiabilisation des formes graphiques');
//     const state = yield* Ref.get(yield* State);
//     const pendings = state.authors?.filter(
//       author =>
//         author.orcid === state.context?.id &&
//         author.status === 'pending' &&
//         author.type === 'display_name_alternatives',
//     );
//     const opts = pendings?.map(author => ({ value: author.value, label: author.value })) ?? [];
//     const selected = yield* Effect.tryPromise({
//       try: () =>
//         multiselect({
//           message: 'Sélectionnez les formes graphiques correspondantes au chercheur',
//           options: opts,
//         }),
//       catch: cause => new Error('Erreur lors de la sélection de la forme graphique: ', { cause }),
//     });
//     const final = state.map(s => {
//       //if (s.authors.orcid === state.context?.id && selected.map.includes(s.authors.value)) {}
//     });
//   });

export { loadState, set_ORCID, State };
