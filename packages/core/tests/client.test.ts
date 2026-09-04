import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FindYourAiClient, AuthenticationError, RateLimitError, ServerError } from '../src/index';
import { GOLDEN_RESPONSES } from './fixtures/golden-responses';

describe('FindYourAiClient Core', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('injects X-API-KEY header when apiKey is configured', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => GOLDEN_RESPONSES.profile,
    });

    const client = new FindYourAiClient({
      apiKey: 'test-api-key-12345',
      fetch: mockFetch,
    });

    const profile = await client.user.getProfile();
    expect(profile).toEqual(GOLDEN_RESPONSES.profile.data);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe('https://findyourai.tools/api/v1/profile');
    expect(options.headers.get('X-API-KEY')).toBe('test-api-key-12345');
    expect(options.headers.get('Accept')).toBe('application/json');
  });

  it('injects Authorization Bearer header when bearerToken is configured', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => GOLDEN_RESPONSES.profile,
    });

    const client = new FindYourAiClient({
      bearerToken: 'test-bearer-token-abc',
      fetch: mockFetch,
    });

    await client.user.getProfile();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.get('Authorization')).toBe('Bearer test-bearer-token-abc');
  });

  it('retries on HTTP 429 and 503 up to maxRetries times', async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        return {
          ok: false,
          status: 429,
          headers: new Headers({ 'content-type': 'application/json', 'retry-after': '0.01' }),
          json: async () => ({ message: 'Rate limited', code: 'TOO_MANY_REQUESTS' }),
        };
      }
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => GOLDEN_RESPONSES.health,
      };
    });

    const client = new FindYourAiClient({
      apiKey: 'test-key',
      fetch: mockFetch,
      maxRetries: 3,
      retryDelayMs: 10,
    });

    const health = await client.getHealth();
    expect(health).toEqual({ status: 'ok' });
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('throws RateLimitError when retries are exhausted on 429', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Rate limited', code: 'TOO_MANY_REQUESTS' }),
    });

    const client = new FindYourAiClient({
      apiKey: 'test-key',
      fetch: mockFetch,
      maxRetries: 1,
      retryDelayMs: 5,
    });

    await expect(client.getHealth()).rejects.toThrow(RateLimitError);
  });

  it('throws ServerError on HTTP 500 backend failure', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Internal server error', code: 'INTERNAL_ERROR' }),
    });

    const client = new FindYourAiClient({
      apiKey: 'test-key',
      fetch: mockFetch,
      maxRetries: 0,
    });

    await expect(client.getHealth()).rejects.toThrow(ServerError);
  });

  it('retries on network fetch errors and throws NETWORK_ERROR if failed', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('DNS resolution failed'));
    const client = new FindYourAiClient({
      apiKey: 'test-key',
      fetch: mockFetch,
      maxRetries: 1,
      retryDelayMs: 5,
    });

    await expect(client.getHealth()).rejects.toThrow('DNS resolution failed');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('handles non-error thrown values by wrapping in NETWORK_ERROR', async () => {
    const mockFetch = vi.fn().mockRejectedValue('string-exception');
    const client = new FindYourAiClient({
      apiKey: 'test-key',
      fetch: mockFetch,
      maxRetries: 0,
    });

    await expect(client.getHealth()).rejects.toThrow('Network request failed');
  });
});
