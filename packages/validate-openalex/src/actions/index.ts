import color from 'picocolors';
import { Effect, Ref } from 'effect';
import type { Action, IState } from '../types';
import { hasPending, saveState, Store } from '../store';
import { outro, select } from '@clack/prompts';
import { set_ORCID, setStatus } from './utils';

enum Tasks {
  WHAT = 'Que souhaitez-vous faire ?',
  ORCID = 'Sélectionner un chercheur avec son ORCID',
  ROR = 'Ajouter une affilication pour ce chercheur',
  DOI = 'Ajouter une publication pour ce chercheur',
  FIP = 'Fiabiliser les formes imprimées du patronyme de ce chercheur',
  FIN = 'Fiabiliser le parcours du chercheur',
  FIA = 'Fiabiliser les formes imprimées des affiliations',
  EXIT = 'Quitter l’application',
}

const actions: Action[] = [
  {
    name: Tasks.FIP,
    isActive: (state: IState) =>
      state.context.type === 'author' &&
      hasPending(state, {
        orcid: state.context.id,
        entity: 'author',
        field: 'display_name_alternatives',
      }),
  },
  {
    name: Tasks.FIN,
    isActive: (state: IState) =>
      state.context.type === 'author' &&
      hasPending(state, {
        orcid: state.context.id,
        entity: 'author',
        field: 'institution',
      }),
  },
  {
    name: Tasks.FIA,
    isActive: (state: IState) =>
      state.context.type === 'author' &&
      hasPending(state, {
        entity: 'institution',
        field: 'display_name_alternatives',
      }),
  },
  {
    name: Tasks.ROR,
    isActive: (state: IState) => state.context.type === 'author',
  },
  {
    name: Tasks.DOI,
    isActive: (state: IState) => state.context.type === 'author',
  },
  {
    name: Tasks.ORCID,
    isActive: (state: IState) => !!state,
  },
  {
    name: Tasks.EXIT,
    isActive: (state: IState) => !!state,
  },
];

const build_actions_list = () =>
  Effect.gen(function* () {
    const store = yield* Store;
    const state = yield* Ref.get(store);
    const available_actions = actions
      .filter(action => action.isActive(state))
      .map(action => ({ value: action.name, label: action.name }));
    return available_actions;
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
    const store = yield* Store;
    const state = yield* Ref.get(store);
    switch (action_id) {
      case Tasks.ORCID:
        yield* set_ORCID();
        break;
      case Tasks.FIP:
        yield* setStatus(
          {
            orcid: state.context.id,
            entity: 'author',
            field: 'display_name_alternatives',
          },
          'Sélectionnez les formes graphiques correspondantes à ce chercheur',
        );
        break;
      case Tasks.FIN:
        yield* setStatus(
          {
            orcid: state.context.id,
            entity: 'author',
            field: 'institution',
          },
          'Sélectionnez les affiliations correspondantes au chercheur',
        );
        break;
      case Tasks.EXIT:
        yield* saveState();
        outro(`${color.bgGreen(color.black(` Fin `))}`);
        process.exit(0);
    }
  });

export { actions, build_actions_list, select_action, switcher };
