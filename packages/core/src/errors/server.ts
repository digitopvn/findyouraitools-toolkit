import { FindYourAiError } from './base';

export class ServerError extends FindYourAiError {
  constructor(message = 'An internal server error occurred.', status = 500, details?: unknown) {
    super({
      message,
      status,
      code: 'SERVER_ERROR',
      details,
      remediation: 'The FindYourAI server encountered an error. Please retry shortly or check service status.',
    });
  }
}
