import { Effect } from 'effect';
import { FetchAPIMinimalConfig, fetchAPIResults } from '@univ-lehavre/biblio-fetch-openalex';
import {
  type AuthorsResult,
  type FetchOpenAlexAPIOptions,
  type WorksResult,
} from '@univ-lehavre/biblio-openalex-types';
import { getEnv, type EnvConfig } from '../config';
import { type ConfigError } from 'effect/ConfigError';

const searchAuthor = (names: string[]): FetchOpenAlexAPIOptions => ({ search: names.join('|') });

const filterByORCID = (orcid: string[]): FetchOpenAlexAPIOptions => ({
  filter: `orcid:${orcid.join('|')}`,
});

const filterAuthorshipByIDs = (ids: string[]): FetchOpenAlexAPIOptions => ({
  filter: `author.id:${ids.join('|')}`,
});

const buildFetchOptions = (
  endpoint: string,
  fetchAPIOptions: FetchOpenAlexAPIOptions,
): Effect.Effect<FetchAPIMinimalConfig, ConfigError, never> =>
  Effect.gen(function* () {
    const { userAgent, rateLimit, perPage, apiURL }: EnvConfig = yield* getEnv();
    const fetchParams: FetchAPIMinimalConfig = {
      userAgent,
      rateLimit,
      apiURL,
      endpoint,
      fetchAPIOptions,
      perPage,
    };
    return fetchParams;
  });

const fetchAuthor = (values: string[], callback: (values: string[]) => FetchOpenAlexAPIOptions) =>
  Effect.gen(function* () {
    const params: FetchOpenAlexAPIOptions = callback(values);
    const opts: FetchAPIMinimalConfig = yield* buildFetchOptions('authors', params);
    const authors = yield* fetchAPIResults<AuthorsResult>(opts);
    return authors;
  });

const fetchWork = (values: string[], callback: (values: string[]) => FetchOpenAlexAPIOptions) =>
  Effect.gen(function* () {
    const params: FetchOpenAlexAPIOptions = callback(values);
    const opts: FetchAPIMinimalConfig = yield* buildFetchOptions('works', params);
    const works = yield* fetchAPIResults<WorksResult>(opts);
    return works;
  });

const searchAuthorByName = (names: string[]) => fetchAuthor(names, searchAuthor);

const searchAuthorByORCID = (orcid: string[]) => fetchAuthor(orcid, filterByORCID);

const searchWorksByAuthorIDs = (ids: string[]) => fetchWork(ids, filterAuthorshipByIDs);

export { searchAuthorByName, searchAuthorByORCID, searchWorksByAuthorIDs };
