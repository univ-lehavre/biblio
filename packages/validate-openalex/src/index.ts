import { Effect } from 'effect';
import { actions, active_actions } from './actions';
import { action2option, print_title, select } from './prompt';
import { loadStores, saveStores, provideContextStore, provideEventsStore } from './store';
import type { Action } from './actions/types';

const start = () =>
  Effect.gen(function* () {
    yield* loadStores();
    yield* print_title();
    yield* Effect.forever(ask());
  });

const ask = () =>
  Effect.gen(function* () {
    const options = (yield* active_actions()).map(action2option);
    const selected_action_value = yield* select('Que souhaitez-vous faire ?', options);
    const action: Action | undefined = actions.find(
      action => action.name === selected_action_value.toString(),
    );
    if (action) yield* action.action();
    yield* saveStores();
  });

Effect.runPromiseExit(start().pipe(provideContextStore(), provideEventsStore()));
