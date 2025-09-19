import { Effect } from 'effect';
import { fetchOpenAlexAPI } from '@univ-lehavre/fetch-openalex';
import type { AuthorsResult, FetchOpenAlexAPIOptions } from './types';

const fetchAuthor = (values: string[], callback: (values: string[]) => FetchOpenAlexAPIOptions) =>
  Effect.gen(function* () {
    const authors = yield* fetchOpenAlexAPI<AuthorsResult>('authors', callback(values));
    return authors.results;
  });

const searchAuthor = (names: string[]) => ({ search: names.join('|') });

const filterByORCID = (orcid: string[]) => ({
  filter: `orcid:${orcid.join('|')}`,
});

const searchAuthorByName = (names: string[]) => fetchAuthor(names, searchAuthor);
const searchAuthorByORCID = (orcid: string[]) => fetchAuthor(orcid, filterByORCID);

export { searchAuthorByName, searchAuthorByORCID };
