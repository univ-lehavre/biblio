import { Effect, Ref } from 'effect';
import type { IState } from './types';
import { loadState, saveState, Store } from './store';
import { build_actions_list, select_action, switcher } from './actions';
import { print_title } from './prompt';

const start = (file: string) =>
  Effect.gen(function* () {
    yield* loadState(file);
    yield* print_title();
    while (true) {
      const options = yield* build_actions_list();
      const selected_action = yield* select_action(options);
      yield* switcher(selected_action.toString());
      yield* saveState();
    }
  });

Effect.runPromiseExit(
  start('state.json').pipe(Effect.provideServiceEffect(Store, Ref.make({} as IState))),
);
