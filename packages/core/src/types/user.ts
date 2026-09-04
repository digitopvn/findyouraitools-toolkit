export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface UserBalance {
  credits?: number;
  currency?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface CashTransaction {
  id?: string;
  amount?: number;
  type?: string;
  description?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface AdminUserSearchResult {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  createdAt?: string;
  [key: string]: unknown;
}
