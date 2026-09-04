import { ClientOptions, RequestOptions, HealthResponse } from './types/common';
import { parseApiError } from './errors/parse-error';
import { FindYourAiError } from './errors/base';
import { buildAuthHeaders } from './auth/index';
import {
  KeyService,
  McpService,
  ProductService,
  BlogService,
  UserService,
  AiService,
  AdminService,
} from './services/index';

export class FindYourAiClient {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly bearerToken?: string;
  private readonly customFetch: typeof fetch;
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly retryDelayMs: number;

  readonly keys: KeyService;
  readonly mcp: McpService;
  readonly product: ProductService;
  readonly blog: BlogService;
  readonly user: UserService;
  readonly ai: AiService;
  readonly admin: AdminService;

  constructor(options: ClientOptions = {}) {
    this.baseUrl = (options.baseUrl || 'https://findyourai.tools/api/v1').replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.bearerToken = options.bearerToken;
    this.customFetch = options.fetch || globalThis.fetch;
    this.timeoutMs = options.timeoutMs ?? 30000;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 500;

    this.keys = new KeyService(this);
    this.mcp = new McpService(this);
    this.product = new ProductService(this);
    this.blog = new BlogService(this);
    this.user = new UserService(this);
    this.ai = new AiService(this);
    this.admin = new AdminService(this);
  }

  async getHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/healthz', { skipAuth: true });
  }
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const method = options.method || 'GET';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    let url = `${this.baseUrl}${cleanPath}`;

    if (options.query) {
      const searchParams = new URLSearchParams();
      for (const [k, v] of Object.entries(options.query)) {
        if (v !== undefined && v !== null) {
          searchParams.append(k, String(v));
        }
      }
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    };

    if (!options.skipAuth) {
      const authHeaders = buildAuthHeaders({
        apiKey: this.apiKey,
        bearerToken: this.bearerToken,
      });
      Object.assign(headers, authHeaders);
    }

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const requestBody = options.body !== undefined ? JSON.stringify(options.body) : undefined;
    const timeoutMs = options.timeoutMs ?? this.timeoutMs;

    let attempt = 0;
    while (attempt <= this.maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await this.customFetch(url, {
          method,
          headers: new Headers(headers),
          body: requestBody,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const status = response.status;
          const shouldRetry = (status === 429 || status >= 500) && attempt <= this.maxRetries;

          if (shouldRetry) {
            let delay = this.retryDelayMs * Math.pow(2, attempt - 1);
            const retryAfter = response.headers.get('retry-after');
            if (retryAfter) {
              const seconds = parseFloat(retryAfter);
              if (!isNaN(seconds)) delay = seconds * 1000;
            }
            // Add jitter
            delay += Math.random() * 100;
            const { promise, resolve } = Promise.withResolvers<void>();
            setTimeout(resolve, delay);
            await promise;
            continue;
          }

          let errorBody: unknown;
          try {
            errorBody = await response.json();
          } catch {
            errorBody = null;
          }
          throw parseApiError(status, errorBody);
        }

        const data = (await response.json()) as T;
        return data;
      } catch (err: unknown) {
        clearTimeout(timeoutId);

        if (err instanceof FindYourAiError) {
          throw err;
        }

        if (err instanceof Error && err.name === 'AbortError') {
          throw new FindYourAiError({
            message: `Request timed out after ${timeoutMs}ms`,
            status: 408,
            code: 'TIMEOUT',
            remediation: 'The request took longer than the configured timeout. Increase timeoutMs or check network.',
          });
        }

        const isNetworkError = err instanceof Error;
        const shouldRetry = isNetworkError && attempt <= this.maxRetries;
        if (shouldRetry) {
          const delay = this.retryDelayMs * Math.pow(2, attempt - 1);
          const { promise, resolve } = Promise.withResolvers<void>();
          setTimeout(resolve, delay);
          await promise;
          continue;
        }

        throw new FindYourAiError({
          message: err instanceof Error ? err.message : 'Network request failed',
          status: 0,
          code: 'NETWORK_ERROR',
          details: err,
        });
      }
    }

    throw new FindYourAiError({
      message: 'Request failed after exhausting all retry attempts',
      status: 0,
      code: 'RETRY_EXHAUSTED',
    });
  }
}
