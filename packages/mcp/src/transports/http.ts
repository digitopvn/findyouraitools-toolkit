import { Hono } from 'hono';
import { FindYourAiClient } from '@findyourai/toolkit-core';
import { createFindYourAiMcpServer } from '../server';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

export function createHttpApp(): Hono {
  const app = new Hono();

  // Health probe
  app.get('/healthz', (c) => {
    return c.json({ status: 1, service: 'findyourai-mcp-http' });
  });

  // Streamable HTTP SSE endpoint
  app.get('/mcp', () => {
    return new Response('event: endpoint\ndata: /mcp\n\n', {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  });

  // JSON-RPC endpoint
  app.post('/mcp', async (c) => {
    const authHeader = c.req.header('Authorization');
    const apiKeyHeader = c.req.header('X-API-KEY');

    if (!authHeader && !apiKeyHeader) {
      return c.json(
        {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32001,
            message: 'Unauthorized: missing Authorization or X-API-KEY header',
          },
        },
        401
      );
    }

    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const coreClient = new FindYourAiClient({
      apiKey: apiKeyHeader,
      bearerToken: token,
    });

    // Validate credentials against /profile
    try {
      await coreClient.user.getProfile();
    } catch {
      return c.json(
        {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32001,
            message: 'Unauthorized: credentials rejected by FindYourAI /profile',
          },
        },
        401
      );
    }

    let body: { jsonrpc?: string; id?: unknown; method?: string; params?: Record<string, unknown> };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, 400);
    }

    const server = createFindYourAiMcpServer({ coreClient });
    const client = new Client({ name: 'http-bridge', version: '1.0.0' }, { capabilities: {} });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);

    try {
      if (body.method === 'initialize') {
        return c.json({
          jsonrpc: '2.0',
          id: body.id ?? null,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'findyourai-mcp-http', version: '0.1.0' },
          },
        });
      }

      if (body.method === 'tools/list') {
        const list = await client.listTools();
        return c.json({ jsonrpc: '2.0', id: body.id ?? null, result: list });
      }

      if (body.method === 'tools/call') {
        const callParams = body.params as { name: string; arguments?: Record<string, unknown> };
        const result = await client.callTool({
          name: callParams.name,
          arguments: callParams.arguments,
        });
        return c.json({ jsonrpc: '2.0', id: body.id ?? null, result });
      }

      if (body.method === 'ping') {
        return c.json({ jsonrpc: '2.0', id: body.id ?? null, result: {} });
      }

      return c.json(
        {
          jsonrpc: '2.0',
          id: body.id ?? null,
          error: { code: -32601, message: `Method not supported: ${body.method}` },
        },
        400
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return c.json(
        {
          jsonrpc: '2.0',
          id: body.id ?? null,
          error: { code: -32603, message: msg },
        },
        500
      );
    }
  });

  return app;
}
