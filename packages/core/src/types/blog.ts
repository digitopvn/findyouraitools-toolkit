export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateBlogPostRequest {
  title: string;
  slug?: string;
  content: string;
  summary?: string;
  category?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface UpdateBlogPostRequest {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  [key: string]: unknown;
}
