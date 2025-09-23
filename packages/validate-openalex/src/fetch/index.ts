import { Effect } from 'effect';
import { fetchOpenAlexAPI } from '@univ-lehavre/biblio-fetch-openalex';
import type { AuthorsResult, FetchOpenAlexAPIOptions } from './types';

const searchAuthor = (names: string[]) => ({ search: names.join('|') });

const filterByORCID = (orcid: string[]) => ({
  filter: `orcid:${orcid.join('|')}`,
});

const filterAuthorshipByIDs = (ids: string[]) => ({
  filter: `author.id:${ids.join('|')}`,
});

const fetchAuthor = (values: string[], callback: (values: string[]) => FetchOpenAlexAPIOptions) =>
  Effect.gen(function* () {
    const authors = yield* fetchOpenAlexAPI<AuthorsResult>('authors', callback(values));
    return authors.results;
  });
const fetchWork = (values: string[], callback: (values: string[]) => FetchOpenAlexAPIOptions) =>
  Effect.gen(function* () {
    const works = yield* fetchOpenAlexAPI<AuthorsResult>('works', callback(values));
    return works.results;
  });

const searchAuthorByName = (names: string[]) => fetchAuthor(names, searchAuthor);
const searchAuthorByORCID = (orcid: string[]) => fetchAuthor(orcid, filterByORCID);
const searchWorksByAuthorIDs = (ids: string[]) => fetchWork(ids, filterAuthorshipByIDs);

export { searchAuthorByName, searchAuthorByORCID, searchWorksByAuthorIDs };
