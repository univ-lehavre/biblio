import { Effect, RateLimiter, Queue, Ref } from 'effect';
import { FetchError, fetchOnePage, type Query } from '@univ-lehavre/biblio-fetch-one-api-page';
import { Store, APIResponse, initialState } from './store';

interface FetchAPIOptions {
  filter?: string;
  search?: string;
}

interface FetchAPIConfig {
  userAgent: string;
  rateLimit: RateLimiter.RateLimiter.Options;
  apiURL: string;
  endpoint: string;
  fetchAPIOptions: FetchAPIOptions;
  perPage: number;
}

const fetchAPIQueue = <T>(opts: FetchAPIConfig): Effect.Effect<Queue.Queue<T>, never, never> =>
  Effect.scoped(
    Effect.gen(function* () {
      const url: URL = new URL(`${opts.apiURL}/${opts.endpoint}`);
      const params: Query = { ...opts.fetchAPIOptions, perPage: opts.perPage };

      const ratelimiter: RateLimiter.RateLimiter = yield* RateLimiter.make(opts.rateLimit);
      const curriedFetch = (q: Query): Effect.Effect<APIResponse<T>, FetchError, never> =>
        ratelimiter(fetchOnePage<APIResponse<T>>(url, q, opts.userAgent));

      const queue: Queue.Queue<T> = yield* Queue.unbounded<T>();
      const store: Store<T> = yield* Effect.andThen(Ref.make(initialState), s => new Store<T>(s));

      const worker: Effect.Effect<void, FetchError, never> = Effect.gen(function* () {
        while (yield* store.hasMorePages()) {
          yield* store.incPage();
          params.page = yield* store.page;
          const response: APIResponse<T> = yield* curriedFetch(params);
          queue.offerAll(response.results);
          yield* store.addNewItems(response);
        }
      });

      yield* Effect.fork(worker);

      return queue;
    }),
  );

export { fetchAPIQueue, Store, initialState };
