import { BaseService } from './base-service';
import type { ApiKeyItem, ApiKeyStats, CreateApiKeyResponse } from '../types/api-key';
import type { AdminUserSearchResult } from '../types/user';

export class AdminService extends BaseService {
  async listKeys(): Promise<ApiKeyItem[]> {
    const res = await this.get<{ data: ApiKeyItem[] }>('/admin/api-keys');
    return res.data;
  }

  async getKeyStats(): Promise<ApiKeyStats> {
    const res = await this.get<{ data: ApiKeyStats }>('/admin/api-keys/stats');
    return res.data;
  }

  async issueKey(userId: string, name: string): Promise<CreateApiKeyResponse> {
    return this.post<CreateApiKeyResponse>('/admin/api-key', { userId, name });
  }

  async revokeKey(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/admin/api-key/${encodeURIComponent(id)}`);
  }

  async searchUsers(query: string): Promise<AdminUserSearchResult[]> {
    const res = await this.get<{ data: AdminUserSearchResult[] }>('/search/user', {
      query: { query },
    });
    return res.data;
  }

  async getUser(id: string): Promise<AdminUserSearchResult> {
    const res = await this.get<{ data: AdminUserSearchResult }>(`/user/${encodeURIComponent(id)}`);
    return res.data;
  }
}
