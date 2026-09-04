import { BaseService } from './base-service';
import type { BlogPost, CreateBlogPostRequest, UpdateBlogPostRequest } from '../types/blog';

export class BlogService extends BaseService {
  async list(): Promise<BlogPost[]> {
    const res = await this.get<{ data: BlogPost[] }>('/blog/posts');
    return res.data;
  }

  async getBySlug(slug: string): Promise<BlogPost> {
    const res = await this.get<{ data: BlogPost }>(`/blog/posts/by-slug/${encodeURIComponent(slug)}`);
    return res.data;
  }

  async getById(id: string): Promise<BlogPost> {
    const res = await this.get<{ data: BlogPost }>(`/blog/posts/${encodeURIComponent(id)}`);
    return res.data;
  }

  async create(req: CreateBlogPostRequest): Promise<BlogPost> {
    const res = await this.post<{ data: BlogPost }>('/blog/posts', req);
    return res.data;
  }

  async update(id: string, req: UpdateBlogPostRequest): Promise<BlogPost> {
    const res = await this.patch<{ data: BlogPost }>(`/blog/posts/${encodeURIComponent(id)}`, req);
    return res.data;
  }

  async deleteById(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/blog/posts/${encodeURIComponent(id)}`);
  }
}
