import { Data } from 'effect';

interface ErrorOptions {
  cause?: unknown;
}

/**
 * Error thrown when the fetch function fails.
 */
class FetchError extends Data.TaggedError('FetchError') {
  constructor(message: string, opts?: ErrorOptions) {
    super();
    this.message = message;
    this.name = 'FetchError';
    if (opts?.cause) this.cause = opts.cause;
  }
}

/**
 * Error thrown when the response status is not OK.
 */
class StatusError extends Data.TaggedError('StatusError') {
  constructor(message: string, opts?: ErrorOptions) {
    super();
    this.message = message;
    this.name = 'StatusError';
    if (opts?.cause) this.cause = opts.cause;
  }
}

export { FetchError, StatusError };
