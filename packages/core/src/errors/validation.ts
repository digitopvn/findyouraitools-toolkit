import { FindYourAiError, ErrorIssue } from './base';

export class ValidationError extends FindYourAiError {
  readonly issues: ErrorIssue[];

  constructor(message = 'Request validation failed.', issues: ErrorIssue[] = [], details?: unknown) {
    super({
      message,
      status: 400,
      code: 'VALIDATION_ERROR',
      details,
      remediation:
        issues.length > 0
          ? `Correct input fields: ${issues.map((i) => i.message).join('; ')}.`
          : 'Check that required fields match the expected schema.',
    });
    this.issues = issues;
  }
}
