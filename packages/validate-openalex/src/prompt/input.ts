import color from 'picocolors';
import { Effect } from 'effect';
import { getContext } from '../context';
import { ContextStore } from '../store';
import {
  type Option,
  log,
  intro,
  outro,
  select as select_prompt,
  multiselect as multiselect_prompt,
  text as text_prompt,
} from '@clack/prompts';
import type { IContext } from '../store/types';

const print_title = (): Effect.Effect<void, never, ContextStore> =>
  Effect.gen(function* () {
    const context: IContext = yield* getContext();
    const title = context.id !== undefined ? `${context.label} (${context.id})` : 'OpenAlex';
    console.clear();
    intro(`${color.bgCyan(color.black(` ${title} `))}\n`);
  });

const end = () => outro(`${color.bgGreen(color.black(` Fin `))}`);

const select = (message: string, options: Option<string>[]) =>
  Effect.tryPromise({
    try: () =>
      select_prompt({
        message,
        options,
      }),
    catch: cause => new Error('Erreur lors de la sélection', { cause }),
  });

const multiselect = (message: string, required: boolean, options: Option<string>[]) =>
  Effect.tryPromise({
    try: () =>
      multiselect_prompt({
        message,
        options,
        required,
      }),
    catch: cause => new Error('Erreur lors de la sélection', { cause }),
  });

const text = (
  message: string,
  placeholder: string,
  validate: (value: string | undefined) => string | undefined | Error,
) =>
  Effect.tryPromise({
    try: () =>
      text_prompt({
        message,
        placeholder,
        validate,
      }),
    catch: () => new Error('Erreur lors de la saisie'),
  });

export { select, multiselect, text, print_title, end, log };
