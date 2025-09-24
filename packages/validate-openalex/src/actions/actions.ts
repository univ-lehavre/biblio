import { saveStoresAndExit } from '../store';
import {
  hasPendings,
  insert_new_ORCID,
  mark_alternative_strings_reliable,
  isContext,
  extendsEventsWithAlternativeStrings,
  extendsToWorks,
  notHasPendings,
  hasAuthorAlternativeStrings,
  hasAcceptedValues,
} from '.';
import type { Action } from './types';

/**
 * TODO  
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
  */

const actions: Action[] = [
  {
    name: 'Fiabiliser les formes imprimées du patronyme de ce chercheur',
    visible: [() => isContext('author'), () => hasPendings('author', 'display_name_alternatives')],
    action: () =>
      mark_alternative_strings_reliable(
        'Sélectionnez les formes imprimées correspondantes à ce chercheur',
        {
          entity: 'author',
          field: 'display_name_alternatives',
        },
      ),
  },
  {
    name: 'Fiabiliser le parcours de ce chercheur',
    visible: [() => isContext('author'), () => hasPendings('author', 'affiliation')],
    action: () =>
      mark_alternative_strings_reliable(
        'Sélectionnez les affiliations correspondantes au chercheur',
        {
          entity: 'author',
          field: 'affiliation',
        },
      ),
  },
  {
    name: 'Étendre la recherche à une forme imprimée de ce chercheur',
    visible: [
      () => isContext('author'),
      () => notHasPendings('author', 'display_name_alternatives'),
      () => notHasPendings('author', 'affiliation'),
      () => hasAuthorAlternativeStrings(),
    ],
    action: () => extendsEventsWithAlternativeStrings(),
  },
  {
    name: 'Télécharger les travaux de ce chercheur',
    visible: [() => hasAcceptedValues()],
    action: () => extendsToWorks(),
  },
  {
    name: 'Ajouter un chercheur avec son ORCID',
    action: () => insert_new_ORCID(),
  },
  {
    name: 'Quitter l’application',
    action: () => saveStoresAndExit(),
  },
];

export { actions };
