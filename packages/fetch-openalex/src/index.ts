import { Effect, RateLimiter } from 'effect';
import { fetch_one_page } from './fetch-one-page';
import { getEnv } from './config';
import { ConfigError } from 'effect/ConfigError';
import { FetchError, StatusError } from './errors';
import { FetchOpenAlexAPIOptions, OpenalexResponse, Query } from './types';
import { log, spinner, SpinnerResult } from '@clack/prompts';

const exhaust = <T>(
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
          fetch_one_page<OpenalexResponse<T>>(base_url, params, user_agent),
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
): Effect.Effect<OpenalexResponse<T>, ConfigError | StatusError | FetchError, never> =>
  Effect.scoped(
    Effect.gen(function* () {
      const { user_agent, rate_limit } = yield* getEnv();
      const ratelimiter: RateLimiter.RateLimiter = yield* RateLimiter.make(rate_limit);
      const spin = spinner();
      spin.start('Fouille des données d’OpenAlex');
      const raw = yield* exhaust<T>(
        ratelimiter,
        start_page,
        total_pages,
        params,
        user_agent,
        base_url,
        spin,
      );
      const results = raw.flat();
      spin.stop(`${results.length} items téléchargés d’OpenAlex`);
      const result: OpenalexResponse<T> = {
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
 * Fetch data from the OpenAlex API.
 * @param entity 'authors' | 'works' | 'institutions'
 * @param opts FetchOpenAlexAPIOptions
 * @param total_pages
 * @param start_page
 * @returns Effect.Effect<OpenalexResponse<T>, StatusError | FetchError | ConfigError, never>
 */
const fetchOpenAlexAPI = <T>(
  entity: 'authors' | 'works' | 'institutions',
  opts: FetchOpenAlexAPIOptions,
  total_pages: number = Infinity,
  start_page: number = 1,
): Effect.Effect<OpenalexResponse<T>, StatusError | FetchError | ConfigError, never> =>
  Effect.gen(function* () {
    const { per_page, openalex_api_url } = yield* getEnv();
    const url = new URL(`${openalex_api_url}/${entity}`);
    const { filter, search } = opts;
    const params: Query = {
      filter,
      search,
      per_page,
    };
    const response: OpenalexResponse<T> = yield* fetchAPI<T>(url, params, total_pages, start_page);
    return response;
  });

export { fetchOpenAlexAPI, StatusError, FetchError };
