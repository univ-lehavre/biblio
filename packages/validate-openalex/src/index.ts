import { Effect, Ref } from 'effect';
import { print_title } from './prompt';
import { loadState, save, Store } from './store';
import { build_actions_list, select_action, switcher } from './actions';
import type { IState } from './store/types';

const start = (file: string) =>
  Effect.gen(function* () {
    yield* loadState(file);
    yield* print_title();
    while (true) {
      const options = yield* build_actions_list();
      const selected_action = yield* select_action(options);
      yield* switcher(selected_action.toString());
      yield* save();
    }
  });

Effect.runPromiseExit(
  start('state.json').pipe(Effect.provideServiceEffect(Store, Ref.make({} as IState))),
);
