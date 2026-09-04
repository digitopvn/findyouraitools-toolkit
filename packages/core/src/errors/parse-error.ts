import { FindYourAiError } from './base';
import { AuthenticationError } from './auth';
import { NotFoundError } from './not-found';
import { RateLimitError } from './rate-limit';
import { ValidationError } from './validation';
import { ServerError } from './server';

export function parseApiError(status: number, body: unknown): FindYourAiError {
  const payload = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const message = typeof payload['message'] === 'string' ? payload['message'] : undefined;
  const code = typeof payload['code'] === 'string' ? payload['code'] : undefined;
  const rawIssues = Array.isArray(payload['issues']) ? payload['issues'] : [];
  const issues = rawIssues.map((item) => ({
    message: typeof item?.message === 'string' ? item.message : 'Invalid value',
    field: typeof item?.field === 'string' ? item.field : undefined,
    code: typeof item?.code === 'string' ? item.code : undefined,
  }));

  if (status === 401 || status === 403) {
    return new AuthenticationError(message, payload);
  }
  if (status === 404) {
    return new NotFoundError(message, payload);
  }
  if (status === 429) {
    return new RateLimitError(message, undefined, payload);
  }
  if (status === 400 || status === 422) {
    return new ValidationError(message, issues, payload);
  }
  if (status >= 500) {
    return new ServerError(message, status, payload);
  }

  return new FindYourAiError({
    message: message || `HTTP request failed with status ${status}`,
    status,
    code: code || 'HTTP_ERROR',
    details: payload,
  });
}
