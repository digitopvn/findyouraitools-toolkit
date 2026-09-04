export interface ErrorIssue {
  message: string;
  field?: string;
  code?: string;
}

export class FindYourAiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly remediation: string;

  constructor(options: {
    message: string;
    status: number;
    code?: string;
    details?: unknown;
    remediation?: string;
  }) {
    super(options.message);
    this.name = this.constructor.name;
    this.status = options.status;
    this.code = options.code || 'UNKNOWN_ERROR';
    this.details = options.details;
    this.remediation =
      options.remediation || 'Please verify the request parameters or check https://findyourai.tools/api-docs.';

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
