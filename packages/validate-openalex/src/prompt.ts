import { Effect, Ref } from 'effect';
import { Store } from './store';
import { intro } from '@clack/prompts';
import color from 'picocolors';

const print_title = () =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    const title =
      state.context.id !== undefined ? `${state.context.label} (${state.context.id})` : 'OpenAlex';
    console.clear();
    intro(`${color.bgCyan(color.black(` ${title} `))}\n`);
  });

export { print_title };
