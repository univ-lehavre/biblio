import { Effect } from 'effect';
import { actions, active_actions } from './actions';
import { action2option, print_title, select } from './prompt';
import { loadStores, saveStores, provideContextStore, provideEventsStore } from './store';
import type { Action } from './actions/types';

const start = () =>
  Effect.gen(function* () {
    yield* loadStores();
    yield* Effect.forever(ask());
  });

const ask = () =>
  Effect.gen(function* () {
    yield* print_title();
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
