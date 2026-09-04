import { BaseService } from './base-service';
import type {
  ApiKeyItem,
  CreateApiKeyRequest,
  CreateApiKeyResponse,
  RegenerateApiKeyResponse,
} from '../types/api-key';

export class KeyService extends BaseService {
  async list(): Promise<ApiKeyItem[]> {
    const res = await this.get<{ data: ApiKeyItem[] }>('/api-keys');
    return res.data;
  }

  async create(req: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    return this.post<CreateApiKeyResponse>('/api-key', req);
  }

  async getById(id: string): Promise<ApiKeyItem> {
    const res = await this.get<{ data: ApiKeyItem }>(`/api-key/${encodeURIComponent(id)}`);
    return res.data;
  }

  async rotate(id: string): Promise<RegenerateApiKeyResponse> {
    return this.post<RegenerateApiKeyResponse>(`/api-key/${encodeURIComponent(id)}/regenerate`);
  }

  async deleteById(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/api-key/${encodeURIComponent(id)}`);
  }
}
