import color from 'picocolors';
import { Store } from '../store';
import { Effect, Ref } from 'effect';
import { intro, type Option } from '@clack/prompts';
import type { Action } from '../actions/types';
import type { IEvent } from '../events/types';

const print_title = (): Effect.Effect<void, never, Store> =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    const title =
      state.context.id !== undefined ? `${state.context.label} (${state.context.id})` : 'OpenAlex';
    console.clear();
    intro(`${color.bgCyan(color.black(` ${title} `))}\n`);
  });

const action2option = (action: Action): Option<string> => ({ value: action.name });
const event2option = (event: IEvent): Option<string> => ({
  value: event.value,
  label: event.label,
});

const string2option = (value: string): Option<string> => ({ value });
const strings2options = (strings: string[]): Option<string>[] => strings.map(string2option);

export { print_title, strings2options, string2option, action2option, event2option, color, Option };
export * from './selector';
export { log } from '@clack/prompts';
