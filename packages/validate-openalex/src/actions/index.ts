import { hasPending } from '../events';
import type { Action } from './types';
import type { IState } from '../store/types';

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
        field: 'affiliation',
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

export { actions, Tasks };
export * from './getter';
export * from './selecter';
export * from './switcher';
