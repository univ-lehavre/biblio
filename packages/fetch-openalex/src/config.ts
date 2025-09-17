import { Config, Effect } from 'effect';
import { ConfigError } from 'effect/ConfigError';
import { Env } from './types';

const getEnv = (): Effect.Effect<Env, ConfigError, never> =>
  Effect.gen(function* () {
    const user_agent = yield* Config.string('USER_AGENT');
    const rate_limit_stringified = yield* Config.string('RATE_LIMIT');
    const openalex_api_url = yield* Config.string('OPENALEX_API_URL');
    const per_page = yield* Config.number('PER_PAGE');
    const rate_limit = JSON.parse(rate_limit_stringified);
    return { user_agent, rate_limit, per_page, openalex_api_url };
  });

export { getEnv };
