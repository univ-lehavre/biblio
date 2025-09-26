import qs from 'qs';
import { Effect } from 'effect';
import { FetchError, StatusError } from './errors';
import type { Query } from './types';

/**
 * Build the full URL with query parameters.
 * @param base_url The base URL of the API endpoint
 * @param params Parameters to add to the URL
 * @returns The full URL with query parameters
 */
const buildURL = (base_url: URL, params: Query): URL => {
  const search_params: string = qs.stringify(params);
  const url_string: string = `${base_url.toString()}?${search_params}`;
  const url: URL = new URL(url_string);
  return url;
};

/**
 * Build the headers for the API request.
 * @param user_agent The name of the application making the request
 * @returns Headers with the User-Agent set
 */
const buildHeaders = (user_agent: string): Headers => {
  const headers: Headers = new Headers();
  headers.append('User-Agent', user_agent);
  return headers;
};

/**
 * Fetch one page of results from an API endpoint.
 * @param base_url The base URL of the API endpoint
 * @param params Parameters to add to the URL
 * @param user_agent The name of the application making the request
 * @returns An Effect that resolves to the JSON response or an error
 * @throws {FetchError} If the fetch function fails
 * @throws {StatusError} If the response status is not OK
 */
const fetchOnePage = <T>(
  base_url: URL,
  params: Query,
  user_agent: string,
): Effect.Effect<T, StatusError | FetchError, never> =>
  Effect.tryPromise({
    try: async () => {
      const url: URL = buildURL(base_url, params);
      const headers: Headers = buildHeaders(user_agent);
      const res: Response = await fetch(url, {
        method: 'GET',
        headers,
      });
      if (!res.ok)
        throw new StatusError(`The URL ${url.toString()} returned an error`, {
          cause: `HTTP ${res.status}: ${res.statusText}`,
        });
      const json = (await res.json()) as T;
      return json;
    },
    catch: (cause: unknown) => new FetchError(`The fetch function returned an error`, { cause }),
  });

export { fetchOnePage, buildHeaders, buildURL };
