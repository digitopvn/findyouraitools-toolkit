export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  category?: string;
  tags?: string[];
  upvotes?: number;
  views?: number;
  createdAt?: string;
  [key: string]: unknown;
}

export interface ProductFindParams {
  query?: string;
  category?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  category?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface UpdateProductRequest {
  name?: string;
  tagline?: string;
  description?: string;
  category?: string;
  tags?: string[];
  [key: string]: unknown;
}
