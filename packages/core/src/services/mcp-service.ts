import { BaseService } from './base-service';
import type {
  McpItem,
  CreateMcpRequest,
  UpdateMcpRequest,
  McpCategory,
  McpTag,
} from '../types/mcp';

export class McpService extends BaseService {
  async list(): Promise<McpItem[]> {
    const res = await this.get<{ data: McpItem[] }>('/mcp');
    return res.data;
  }

  async getBySlug(slug: string): Promise<McpItem> {
    const res = await this.get<{ data: McpItem }>(`/mcp/by-slug/${encodeURIComponent(slug)}`);
    return res.data;
  }

  async getAllSlugs(): Promise<string[]> {
    const res = await this.get<{ data: string[] }>('/mcp/all-slugs');
    return res.data;
  }

  async getById(id: string): Promise<McpItem> {
    const res = await this.get<{ data: McpItem }>(`/mcp/${encodeURIComponent(id)}`);
    return res.data;
  }

  async create(req: CreateMcpRequest): Promise<McpItem> {
    const res = await this.post<{ data: McpItem }>('/mcp', req);
    return res.data;
  }

  async update(id: string, req: UpdateMcpRequest): Promise<McpItem> {
    const res = await this.put<{ data: McpItem }>(`/mcp/${encodeURIComponent(id)}`, req);
    return res.data;
  }

  async deleteById(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/mcp/${encodeURIComponent(id)}`);
  }

  async upvote(id: string): Promise<{ success: boolean }> {
    return this.patch<{ success: boolean }>(`/mcp/${encodeURIComponent(id)}/upvote`);
  }

  async downvote(id: string): Promise<{ success: boolean }> {
    return this.patch<{ success: boolean }>(`/mcp/${encodeURIComponent(id)}/downvote`);
  }

  async incrementViews(id: string): Promise<{ success: boolean }> {
    return this.patch<{ success: boolean }>(`/mcp/${encodeURIComponent(id)}/increment-views`);
  }

  async getCategories(): Promise<McpCategory[]> {
    const res = await this.get<{ data: McpCategory[] }>('/mcp/categories');
    return res.data;
  }

  async getTags(): Promise<McpTag[]> {
    const res = await this.get<{ data: McpTag[] }>('/mcp/tags');
    return res.data;
  }
}
