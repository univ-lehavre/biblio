import { Effect, RateLimiter } from 'effect';
import { FetchError, fetchOnePage, type Query } from '@univ-lehavre/biblio-fetch-one-api-page';
import { Scope } from 'effect/Scope';

interface FetchAPIOptions {
  filter?: string;
  search?: string;
}

interface APIResponse<T> {
  meta: {
    count: number;
    page: number;
    per_page: number;
  };
  results: T[];
}

const curryFetch = <T>(
  endpointURL: URL,
  userAgent: string,
  rateLimit: RateLimiter.RateLimiter.Options,
): Effect.Effect<(q: Query) => Effect.Effect<APIResponse<T>, FetchError, never>, never, Scope> =>
  Effect.gen(function* () {
    const ratelimiter: RateLimiter.RateLimiter = yield* RateLimiter.make(rateLimit);
    return (q: Query) => ratelimiter(fetchOnePage<APIResponse<T>>(endpointURL, q, userAgent));
  });

interface FetchAllPagesOptions<T> {
  curriedFetch: (params: Query) => Effect.Effect<APIResponse<T>, FetchError, never>;
  params: Query;
  count: number;
  startPage: number;
  totalPages: number;
  logProgress?: (count: number, totalCounts: number, page: number, totalPages: number) => void;
}

const fetchAllPages = <T>(opts: FetchAllPagesOptions<T>) =>
  Effect.loop(opts.startPage, {
    while: state => state <= opts.totalPages,
    step: state => state + 1,
    body: state =>
      Effect.gen(function* () {
        opts.params.page = state;
        const response = yield* opts.curriedFetch(opts.params);
        opts.count += response.results.length;
        opts.totalPages =
          opts.totalPages === Infinity
            ? Math.ceil(response.meta.count / response.meta.per_page)
            : opts.totalPages;
        opts.logProgress?.(opts.count, response.meta.count, state, opts.totalPages);
        const result = response.results;
        return result;
      }),
  });

interface FetchAPIConfig {
  userAgent: string;
  rateLimit: RateLimiter.RateLimiter.Options;
  apiURL: string;
  endpoint: string;
  fetchAPIOptions: FetchAPIOptions;
  startPage?: number;
  perPage?: number;
  totalPages?: number;
  logStart?: () => void;
  logEnd?: (count: number) => void;
  logProgress?: (count: number, totalCounts: number, page: number, totalPages: number) => void;
}

const fetchAPI = <T>(opts: FetchAPIConfig) =>
  Effect.scoped(
    Effect.gen(function* () {
      const url = new URL(`${opts.apiURL}/${opts.endpoint}`);
      const params: Query = { ...opts.fetchAPIOptions, perPage: opts.perPage ?? 200 };
      const curriedFetch: (params: Query) => Effect.Effect<APIResponse<T>, FetchError, never> =
        yield* curryFetch<T>(url, opts.userAgent, opts.rateLimit);
      opts.logStart?.();
      const raw = yield* fetchAllPages<T>({
        curriedFetch,
        params,
        count: 0,
        startPage: opts.startPage ?? 1,
        totalPages: opts.totalPages ?? Infinity,
        logProgress: opts.logProgress,
      });
      const results = raw.flat();
      opts.logEnd?.(results.length);
      const result: APIResponse<T> = {
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

export { fetchAPI };
