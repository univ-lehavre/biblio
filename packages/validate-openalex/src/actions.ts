import color from 'picocolors';
import { Effect, Ref } from 'effect';
import type { Action, IField, IState } from './types';
import { saveState, set_ORCID, State } from './store';
import { outro, select } from '@clack/prompts';

enum Tasks {
  WHAT = 'Que souhaitez-vous faire ?',
  ORCID = 'Sélectionner un chercheur avec son ORCID',
  ROR = 'Ajouter une affilication pour ce chercheur',
  DOI = 'Ajouter une publication pour ce chercheur',
  FGA = 'Fiabiliser les formes graphiques de ce chercheur',
  EXIT = 'Quitter l’application',
}

const actions: Action[] = [
  {
    name: Tasks.ROR,
    isActive: (state: IState) => !state.context.id,
  },
  {
    name: Tasks.DOI,
    isActive: (state: IState) => !(state.context?.type === 'work'),
  },
  {
    name: Tasks.ORCID,
  },
  {
    name: Tasks.EXIT,
  },
];

const list_current_tasks = (field: IField) =>
  Effect.gen(function* () {
    const state = yield* Ref.get(yield* State);
    const current_tasks =
      state.events
        .filter(
          event =>
            event.status === 'pending' &&
            event.orcid === state.context.id &&
            event.entity === 'author' &&
            event.field === field,
        )
        .map(event => ({ value: event.value, label: event.value })) ?? [];
    return current_tasks;
  });

const build_actions_list = () =>
  Effect.gen(function* () {
    const state = yield* Ref.get(yield* State);
    const available_actions = actions
      .filter(action => action.isActive?.(state))
      .map(action => ({ value: action.name, label: action.name }));
    const hasTasks = (yield* list_current_tasks('display_name_alternatives')).length > 0;
    const result = [];
    if (hasTasks)
      result.push({
        value: Tasks.FGA,
        label: Tasks.FGA,
      });
    result.push(...available_actions);
    return result;
  });

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

const switcher = (action_id: string) =>
  Effect.gen(function* () {
    switch (action_id) {
      case Tasks.ORCID:
        yield* set_ORCID();
        break;
      //   case Tasks.FGA:
      //     yield* set_graphical_forms();
      //     break;
      case Tasks.EXIT:
        yield* saveState();
        outro(`${color.bgGreen(color.black(` Fin `))}`);
        process.exit(0);
    }
  });

export { actions, build_actions_list, select_action, switcher };
