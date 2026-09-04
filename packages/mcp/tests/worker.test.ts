import { describe, it, expect } from 'vitest';
import worker from '../deploy/worker';

describe('Cloudflare Worker Fetch Handler', () => {
  it('responds to GET /healthz with status ok', async () => {
    const req = new Request('http://localhost/healthz');
    const res = await worker.fetch(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  it('responds to POST /mcp with 401 when auth headers are missing', async () => {
    const req = new Request('http://localhost/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
    const res = await worker.fetch(req);
    expect(res.status).toBe(401);
  });

  it('responds to POST /mcp with 200 when X-API-KEY header is supplied', async () => {
    const req = new Request('http://localhost/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'test-edge-key',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
    const res = await worker.fetch(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.jsonrpc).toBe('2.0');
    expect(body.result).toBeDefined();
  });
});
