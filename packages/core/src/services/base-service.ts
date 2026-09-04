import type { FindYourAiClient } from '../client';
import type { RequestOptions } from '../types/common';

export abstract class BaseService {
  protected readonly client: FindYourAiClient;

  constructor(client: FindYourAiClient) {
    this.client = client;
  }

  protected get<T>(path: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.client.request<T>(path, { ...options, method: 'GET' });
  }

  protected post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.client.request<T>(path, { ...options, method: 'POST', body });
  }

  protected put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.client.request<T>(path, { ...options, method: 'PUT', body });
  }

  protected patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.client.request<T>(path, { ...options, method: 'PATCH', body });
  }

  protected delete<T>(path: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.client.request<T>(path, { ...options, method: 'DELETE' });
  }
}
