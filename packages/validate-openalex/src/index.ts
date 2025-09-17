import { intro } from '@clack/prompts';
import { Effect, Ref } from 'effect';
import color from 'picocolors';
import type { IState } from './types';
import { loadState, saveState, Store } from './store';
import { build_actions_list, select_action, switcher } from './actions';

const print_title = () =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    const title =
      state.context.id !== null ? `${state.context.label} (${state.context.id})` : 'OpenAlex';
    console.clear();
    intro(`${color.bgCyan(color.black(` ${title} `))}\n`);
  });

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
