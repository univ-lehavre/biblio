import { DevTools } from '@effect/experimental';
import { NodeRuntime } from '@effect/platform-node';
import { Effect, Logger, LogLevel } from 'effect';
import { type FetchAPIMinimalConfig, fetchAPIResults } from '.';
import { type WorksResult } from '@univ-lehavre/biblio-openalex-types';
import { spinner } from '@clack/prompts';

const program = Effect.gen(function* () {
  const opts: FetchAPIMinimalConfig = {
    userAgent: 'MyApp/1.0 (demo)',
    rateLimit: { limit: 10, interval: '1 second' },
    apiURL: 'https://api.openalex.org',
    endpoint: 'works',
    fetchAPIOptions: { filter: 'type:article' },
    perPage: 11,
    maxPages: 3,
  };

  const spin = spinner();
  console.clear();
  spin.start('Fetching items from OpenAlex...');

  const results = yield* fetchAPIResults<WorksResult>(opts);

  spin.stop(`Fetched ${results.length} items from OpenAlex`);
});

const DevToolsLive = DevTools.layer();

program.pipe(
  Logger.withMinimumLogLevel(LogLevel.None),
  Effect.provide(DevToolsLive),
  NodeRuntime.runMain,
);
