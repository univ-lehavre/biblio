import { Effect, RateLimiter, Queue, Ref } from 'effect';
import { FetchError, fetchOnePage, type Query } from '@univ-lehavre/biblio-fetch-one-api-page';
import { Store, APIResponse, initialState, IState } from './store';

interface FetchAPIOptions {
  filter?: string;
  search?: string;
}

interface FetchAPIConfig<T> {
  userAgent: string;
  rateLimit: RateLimiter.RateLimiter.Options;
  apiURL: string;
  endpoint: string;
  fetchAPIOptions: FetchAPIOptions;
  perPage: number;
  store?: Store<T>;
  queue?: Queue.Queue<T>;
}

const fetchAPIQueue = <T>(opts: FetchAPIConfig<T>): Effect.Effect<Queue.Queue<T>, never, never> =>
  Effect.scoped(
    Effect.gen(function* () {
      const url: URL = new URL(`${opts.apiURL}/${opts.endpoint}`);
      const params: Query = { ...opts.fetchAPIOptions, per_page: opts.perPage };

      const ratelimiter: RateLimiter.RateLimiter = yield* RateLimiter.make(opts.rateLimit);
      const curriedFetch = (q: Query): Effect.Effect<APIResponse<T>, FetchError, never> =>
        ratelimiter(fetchOnePage<APIResponse<T>>(url, q, opts.userAgent));

      const queue: Queue.Queue<T> = opts.queue ?? (yield* Queue.unbounded<T>());
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

      yield* Effect.fork(worker);

      return queue;
    }),
  );

export {
  fetchAPIQueue,
  Store,
  initialState,
  type FetchAPIOptions,
  type FetchAPIConfig,
  type APIResponse,
  type IState,
};
