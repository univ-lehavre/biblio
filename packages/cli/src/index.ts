import { log } from '@clack/prompts';
import type { Action } from '@univ-lehavre/biblio-validate-openalex';
import {
  action2option,
  actions,
  active_actions,
  getAffiliations,
  getDisplayNameAlternatives,
  getOpenAlexIDs,
  loadStores,
  print_title,
  provideContextStore,
  provideEventsStore,
  saveStores,
  select,
} from '@univ-lehavre/biblio-validate-openalex';
import { Effect } from 'effect';

const start = () =>
  Effect.gen(function* () {
    yield* loadStores();
    yield* Effect.forever(ask());
  });

const dashboard = () =>
  Effect.gen(function* () {
    const openalexIDs = yield* getOpenAlexIDs();
    const display_name_alternatives = yield* getDisplayNameAlternatives();
    const affiliations = yield* getAffiliations();
    if (openalexIDs !== undefined && openalexIDs.length > 0)
      log.info(`${openalexIDs.length} OpenAlex IDs : ${openalexIDs.join(', ')}`);
    if (display_name_alternatives.length > 0)
      log.info(
        `${display_name_alternatives.length} Display Name Alternatives : ${display_name_alternatives.join(', ')}`,
      );
    if (affiliations.length > 0)
      log.info(`${affiliations.length} Affiliations : ${affiliations.join(', ')}`);
  });

const ask = () =>
  Effect.gen(function* () {
    // console.clear();
    yield* print_title();
    yield* dashboard();
    const actives: Action[] = yield* active_actions();
    const options = actives.map(action2option);
    const selected_action_value = (yield* select('Que souhaitez-vous faire ?', options)).toString();
    const action: Action | undefined = actions.find(
      action => action.name === selected_action_value,
    );
    if (action) {
      yield* action.action();
    } else {
      console.log('Action non trouvée');
    }
    yield* saveStores();
  });

const runnable = start().pipe(provideEventsStore(), provideContextStore());

Effect.runPromiseExit(runnable).then(console.log).catch(console.error);
