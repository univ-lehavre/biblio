import { Effect } from 'effect';
import { buildHeaders, buildURL, fetchOnePage } from '.';
import { it, describe, expect } from '@effect/vitest';
import {} from '@effect/vitest/utils';

describe('buildHeaders', () => {
  it('should build headers with User-Agent', () => {
    const userAgent = 'MyApp/1.0';
    const headers = buildHeaders(userAgent);
    expect(headers.get('User-Agent')).toBe(userAgent);
  });
});

describe('buildURL', () => {
  it('should build a URL with query parameters', () => {
    const baseURL = new URL('https://api.example.com/data');
    const params = { search: 'test', limit: 10 };
    const url = buildURL(baseURL, params);
    expect(url.toString()).toBe('https://api.example.com/data?search=test&limit=10');
  });
});

describe('fetchOnePage', () => {
  it.effect('should fetch data successfully', () =>
    Effect.gen(function* () {
      const baseURL = new URL('https://jsonplaceholder.typicode.com/posts');
      const params = { userId: 1 };
      const userAgent = 'MyApp/1.0';

      const result = yield* fetchOnePage<unknown[]>(baseURL, params, userAgent);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    }),
  );

  it.effect('should handle fetch errors', () =>
    Effect.gen(function* () {
      const baseURL = new URL('https://invalid.url');
      const params = {};
      const userAgent = 'MyApp/1.0';

      const result = yield* Effect.either(fetchOnePage<unknown[]>(baseURL, params, userAgent));
      expect(result._tag).toBe('Left');
      if (result._tag === 'Left') {
        expect(result.left.name).toBe('FetchError');
        expect(result.left.message).toBe('An unknown error occurred during fetch');
      }
    }),
  );
});
