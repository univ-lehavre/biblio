import { DevTools } from '@effect/experimental';
import { NodeRuntime } from '@effect/platform-node';
import { Config, Effect, Logger, LogLevel, Queue, RateLimiter, Ref } from 'effect';
import { FetchAPIConfig, fetchAPIQueue, type IState, Store } from '.';
import { WorksResult } from '@univ-lehavre/biblio-openalex-types';
import { spinner } from '@clack/prompts';
import { type ConfigError } from 'effect/ConfigError';

interface EnvConfig {
  userAgent: string;
  rateLimit: RateLimiter.RateLimiter.Options;
  perPage: number;
  apiUrl: string;
}

const getEnv = (): Effect.Effect<EnvConfig, ConfigError, never> =>
  Effect.gen(function* () {
    const userAgent: string = yield* Config.string('USER_AGENT');
    const rateLimitStringified: string = yield* Config.string('RATE_LIMIT');
    const apiUrl: string = yield* Config.string('API_URL');
    const perPage: number = yield* Config.number('RESULTS_PER_PAGE');
    const rateLimit: RateLimiter.RateLimiter.Options = JSON.parse(rateLimitStringified);
    return { userAgent, rateLimit, perPage, apiUrl };
  });

const program = Effect.gen(function* () {
  const queue = yield* Queue.unbounded<WorksResult>();
  const initialState: IState = {
    page: 1,
    maxPages: 10,
    totalPages: Infinity,
    fetchedItems: 0,
  };
  const store = yield* Effect.andThen(Ref.make(initialState), s => new Store<WorksResult>(s));
  const env = yield* getEnv();
  const opts: FetchAPIConfig<WorksResult> = {
    userAgent: env.userAgent,
    rateLimit: env.rateLimit,
    apiURL: env.apiUrl,
    endpoint: 'works',
    fetchAPIOptions: { filter: 'type:article' },
    perPage: 10,
    queue,
    store,
  };

  const spin = spinner();
  console.clear();
  spin.start('Fetching items from OpenAlex...');

  const web = fetchAPIQueue<WorksResult>(opts);
  const supervisor = Effect.gen(function* () {
    while (yield* store.hasMorePages()) {
      yield* Effect.sleep('100 millis');
      const state = yield* store.current;
      spin.message(state.fetchedItems + ' items fetched...');
    }
  });
  yield* Effect.all([web, supervisor], { concurrency: 'unbounded', discard: true });

  const state = yield* store.current;
  spin.stop(`Fetched ${state.fetchedItems} items from OpenAlex`);
});

const DevToolsLive = DevTools.layer();

program.pipe(
  Logger.withMinimumLogLevel(LogLevel.None),
  Effect.provide(DevToolsLive),
  NodeRuntime.runMain,
);
