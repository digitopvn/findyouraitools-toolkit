import { FindYourAiError } from './base';

export class NotFoundError extends FindYourAiError {
  constructor(message = 'Requested resource was not found.', details?: unknown) {
    super({
      message,
      status: 404,
      code: 'NOT_FOUND',
      details,
      remediation: 'Check that the resource ID or slug is correct and has not been deleted or unpublished.',
    });
  }
}
