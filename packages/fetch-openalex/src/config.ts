import { Config, Effect, RateLimiter } from 'effect';

/**
 * Get the configuration from environment variables.
 * @returns An Effect that resolves to the environment configuration or an error
 */
const getEnv = () =>
  Effect.gen(function* () {
    const user_agent: string = yield* Config.string('USER_AGENT');
    const rate_limit_stringified: string = yield* Config.string('RATE_LIMIT');
    const api_url: string = yield* Config.string('API_URL');
    const per_page: number = yield* Config.number('RESULTS_PER_PAGE');
    const rate_limit: RateLimiter.RateLimiter.Options = JSON.parse(rate_limit_stringified);
    return { user_agent, rate_limit, per_page, api_url };
  });

export { getEnv };
