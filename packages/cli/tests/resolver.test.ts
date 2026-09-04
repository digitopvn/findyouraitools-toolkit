import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveCredentials } from '../src/auth/resolver';
import { maskKey } from '../src/ui/sanitize';

describe('CLI Auth Resolver & Sanitizer', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.FYAI_API_KEY;
    delete process.env.FINDYOURAI_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('prioritizes --api-key flag over environment variables', () => {
    process.env.FYAI_API_KEY = 'env-api-key';
    const creds = resolveCredentials({ apiKey: 'flag-api-key' });
    expect(creds.apiKey).toBe('flag-api-key');
    expect(creds.source).toBe('flag');
  });

  it('resolves FYAI_API_KEY from environment if no flag provided', () => {
    process.env.FYAI_API_KEY = 'env-api-key';
    const creds = resolveCredentials({});
    expect(creds.apiKey).toBe('env-api-key');
    expect(creds.source).toBe('env');
  });

  it('resolves FINDYOURAI_API_KEY fallback from environment', () => {
    process.env.FINDYOURAI_API_KEY = 'alt-env-api-key';
    const creds = resolveCredentials({});
    expect(creds.apiKey).toBe('alt-env-api-key');
    expect(creds.source).toBe('env');
  });

  it('maskKey formats prefix and last4 cleanly without fixed length assumptions', () => {
    expect(maskKey('fyai_pk', '9a8b')).toBe('fyai_pk...9a8b');
    expect(maskKey(null, '9a8b')).toBe('key...9a8b');
    expect(maskKey(undefined, null)).toBe('key...****');
  });
});
