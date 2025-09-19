import { Effect, Ref } from 'effect';
import { load, save, Store } from './store';
import { action2option, print_title, select } from './prompt';
import { active_actions, switcher, Tasks } from './actions';
import type { IState } from './store/types';

const start = (file: string = 'state.json') =>
  Effect.gen(function* () {
    const store = yield* Store;
    yield* load(file);
    yield* print_title();
    while (true) {
      const state = yield* Ref.get(store);
      const options = active_actions(state).map(action2option);
      const selected_action = yield* select(Tasks.WHAT, 'Erreur lors de la sélection', options);
      yield* switcher(selected_action.toString());
      yield* save();
    }
  });

Effect.runPromiseExit(start().pipe(Effect.provideServiceEffect(Store, Ref.make({} as IState))));
