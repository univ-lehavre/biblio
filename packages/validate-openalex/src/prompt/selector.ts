import { Effect } from 'effect';
import {
  Option,
  select as select_prompt,
  multiselect as multiselect_prompt,
  text as text_prompt,
} from '@clack/prompts';

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

export { select, multiselect, text };
export { outro } from '@clack/prompts';
