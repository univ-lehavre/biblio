import { Tasks } from '.';
import { Effect } from 'effect';
import { select } from '../prompt';

const select_action = (
  options: { value: string; label: string }[],
): Effect.Effect<string | symbol, Error, never> =>
  Effect.tryPromise({
    try: () =>
      select({
        message: Tasks.WHAT,
        options,
      }),
    catch: cause => new Error("Erreur lors de la sélection de l'action: ", { cause }),
  });

export { select_action };
