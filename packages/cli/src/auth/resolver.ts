import * as dotenv from 'dotenv';
import { ConfigStore } from './config-store';

export interface ResolveOptions {
  apiKey?: string;
}

export interface ResolvedAuth {
  apiKey?: string;
  source: 'flag' | 'env' | 'config' | 'none';
}

export function resolveCredentials(options: ResolveOptions = {}): ResolvedAuth {
  // 1. Explicit CLI flag
  if (options.apiKey) {
    return { apiKey: options.apiKey, source: 'flag' };
  }

  // 2. Load .env if present
  try {
    dotenv.config();
  } catch {
    // Ignore error loading .env
  }

  // 3. Environment variables
  const envKey = process.env.FYAI_API_KEY || process.env.FINDYOURAI_API_KEY;
  if (envKey) {
    return { apiKey: envKey, source: 'env' };
  }

  // 4. Global config ~/.fyai/config.json
  const store = new ConfigStore();
  const config = store.read();
  if (config.apiKey) {
    return { apiKey: config.apiKey, source: 'config' };
  }

  return { source: 'none' };
}
