import { Effect, Ref } from 'effect';
import { load, provideStore, save, Store } from './store';
import { actions, active_actions, Tasks } from './actions';
import { action2option, print_title, select } from './prompt';
import { Action } from './actions/types';

const start = (file: string = 'state.json') =>
  Effect.gen(function* () {
    const store = yield* Store;
    yield* load(file);
    yield* print_title();
    while (true) {
      const state = yield* Ref.get(store);
      const options = active_actions(state).map(action2option);
      const selected_action_value = yield* select(Tasks.WHAT, options);
      const action: Action | undefined = actions.find(
        action => action.name === selected_action_value.toString(),
      );
      if (action) yield* action.action();
      yield* save();
    }
  });

Effect.runPromiseExit(start().pipe(provideStore()));
