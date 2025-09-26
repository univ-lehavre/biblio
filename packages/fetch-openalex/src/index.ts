import { getEnv } from './config';
import { Effect, RateLimiter } from 'effect';
import { fetchOnePage } from './fetch-one-page';
import { log, spinner, SpinnerResult } from '@clack/prompts';
import { FetchError, StatusError } from './errors';
import type { ConfigError } from 'effect/ConfigError';
import type { Env, FetchAPIOptions, Query } from './types';

interface APIResponse<T> {
  meta: {
    count: number;
    page: number;
    per_page: number;
  };
  results: T[];
}

class API<T> {
  private totalPages: number = Infinity;
  private count: number = 0;

  constructor(
    private readonly maxItems: number,
    private page: number,
    readonly logStart: () => void,
    readonly logCompletion: () => void,
    private readonly logProgress: (count: number) => void,
    private readonly logMaxItemsReached: () => void,
  ) {}

  AddNewResponse(response: APIResponse<T>): T[] {
    this.page += 1;
    this.count += response.results.length;
    this.logProgress(this.count);
    if (this.count >= this.maxItems) this.logMaxItemsReached();
    if (this.totalPages === Infinity)
      this.totalPages = Math.ceil(response.meta.count / response.meta.per_page);
    return response.results;
  }

  getTotalPages(): number {
    return this.totalPages;
  }
}

const fetchAllPages = <T>(
  ratelimiter: RateLimiter.RateLimiter,
  start_page: number,
  total_pages: number,
  params: Query,
  user_agent: string,
  base_url: URL,
  spin: SpinnerResult,
  count: number = 0,
): Effect.Effect<T[][], StatusError | FetchError, never> =>
  Effect.loop(start_page, {
    while: state => state <= total_pages,
    step: state => state + 1,
    body: state =>
      Effect.gen(function* () {
        params.page = state;
        const response = yield* ratelimiter(
          fetchOnePage<OpenalexResponse<T>>(base_url, params, user_agent),
        );
        count += response.results.length;
        if (count > 10000) {
          log.error(
            `Le nombre maximal de 10 000 items a été atteint. Veuillez affiner votre recherche.`,
          );
          process.exit(1);
        }
        total_pages =
          total_pages === Infinity
            ? Math.ceil(response.meta.count / response.meta.per_page)
            : total_pages;
        spin.message(
          `${count}/${response.meta.count} items téléchargés | Page ${state}/${total_pages}`,
        );
        const result = response.results;
        return result;
      }),
  });

const fetchAPI = <T>(
  base_url: URL,
  params: Query,
  total_pages: number = Infinity,
  start_page: number = 1,
) =>
  Effect.scoped(
    Effect.gen(function* () {
      const { user_agent, rate_limit }: Env = yield* getEnv();
      const ratelimiter: RateLimiter.RateLimiter = yield* RateLimiter.make(rate_limit);
      const raw = yield* fetchAllPages<T>(
        ratelimiter,
        start_page,
        total_pages,
        params,
        user_agent,
        base_url,
      );
      const results = raw.flat();
      const result = {
        meta: {
          count: results.length,
          page: 1,
          per_page: results.length,
        },
        results: results,
      };
      return result;
    }),
  );

/**
 * Fetch data from the API.
 * @param entity type of entity to fetch: 'authors', 'works', 'institutions', etc.
 * @param opts FetchAPIOptions
 * @param total_pages maximum number of pages to fetch
 * @param start_page page to start fetching from
 * @returns Effect.Effect<OpenalexResponse<T>, StatusError | FetchError | ConfigError, never>
 */
const fetchOpenAlexAPI = <T>(
  entity: 'authors' | 'works' | 'institutions',
  opts: FetchAPIOptions,
  total_pages: number = Infinity,
  start_page: number = 1,
) =>
  Effect.gen(function* () {
    const { per_page, api_url } = yield* getEnv();
    const url = new URL(`${api_url}/${entity}`);
    const params: Query = { ...opts, per_page };
    const response: T = yield* fetchAPI<T>(url, params, total_pages, start_page);
    return response;
  });

export { fetchOpenAlexAPI, StatusError, FetchError };
