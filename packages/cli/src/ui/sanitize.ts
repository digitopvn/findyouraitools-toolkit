export function maskKey(prefix?: string | null, last4?: string | null): string {
  const p = prefix || 'key';
  const l = last4 || '****';
  return `${p}...${l}`;
}

export function maskSecret(secret?: string | null): string {
  if (!secret) return 'none';
  if (secret.length <= 8) return '****';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}
