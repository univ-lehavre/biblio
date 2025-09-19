import { Effect } from 'effect';
import { Option, select as select_prompt } from '@clack/prompts';

const select = (message: string, error_message: string, options: Option<string>[]) =>
  Effect.tryPromise({
    try: () =>
      select_prompt({
        message,
        options,
      }),
    catch: cause => new Error(error_message, { cause }),
  });

export { select };
export { outro, multiselect, text } from '@clack/prompts';
