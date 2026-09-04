export interface ClientOptions {
  baseUrl?: string;
  apiKey?: string;
  bearerToken?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  timeoutMs?: number;
  skipAuth?: boolean;
}

export interface HealthResponse {
  status: number;
  data?: unknown;
  messages?: string[];
}

export interface ApiResponse<T> {
  data: T;
  rawKey?: string;
}

export interface ApiListResponse<T> {
  data: T[];
  total?: number;
}
