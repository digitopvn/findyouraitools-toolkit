import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import worker from '../deploy/worker';

describe('Cloudflare Worker Fetch Handler', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/profile')) {
        return new Response(JSON.stringify({ data: { id: 'u1' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ status: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('responds to GET /healthz with status 1', async () => {
    const req = new Request('http://localhost/healthz');
    const res = await worker.fetch(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe(1);
  });

  it('responds to GET /mcp with text/event-stream SSE header', async () => {
    const req = new Request('http://localhost/mcp');
    const res = await worker.fetch(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/event-stream');
  });

  it('responds to POST /mcp with 401 and JSON-RPC error -32001 when auth headers are missing', async () => {
    const req = new Request('http://localhost/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    });
    const res = await worker.fetch(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error?.code).toBe(-32001);
  });

  it('responds to POST /mcp with 200 when X-API-KEY header is supplied and verified', async () => {
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
    expect(body.result?.tools).toBeDefined();
  });
});
