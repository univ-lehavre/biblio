import { intro } from '@clack/prompts';
import { Effect, Ref } from 'effect';
import color from 'picocolors';
import type { ConfigError, IState } from './types';
import { loadState, State } from './state';
import { build_actions_list, select_action, switcher } from './actions';

const start = (file: string): Effect.Effect<void, Error | ConfigError, State> =>
  Effect.gen(function* () {
    console.clear();
    yield* loadState(file);
    const state = yield* Ref.get(yield* State);
    const title = state.context ? `${state.context.label} (${state.context.id})` : 'OpenAlex';
    intro(`${color.bgCyan(color.black(` ${title} `))}\n`);
    const options = yield* build_actions_list();
    console.log(options);
    if (options) {
      const selected_action = yield* select_action(options);
      yield* switcher(selected_action.toString());
    }
  });

Effect.runPromiseExit(
  start('state.json').pipe(Effect.provideServiceEffect(State, Ref.make({} as IState))),
);
