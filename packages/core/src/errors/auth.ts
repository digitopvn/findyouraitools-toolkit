import { FindYourAiError } from './base';

export class AuthenticationError extends FindYourAiError {
  constructor(message = 'Authentication failed. Invalid or missing credentials.', details?: unknown) {
    super({
      message,
      status: 401,
      code: 'UNAUTHORIZED',
      details,
      remediation:
        'Verify your API key via `fyai doctor` or pass `--api-key <key>`, or set environment variable FYAI_API_KEY. Header X-API-KEY or Authorization: Bearer required.',
    });
  }
}
