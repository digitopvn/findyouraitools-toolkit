export const ExitCode = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_ARGUMENTS: 2,
  AUTH_FAILURE: 3,
  RATE_LIMITED: 4,
} as const;

export type ExitCodeType = (typeof ExitCode)[keyof typeof ExitCode];
