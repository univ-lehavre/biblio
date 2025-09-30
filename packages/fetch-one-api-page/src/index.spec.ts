import { Effect } from 'effect';
import { buildHeaders, buildURL, fetchOnePage, fetchJSON } from '.';
import { it, describe, expect, afterEach } from '@effect/vitest';

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

describe('fetchJSON', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it.effect('should parse JSON response successfully', () =>
    Effect.gen(function* () {
      const mockData = { ok: true, items: [1, 2, 3] };
      globalThis.fetch = (async () =>
        Promise.resolve({
          json: async () => mockData,
        } as unknown as Response)) as typeof fetch;

      const url = new URL('https://api.example.com/test');
      const headers = new Headers();

      const result = yield* fetchJSON<typeof mockData>(url, 'GET', headers);
      expect(result).toEqual(mockData);
    }),
  );

  it.effect('should return FetchError when fetch rejects', () =>
    Effect.gen(function* () {
      globalThis.fetch = (async () => Promise.reject(new Error('network fail'))) as typeof fetch;

      const url = new URL('https://api.example.com/test');
      const headers = new Headers();

      const either = yield* Effect.either(fetchJSON<unknown>(url, 'GET', headers));
      expect(either._tag).toBe('Left');
      if (either._tag === 'Left') {
        expect(either.left.name).toBe('FetchError');
        expect(either.left.message).toBe('An unknown error occurred during fetch');
        const cause = (either.left as unknown as { cause?: unknown }).cause;
        expect(cause).toBeInstanceOf(Error);
        expect((cause as Error).message).toBe('network fail');
      }
    }),
  );
});

describe('fetchOnePage', () => {
  it.effect('should fetch data successfully using jsonplaceholder', () =>
    Effect.gen(function* () {
      const baseURL = new URL('https://jsonplaceholder.typicode.com/posts');
      const params = { userId: 1 };
      const userAgent = 'MyApp/1.0';

      const result = yield* fetchOnePage<unknown[]>(baseURL, params, userAgent);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    }),
  );

  it.effect('should fetch one page from OpenAlex', () =>
    Effect.gen(function* () {
      const baseURL = new URL('https://api.openalex.org/works');
      const params = { page: 1, 'per-page': 5 } as const;
      const userAgent = 'MyApp/1.0 (integration-test)';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = yield* fetchOnePage<any>(baseURL, params, userAgent);

      // OpenAlex returns an object with a `results` array (or similar). Be permissive:
      expect(result).toBeDefined();
      expect(result['meta']).toBeDefined();
      expect(result['meta']['count']).toBeDefined();
      expect(result['meta']['count']).toBeGreaterThan(1000000);
      expect(result['results']).toBeDefined();
      expect(result['results'].length).toBeDefined();
      expect(result['results'].length).toBeGreaterThan(0);
      expect(result['results'].length).toStrictEqual(5);
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
