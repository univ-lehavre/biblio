import type { RateLimiter } from 'effect';

interface Env {
  user_agent: string;
  rate_limit: RateLimiter.RateLimiter.Options;
  per_page: number;
  api_url: string;
}

interface FetchAPIOptions {
  filter?: string;
  search?: string;
}

export type { Env, FetchAPIOptions };
