import color from 'picocolors';
import { Store } from '../store';
import { Effect, Ref } from 'effect';
import { intro } from '@clack/prompts';

const print_title = () =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    const title =
      state.context.id !== undefined ? `${state.context.label} (${state.context.id})` : 'OpenAlex';
    console.clear();
    intro(`${color.bgCyan(color.black(` ${title} `))}\n`);
  });

export { print_title, color };
export { outro, select, multiselect, text } from '@clack/prompts';
