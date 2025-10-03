import { Effect, RateLimiter, Queue, Ref, Chunk } from 'effect';
import {
  FetchError,
  fetchOnePage,
  ResponseParseError,
  type Query,
} from '@univ-lehavre/biblio-fetch-one-api-page';
import { Store, type APIResponse, initialState, type IState } from './store';
import { type FetchOpenAlexAPIOptions } from '@univ-lehavre/biblio-openalex-types';

interface FetchAPIMinimalConfig {
  userAgent: string;
  rateLimit: RateLimiter.RateLimiter.Options;
  apiURL: string;
  endpoint: string;
  fetchAPIOptions: FetchOpenAlexAPIOptions;
  perPage: number;
  maxPages?: number;
}

interface FetchAPIConfig<T> extends FetchAPIMinimalConfig {
  now?: boolean;
  store?: Store<T>;
  queue?: Queue.Queue<T>;
}

const fetchAPIQueue = <T>(opts: FetchAPIConfig<T>) =>
  Effect.scoped(
    Effect.gen(function* () {
      const url: URL = new URL(`${opts.apiURL}/${opts.endpoint}`);
      const params: Query = { ...opts.fetchAPIOptions, per_page: opts.perPage };

      const ratelimiter: RateLimiter.RateLimiter = yield* RateLimiter.make(opts.rateLimit);
      const curriedFetch = (
        q: Query,
      ): Effect.Effect<APIResponse<T>, FetchError | ResponseParseError, never> =>
        ratelimiter(fetchOnePage<APIResponse<T>>(url, q, opts.userAgent));

      const queue: Queue.Queue<T> = opts.queue ?? (yield* Queue.unbounded<T>());

      initialState.maxPages = opts.maxPages;
      const store: Store<T> =
        opts.store ?? (yield* Effect.andThen(Ref.make(initialState), s => new Store<T>(s)));

      const worker: Effect.Effect<void, FetchError | ResponseParseError, never> = Effect.gen(
        function* () {
          while (yield* store.hasMorePages()) {
            params.page = yield* store.page;
            const response: APIResponse<T> = yield* curriedFetch(params);
            yield* queue.offerAll(response.results);
            yield* store.addNewItems(response);
            yield* store.incPage();
          }
        },
      );

      return { store, queue, worker };
    }),
  );

const fetchAPIResults = <T>(
  opts: FetchAPIMinimalConfig,
): Effect.Effect<readonly T[], FetchError | ResponseParseError, never> =>
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
  type FetchAPIMinimalConfig,
  type FetchAPIConfig,
  type APIResponse,
  type IState,
};
