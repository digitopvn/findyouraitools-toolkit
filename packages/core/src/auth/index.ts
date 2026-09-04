export interface AuthCredentials {
  apiKey?: string;
  bearerToken?: string;
}

export function buildAuthHeaders(credentials: AuthCredentials): Record<string, string> {
  const headers: Record<string, string> = {};
  if (credentials.apiKey) {
    headers['X-API-KEY'] = credentials.apiKey;
  }
  if (credentials.bearerToken) {
    headers['Authorization'] = `Bearer ${credentials.bearerToken}`;
  }
  return headers;
}
