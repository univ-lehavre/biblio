import { Effect, RateLimiter, Queue, Ref, Chunk } from 'effect';
import { FetchError, fetchOnePage, type Query } from '@univ-lehavre/biblio-fetch-one-api-page';
import { Store, type APIResponse, initialState, type IState } from './store';

interface FetchAPIOptions {
  filter?: string;
  search?: string;
}

interface FetchAPIMinimalConfig {
  userAgent: string;
  rateLimit: RateLimiter.RateLimiter.Options;
  apiURL: string;
  endpoint: string;
  fetchAPIOptions: FetchAPIOptions;
  perPage: number;
  maxPages?: number;
}

interface FetchAPIConfig<T> extends FetchAPIMinimalConfig {
  now?: boolean;
  store?: Store<T>;
  queue?: Queue.Queue<T>;
}

const fetchAPIQueue = <T>(
  opts: FetchAPIConfig<T>,
): Effect.Effect<
  {
    store: Store<T>;
    queue: Queue.Queue<T>;
    worker: Effect.Effect<void, FetchError, never>;
  },
  never,
  never
> =>
  Effect.scoped(
    Effect.gen(function* () {
      const url: URL = new URL(`${opts.apiURL}/${opts.endpoint}`);
      const params: Query = { ...opts.fetchAPIOptions, per_page: opts.perPage };

      const ratelimiter: RateLimiter.RateLimiter = yield* RateLimiter.make(opts.rateLimit);
      const curriedFetch = (q: Query): Effect.Effect<APIResponse<T>, FetchError, never> =>
        ratelimiter(fetchOnePage<APIResponse<T>>(url, q, opts.userAgent));

      const queue: Queue.Queue<T> = opts.queue ?? (yield* Queue.unbounded<T>());

      initialState.maxPages = opts.maxPages;
      const store: Store<T> =
        opts.store ?? (yield* Effect.andThen(Ref.make(initialState), s => new Store<T>(s)));

      const worker: Effect.Effect<void, FetchError, never> = Effect.gen(function* () {
        while (yield* store.hasMorePages()) {
          params.page = yield* store.page;
          const response: APIResponse<T> = yield* curriedFetch(params);
          yield* queue.offerAll(response.results);
          yield* store.addNewItems(response);
          yield* store.incPage();
        }
      });

      return { store, queue, worker };
    }),
  );

const fetchAPIResults = <T>(
  opts: FetchAPIMinimalConfig,
): Effect.Effect<readonly T[], FetchError, never> =>
  Effect.gen(function* () {
    const { queue, worker } = yield* fetchAPIQueue<T>({ ...opts });
    yield* Effect.all([worker], { concurrency: 'unbounded', discard: true });
    const results = yield* Queue.takeAll(queue);
    return Chunk.toReadonlyArray(results);
  });

export {
  fetchAPIQueue,
  fetchAPIResults,
  Store,
  initialState,
  type FetchAPIOptions,
  type FetchAPIMinimalConfig,
  type FetchAPIConfig,
  type APIResponse,
  type IState,
};
