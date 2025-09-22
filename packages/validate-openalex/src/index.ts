import { Effect } from 'effect';
import { actions, active_actions } from './actions';
import { action2option, log, print_title, select } from './prompt';
import { loadStores, saveStores, provideContextStore, provideEventsStore } from './store';
import type { Action } from './actions/types';

import {
  getAffiliations,
  getDisplayNameAlternatives,
  getDisplayNames,
  getOpenAlexIDs,
} from './events';

const start = () =>
  Effect.gen(function* () {
    yield* loadStores();
    yield* Effect.forever(ask());
  });

const ask = () =>
  Effect.gen(function* () {
    yield* print_title();
    {
      const openalexIDs = yield* getOpenAlexIDs();
      const display_names = yield* getDisplayNames();
      const display_name_alternatives = yield* getDisplayNameAlternatives();
      const affiliations = yield* getAffiliations();
      log.info(`${openalexIDs.length} OpenAlex IDs : ${openalexIDs.join(', ')}`);
      log.info(`${display_names.length} Display Names : ${display_names.join(', ')}`);
      log.info(
        `${display_name_alternatives.length} Display Name Alternatives : ${display_name_alternatives.join(', ')}`,
      );
      log.info(`${affiliations.length} Affiliations : ${affiliations.join(', ')}`);
    }
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

Effect.runPromiseExit(runnable);
