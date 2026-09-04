import { FindYourAiClient } from '@findyourai/toolkit-core';
import { resolveCredentials } from '../auth/resolver';

export interface CommandContextOptions {
  apiKey?: string;
  json?: boolean;
}

export function createClient(options: CommandContextOptions = {}): FindYourAiClient {
  const auth = resolveCredentials({ apiKey: options.apiKey });
  return new FindYourAiClient({
    apiKey: auth.apiKey,
  });
}
