import { hasPending } from '../events';
import type { IState } from '../store/types';
import type { Action } from './types';

enum Tasks {
  WHAT = 'Que souhaitez-vous faire ?',
  EXIT = 'Quitter l’application',
  // Actions tout le temps actives
  ORCID = 'Sélectionner un chercheur',
  ROR = 'Sélectionner une institution',
  DOI = 'Sélectionner une publication',

  // Auteurs // Ajout
  AUTH_AFF = 'Ajouter une affilication pour ce chercheur',
  AUTH_DOI = 'Ajouter une publication pour ce chercheur',
  // Auteurs // Fiabilisation
  AUTH_FIP = 'Fiabiliser les formes imprimées du patronyme de ce chercheur',
  AUTH_FIN = 'Fiabiliser le parcours de ce chercheur',
  AUTH_FPU = 'Fiabiliser les publications de ce chercheur',

  // Institutions // Fiabilisation
  INST_FIA = 'Fiabiliser les formes imprimées des institutions',
  INST_RES = 'Fiabiliser les chercheurs d’une institution',
}

const actions: Action[] = [
  {
    name: Tasks.AUTH_FIP,
    isActive: (state: IState) =>
      state.context.type === 'author' &&
      hasPending(state, {
        orcid: state.context.id,
        entity: 'author',
        field: 'display_name_alternatives',
      }),
  },
  {
    name: Tasks.AUTH_FIN,
    isActive: (state: IState) =>
      state.context.type === 'author' &&
      hasPending(state, {
        orcid: state.context.id,
        entity: 'author',
        field: 'affiliation',
      }),
  },
  {
    name: Tasks.INST_FIA,
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
