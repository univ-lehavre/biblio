import { Effect } from 'effect';
import { fetchOpenAlexAPI } from '@univ-lehavre/fetch-openalex';
import type { AuthorsResult } from './types';

const searchAuthorByName = (names: string[]) =>
  Effect.gen(function* () {
    const authors = yield* fetchOpenAlexAPI<AuthorsResult>('authors', {
      filter: `search:${names.join('|')}`,
    });
    return authors.results;
  });

const searchAuthorByORCID = (orcid: string[]) =>
  Effect.gen(function* () {
    const authors = yield* fetchOpenAlexAPI<AuthorsResult>('authors', {
      filter: `orcid:${orcid}`,
    });
    return authors.results;
  });

export { searchAuthorByName, searchAuthorByORCID };
