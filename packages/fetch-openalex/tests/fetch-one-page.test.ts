import { build_headers } from '../src/fetch-one-page';

describe('build_headers', () => {
  it('devrait créer un objet Headers avec le User-Agent', () => {
    const userAgent = 'mon-test-agent';
    const headers = build_headers(userAgent);
    expect(headers).toBeInstanceOf(Headers);
    expect(headers.get('User-Agent')).toBe(userAgent);
  });
});
