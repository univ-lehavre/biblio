import { Effect, Ref } from 'effect';
import { load, provideStore, save, Store } from './store';
import { active_actions, switcher, Tasks } from './actions';
import { action2option, print_title, select } from './prompt';

const start = (file: string = 'state.json') =>
  Effect.gen(function* () {
    const store = yield* Store;
    yield* load(file);
    yield* print_title();
    while (true) {
      const state = yield* Ref.get(store);
      const options = active_actions(state).map(action2option);
      const selected_action = yield* select(Tasks.WHAT, options);
      yield* switcher(selected_action.toString());
      yield* save();
    }
  });

Effect.runPromiseExit(start().pipe(provideStore));
