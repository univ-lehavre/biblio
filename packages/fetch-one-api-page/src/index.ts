import qs from 'qs';
import { Effect, Data } from 'effect';

type QueryValue = string | number | boolean | Array<string | number | boolean> | undefined;
type Query = Record<string, QueryValue>;

/**
 * Error thrown when the fetch function fails.
 */
class FetchError extends Data.TaggedError('FetchError') {
  constructor(message: string, opts?: { cause?: unknown }) {
    super();
    this.message = message;
    this.name = 'FetchError';
    if (opts?.cause) this.cause = opts.cause;
  }
}

/**
 * Build the full URL with query parameters.
 * @param base_url The base URL of the API endpoint
 * @param params Parameters to add to the URL
 * @returns The full URL with query parameters
 */
const buildURL = (baseUrl: URL, params: Query): URL => {
  const search_params: string = qs.stringify(params);
  const url_string: string = `${baseUrl.toString()}?${search_params}`;
  const url: URL = new URL(url_string);
  return url;
};

/**
 * Build the headers for the API request.
 * @param user_agent The name of the application making the request
 * @returns Headers with the User-Agent set
 */
const buildHeaders = (userAgent: string): Headers => {
  const headers: Headers = new Headers();
  headers.append('User-Agent', userAgent);
  return headers;
};

/**
 * Fetch JSON data from a URL.
 * @param url The URL to fetch
 * @param method The HTTP method to use
 * @param headers The headers to include in the request
 * @returns The JSON response from the server
 */
const fetchJSON = <T>(
  url: URL,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  headers: Headers,
): Effect.Effect<T, FetchError, never> =>
  Effect.tryPromise({
    try: async () => {
      const response: Response = await fetch(url, {
        method,
        headers,
      });
      const json = (await response.json()) as T;
      return json;
    },
    catch: (cause: unknown) => new FetchError('An unknown error occurred during fetch', { cause }),
  });

/**
 * Fetch one page of results from an API endpoint.
 * @param endpointURL The base URL of the API endpoint
 * @param params Parameters to add to the URL
 * @param userAgent The name of the application making the request
 * @throws {FetchError} If the fetch function fails
 * @returns An Effect that resolves to the JSON response or an error
 */
const fetchOnePage = <T>(endpointURL: URL, params: Query, userAgent: string) =>
  Effect.gen(function* () {
    yield* Effect.logDebug(
      `Starting fetchOnePage with parameters: ${JSON.stringify({ endpointURL, params, userAgent }, null, 2)}`,
    );
    const url: URL = buildURL(endpointURL, params);
    const headers: Headers = buildHeaders(userAgent);
    yield* Effect.logInfo(`Fetching URL: ${url.toString()}`);
    yield* Effect.logDebug(`Using headers: ${headers}`);
    const json = yield* fetchJSON<T>(url, 'GET', headers);
    yield* Effect.logDebug(`Received response: ${json}`);
    return json;
  });

export { fetchOnePage, fetchJSON, buildHeaders, buildURL, FetchError, type Query };
