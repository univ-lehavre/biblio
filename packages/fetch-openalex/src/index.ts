import { Scope } from 'effect/Scope';
import { Effect, RateLimiter, Queue } from 'effect';
import { FetchError, fetchOnePage, type Query } from '@univ-lehavre/biblio-fetch-one-api-page';

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

interface FetchAPIConfig<T> {
  queue: Queue.Queue<T>;
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

const fetchAPIQueue = <T>(opts: FetchAPIConfig<T>) =>
  Effect.scoped(
    Effect.gen(function* () {
      const url = new URL(`${opts.apiURL}/${opts.endpoint}`);
      const params: Query = { ...opts.fetchAPIOptions, perPage: opts.perPage ?? 200 };
      const curriedFetch: (params: Query) => Effect.Effect<APIResponse<T>, FetchError, never> =
        yield* curryFetch<T>(url, opts.userAgent, opts.rateLimit);

      const worker = Effect.gen(function* () {
        opts.logStart?.();
        let count = 0;
        let totalPages = opts.totalPages ?? Infinity;
        for (let page = opts.startPage ?? 1; page <= totalPages; page++) {
          params.page = page;
          const response = yield* curriedFetch(params);
          opts.queue.offerAll(response.results);
          count += response.results.length;
          totalPages =
            totalPages === Infinity
              ? Math.ceil(response.meta.count / response.meta.per_page)
              : totalPages;
          // offer each item to the queue
          opts.logProgress?.(count, response.meta.count, page, totalPages);
        }
        opts.logEnd?.(count);
        // signal completion
      });

      // run worker in background
      yield* Effect.fork(worker);
    }),
  );

export { fetchAPIQueue };
