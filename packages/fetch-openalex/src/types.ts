import type { RateLimiter } from 'effect';

type QueryValue = string | number | boolean | Array<string | number | boolean> | undefined;

type Query = Record<string, QueryValue>;

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

export type { QueryValue, Query, Env, FetchAPIOptions };
