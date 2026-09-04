import { FindYourAiError } from './base';

export class RateLimitError extends FindYourAiError {
  readonly retryAfterMs?: number;

  constructor(message = 'Rate limit exceeded.', retryAfterMs?: number, details?: unknown) {
    super({
      message,
      status: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      details,
      remediation: retryAfterMs
        ? `Rate limit exceeded. Please wait ${Math.ceil(retryAfterMs / 1000)}s before retrying.`
        : 'Rate limit exceeded. Please back off request frequency or check your account tier and balance.',
    });
    this.retryAfterMs = retryAfterMs;
  }
}
