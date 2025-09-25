import { Effect } from 'effect';
import { FetchError, fetchOpenAlexAPI, StatusError } from '@univ-lehavre/biblio-fetch-openalex';
import type { AuthorsResult, FetchOpenAlexAPIOptions } from './types';
import type { ConfigError } from 'effect/ConfigError';
import { WorksResult } from '@univ-lehavre/biblio-openalex-types';

const searchAuthor = (names: string[]): FetchOpenAlexAPIOptions => ({ search: names.join('|') });

const filterByORCID = (orcid: string[]): FetchOpenAlexAPIOptions => ({
  filter: `orcid:${orcid.join('|')}`,
});

const filterAuthorshipByIDs = (ids: string[]): FetchOpenAlexAPIOptions => ({
  filter: `author.id:${ids.join('|')}`,
});

const fetchAuthor = (
  values: string[],
  callback: (values: string[]) => FetchOpenAlexAPIOptions,
): Effect.Effect<AuthorsResult[], StatusError | FetchError | ConfigError, never> =>
  Effect.gen(function* () {
    const opts = callback(values);
    const authors = yield* fetchOpenAlexAPI<AuthorsResult>('authors', opts);
    return authors.results;
  });

const fetchWork = (
  values: string[],
  callback: (values: string[]) => FetchOpenAlexAPIOptions,
): Effect.Effect<WorksResult[], StatusError | FetchError | ConfigError, never> =>
  Effect.gen(function* () {
    const opts = callback(values);
    const works = yield* fetchOpenAlexAPI<WorksResult>('works', opts);
    return works.results;
  });

const searchAuthorByName = (
  names: string[],
): Effect.Effect<AuthorsResult[], StatusError | FetchError | ConfigError, never> =>
  fetchAuthor(names, searchAuthor);

const searchAuthorByORCID = (
  orcid: string[],
): Effect.Effect<AuthorsResult[], StatusError | FetchError | ConfigError, never> =>
  fetchAuthor(orcid, filterByORCID);

const searchWorksByAuthorIDs = (
  ids: string[],
): Effect.Effect<WorksResult[], StatusError | FetchError | ConfigError, never> =>
  fetchWork(ids, filterAuthorshipByIDs);

export { searchAuthorByName, searchAuthorByORCID, searchWorksByAuthorIDs };
