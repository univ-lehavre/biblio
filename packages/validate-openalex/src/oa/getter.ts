import {
  AuthorshipInstitution,
  OpenAlexID,
  WorksResult,
} from '@univ-lehavre/biblio-openalex-types';
import { Either } from 'effect';

export const getAffiliationLabel = (
  affiliation: WorksResult,
  id: OpenAlexID,
): Either.Either<string, never> | Either.Either<never, Error> => {
  const affiliationFound: AuthorshipInstitution | undefined = affiliation.authorships
    .map(a => a.institutions)
    .flat()
    .find(aff => aff.id === id);
  return affiliationFound
    ? Either.right(affiliationFound.display_name)
    : Either.left(new Error('Affiliation not found'));
};
