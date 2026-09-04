import { BaseService } from './base-service';
import type {
  ProductItem,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFindParams,
} from '../types/product';

export class ProductService extends BaseService {
  async list(): Promise<ProductItem[]> {
    const res = await this.get<{ data: ProductItem[] }>('/product');
    return res.data;
  }

  async find(params?: ProductFindParams): Promise<ProductItem[]> {
    const res = await this.get<{ data: ProductItem[] }>('/product/find', {
      query: params as Record<string, string | number | boolean | undefined>,
    });
    return res.data;
  }

  async getBySlug(slug: string): Promise<ProductItem> {
    const res = await this.get<{ data: ProductItem }>(`/product/by-slug/${encodeURIComponent(slug)}`);
    return res.data;
  }

  async getAllProducts(): Promise<ProductItem[]> {
    const res = await this.get<{ data: ProductItem[] }>('/product/all-products');
    return res.data;
  }

  async getById(id: string): Promise<ProductItem> {
    const res = await this.get<{ data: ProductItem }>(`/product/${encodeURIComponent(id)}`);
    return res.data;
  }

  async create(req: CreateProductRequest): Promise<ProductItem> {
    const res = await this.post<{ data: ProductItem }>('/product', req);
    return res.data;
  }

  async update(id: string, req: UpdateProductRequest): Promise<ProductItem> {
    const res = await this.patch<{ data: ProductItem }>(`/product/${encodeURIComponent(id)}`, req);
    return res.data;
  }

  async deleteById(id: string): Promise<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`/product/${encodeURIComponent(id)}`);
  }

  async upvote(id: string): Promise<{ success: boolean }> {
    return this.patch<{ success: boolean }>(`/product/${encodeURIComponent(id)}/upvote`);
  }
}
