import { Effect, Ref } from 'effect';
import { load, save, Store } from './store';
import { action2option, print_title } from './prompt';
import { active_actions, select_action, switcher } from './actions';
import type { IState } from './store/types';

const start = (file: string) =>
  Effect.gen(function* () {
    const store = yield* Store;
    yield* load(file);
    yield* print_title();
    while (true) {
      const state = yield* Ref.get(store);
      const options = active_actions(state).map(action2option);
      const selected_action = yield* select_action(options);
      yield* switcher(selected_action.toString());
      yield* save();
    }
  });

Effect.runPromiseExit(
  start('state.json').pipe(Effect.provideServiceEffect(Store, Ref.make({} as IState))),
);
