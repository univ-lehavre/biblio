import { Effect } from 'effect';
import { actions, active_actions } from './actions';
import { action2option, log, print_title, select } from './prompt';
import { loadStores, saveStores, provideContextStore, provideEventsStore } from './store';
import type { Action } from './actions/types';

import { getAffiliations, getDisplayNameAlternatives, getOpenAlexIDs } from './events';

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
