import { describe, it, expect } from 'vitest';
import {
  FindYourAiError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  parseApiError,
} from '../src/errors';
import { GOLDEN_RESPONSES } from './fixtures/golden-responses';

describe('Error Hierarchy & Parser', () => {
  it('parses 401 response into AuthenticationError with remediation', () => {
    const err = parseApiError(401, GOLDEN_RESPONSES.errorUnauthorized);
    expect(err).toBeInstanceOf(AuthenticationError);
    expect(err.status).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.message).toBe('Invalid or missing API key');
    expect(err.remediation).toContain('X-API-KEY');
  });

  it('parses 404 response into NotFoundError', () => {
    const err = parseApiError(404, GOLDEN_RESPONSES.errorNotFound);
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.remediation).toContain('resource ID or slug');
  });

  it('parses 400 response with issues array into ValidationError', () => {
    const err = parseApiError(400, GOLDEN_RESPONSES.errorValidation);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.status).toBe(400);
    expect(err.issues).toHaveLength(1);
    expect(err.issues[0]?.message).toBe('Field name must be between 1 and 100 characters');
  });

  it('parses 429 response into RateLimitError', () => {
    const err = parseApiError(429, { message: 'Too many requests', code: 'RATE_LIMIT' });
    expect(err).toBeInstanceOf(RateLimitError);
    expect(err.status).toBe(429);
  });

  it('parses 500 response into ServerError', () => {
    const err = parseApiError(500, { message: 'Database failure', code: 'DB_ERROR' });
    expect(err).toBeInstanceOf(ServerError);
    expect(err.status).toBe(500);
  });

  it('handles non-json / empty error bodies gracefully', () => {
    const err = parseApiError(502, null);
    expect(err).toBeInstanceOf(ServerError);
    expect(err.status).toBe(502);
    expect(err.code).toBe('SERVER_ERROR');
  });
});
