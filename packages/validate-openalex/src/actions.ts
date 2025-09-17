import color from 'picocolors';
import { Effect, Ref } from 'effect';
import { Action, IState } from './types';
import { set_ORCID, State } from './state';
import { outro, select } from '@clack/prompts';
import { copyFileSync, existsSync, writeFileSync } from 'fs';

const actions: Action[] = [
  {
    name: 'Sélectionner un chercheur avec son ORCID',
    type: 'action',
    isActive: (state?: IState) => !(state?.context?.type === 'author'),
  },
  {
    name: 'Quitter l’application',
    type: 'action',
    isActive: () => true,
  },
];

const list_current_tasks = () =>
  Effect.gen(function* () {
    const state = yield* Ref.get(yield* State);
    const current_tasks =
      state.authors
        ?.filter(
          author =>
            author.orcid === state.context?.id &&
            author.status === 'pending' &&
            author.type === 'display_name_alternatives',
        )
        .map(author => ({ value: author.value, label: author.value })) ?? [];
    return current_tasks;
  });

const build_actions_list = () =>
  Effect.gen(function* () {
    const state = yield* Ref.get(yield* State);
    const available_actions = actions
      .filter(action => action.isActive(state))
      .map(action => ({ value: action.name, label: action.name }));
    const hasTasks = (yield* list_current_tasks()).length > 0;
    const result = [];
    if (hasTasks)
      result.push({
        value: 'Fiabiliser les formes graphiques',
        label: 'Fiabiliser les formes graphiques',
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
        message: 'Que souhaitez-vous faire ?',
        options,
      }),
    catch: cause => new Error("Erreur lors de la sélection de l'action: ", { cause }),
  });

const exit = (): Effect.Effect<never, never, State> =>
  Effect.gen(function* () {
    const state = yield* State;
    if (existsSync('state.json'))
      copyFileSync('state.json', `state-${new Date().toISOString().replaceAll(/[:.]/g, '-')}.json`);
    const value = yield* Ref.get(state);
    writeFileSync('state.json', JSON.stringify(value, null, 2), 'utf-8');
    outro(`${color.bgGreen(color.black(` Fin `))}`);
    process.exit(0);
  });

const switcher = (action_id: string) =>
  Effect.gen(function* () {
    switch (action_id) {
      case 'Sélectionner un chercheur avec son ORCID':
        yield* set_ORCID();
        break;
      //   case 'Fiabiliser les formes graphiques':
      //     yield* set_graphical_forms();
      //     break;
      case 'Quitter l’application':
        yield* exit();
        break;
    }
  });

export { actions, build_actions_list, select_action, switcher };
