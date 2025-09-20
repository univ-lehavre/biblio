import type { IState } from '../store/types';
import type { Action } from './types';
import { isVisible } from './tester';
import { save_and_exit } from '../store';
import {
  insert_new_ORCID,
  mark_affiliations_alternative_strings_reliable,
  mark_authors_alternative_strings_reliable,
  mark_authors_display_name_reliable,
} from '../events';

enum Tasks {
  WHAT = 'Que souhaitez-vous faire ?',

  // Auteurs // Fiabilisation
  AUTH_FAN = 'Fiabiliser le patronyme de ce chercheur',
  AUTH_FAN_Q = 'Sélectionnez le patronyme correspondant à ce chercheur',

  AUTH_FIP = 'Fiabiliser les formes imprimées du patronyme de ce chercheur',
  AUTH_FIP_Q = 'Sélectionnez les formes imprimées correspondantes à ce chercheur',

  AUTH_FIN = 'Fiabiliser le parcours de ce chercheur',
  AUTH_FIN_Q = 'Sélectionnez les affiliations correspondantes à ce chercheur',

  // Institutions // Fiabilisation
  INST_FIA = 'Fiabiliser les formes imprimées des institutions',
  INST_FIA_Q1 = 'Sélectionnez l’institution à fiabiliser',
  INST_FIA_Q2 = 'Sélectionnez les formes imprimées correspondantes à cette institution',

  AUTH_FPU = 'Fiabiliser les publications de ce chercheur',

  // Institutions // Fiabilisation
  INST_RES = 'Fiabiliser les chercheurs d’une institution',

  // Auteurs // Ajout
  AUTH_AFF = 'Ajouter une affilication pour ce chercheur',
  AUTH_DOI = 'Ajouter une publication pour ce chercheur',

  // Actions tout le temps actives
  ORCID = 'Sélectionner un chercheur',
  ROR = 'Sélectionner une institution',
  DOI = 'Sélectionner une publication',
  EXIT = 'Quitter l’application',
}

/**
 * Ajouter l’action de télécharger toutes les publications du chercheur
 * - avec vérification des nouvelles formes graphiques du patronyme
 * - avec vérification des co-affiliations pour les affiliations connues
 * Ajouter l’action d’étendre le patronyme à une recherche par formes graphiques validées
 */

// yield* mark_display_name_reliable('Sélectionnez le patronyme correspondant à ce chercheur', {
//   orcid,
//   entity: 'author',
//   field: 'display_name',
// });

// yield* mark_alternative_strings_reliable('Sélectionnez les formes graphiques correspondantes à ce chercheur', {
//   orcid,
//   entity: 'author',
//   field: 'display_name_alternatives',
// });
// yield* mark_alternative_strings_reliable('Sélectionnez les affiliations correspondantes à ce chercheur', {
//   orcid,
//   entity: 'author',
//   field: 'affiliation',
// });

const actions: Action[] = [
  {
    name: 'Fiabiliser le patronyme de ce chercheur',
    visible: (state: IState) => isVisible(state, 'author', 'author', 'display_name'),
    action: mark_authors_display_name_reliable,
  },
  {
    name: 'Fiabiliser les formes imprimées du patronyme de ce chercheur',
    visible: (state: IState) => isVisible(state, 'author', 'author', 'display_name_alternatives'),
    action: mark_authors_alternative_strings_reliable,
  },
  {
    name: 'Fiabiliser le parcours de ce chercheur',
    visible: (state: IState) => isVisible(state, 'author', 'author', 'affiliation'),
    action: mark_affiliations_alternative_strings_reliable,
  },
  {
    name: "Étendre la recherche à d'autres formes graphiques du patronyme",
    visible: (state: IState) => isVisible(state, 'author', 'author', 'display_name'),
    action: mark_authors_display_name_reliable,
  },
  // {
  //   name: Tasks.INST_FIA,
  //   visible: (state: IState) =>
  //     isVisible(state, 'author', 'institution', 'display_name_alternatives'),
  // },
  // {
  //   name: Tasks.ROR,
  //   visible: (state: IState) => state.context.type === 'author',
  // },
  // {
  //   name: Tasks.DOI,
  //   visible: (state: IState) => state.context.type === 'author',
  // },
  {
    name: 'Sélectionner un chercheur',
    visible: (state: IState) => !!state,
    action: insert_new_ORCID,
  },
  {
    name: 'Quitter l’application',
    visible: (state: IState) => !!state,
    action: save_and_exit,
  },
];

export { actions, Tasks };
