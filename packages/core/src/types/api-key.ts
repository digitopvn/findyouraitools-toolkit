export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string | null;
  last4: string | null;
  userId: string;
  isActive: boolean;
  allowAdmin: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface CreateApiKeyRequest {
  name: string;
}

export interface CreateApiKeyResponse {
  data: ApiKeyItem;
  rawKey: string;
}

export interface RegenerateApiKeyResponse {
  data: ApiKeyItem;
  rawKey: string;
}

export interface ApiKeyStats {
  totalKeys?: number;
  activeKeys?: number;
  totalRequests?: number;
  [key: string]: unknown;
}
