# @univ-lehavre/validate-openalex

## 0.3.0

### Minor Changes

- 7329f01: - packages/validate-openalex/src/prompt/input.ts: Adds confirm prompt function for user confirmations
  - packages/validate-openalex/src/fetch/index.ts: Updates type annotations from AuthorsResult to WorksResult for work fetching
  - packages/validate-openalex/src/events/types.ts: Extends IField type to include 'openalexID'
  - packages/validate-openalex/src/events/getter.ts: Adds new functions for checking event statuses and display name alternatives
  - packages/validate-openalex/src/events/builder.ts: Adds buildReference function and exports buildEvent
  - packages/validate-openalex/src/actions/tester.ts: Simplifies hasAcceptedValues logic to use getOpenAlexIDs
  - packages/validate-openalex/src/actions/actors.ts: Implements comprehensive work validation workflow with checkWork function
  - packages/validate-openalex/src/actions/actions.ts: Updates action description for work validation

### Patch Changes

- Updated dependencies [8e89142]
  - @univ-lehavre/biblio-openalex-types@2.0.0
  - @univ-lehavre/biblio-fetch-openalex@0.2.1

## 0.2.0

### Minor Changes

- 6f9f937: Ajout de tests, de fonctions de tri de tableaux de string, modification des actions et refactor

### Patch Changes

- Updated dependencies [d0aab43]
  - @univ-lehavre/biblio-openalex-types@1.1.0

## 0.1.1

### Patch Changes

- 1e3d0c1: Le style du code a été amélioré

## 0.1.0

### Minor Changes

- 571a4fe: Restructuration du code

### Patch Changes

- Updated dependencies [df76955]
- Updated dependencies [571a4fe]
  - @univ-lehavre/biblio-fetch-openalex@0.2.0
  - @univ-lehavre/biblio-openalex-types@1.0.2

## 0.0.2

### Patch Changes

- 65c35c6: Ajout des fichiers de CHANGELOG et de LICENSE
- Updated dependencies [65c35c6]
  - @univ-lehavre/fetch-openalex@0.1.2
  - @univ-lehavre/openalex-types@1.0.1

## 0.0.1

### Patch Changes

- Création d’un package dédié aux types de résultats d’OpenAlex et ajout d’une dépendance pour les autres paquets
- Updated dependencies
  - @univ-lehavre/openalex-types@1.0.0
  - @univ-lehavre/fetch-openalex@0.1.1
