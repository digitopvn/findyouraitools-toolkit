export interface McpItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  tags?: string[];
  upvotes?: number;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CreateMcpRequest {
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface UpdateMcpRequest {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface McpCategory {
  id: string;
  name: string;
  slug: string;
  [key: string]: unknown;
}

export interface McpTag {
  id: string;
  name: string;
  slug: string;
  [key: string]: unknown;
}
