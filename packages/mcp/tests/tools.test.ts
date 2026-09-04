import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createFindYourAiMcpServer } from '../src/server';
import { FindYourAiClient } from '@findyourai/toolkit-core';

describe('MCP Tool Execution', () => {
  let client: Client;
  let mockCoreClient: FindYourAiClient;

  beforeEach(async () => {
    mockCoreClient = new FindYourAiClient({ apiKey: 'test-key' });
    const server = createFindYourAiMcpServer({ coreClient: mockCoreClient });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    client = new Client(
      { name: 'test-client', version: '1.0.0' },
      { capabilities: {} }
    );

    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  });

  it('executes fyai_get_health successfully', async () => {
    vi.spyOn(mockCoreClient, 'getHealth').mockResolvedValue({ status: 'ok' });

    const res = await client.callTool({ name: 'fyai_get_health', arguments: {} });
    expect(res.isError).toBeFalsy();
    expect(res.content).toHaveLength(1);
    expect(res.content[0]?.type).toBe('text');

    const body = JSON.parse((res.content[0] as { text: string }).text);
    expect(body).toEqual({ status: 'ok' });
  });

  it('executes fyai_get_my_balance successfully extracting balance envelope', async () => {
    vi.spyOn(mockCoreClient.user, 'getBalance').mockResolvedValue({
      credits: 1000,
      currency: 'USD',
    });

    const res = await client.callTool({ name: 'fyai_get_my_balance', arguments: {} });
    expect(res.isError).toBeFalsy();

    const body = JSON.parse((res.content[0] as { text: string }).text);
    expect(body.credits).toBe(1000);
    expect(body.currency).toBe('USD');
  });

  it('executes fyai_create_api_key passing parameters', async () => {
    vi.spyOn(mockCoreClient.keys, 'create').mockResolvedValue({
      data: {
        id: 'k-1',
        name: 'Agent Key',
        prefix: 'pk',
        last4: '1234',
        userId: 'u-1',
        isActive: true,
        allowAdmin: false,
        createdAt: '2026-09-04T00:00:00Z',
        lastUsedAt: null,
      },
      rawKey: 'pk_secret_1234',
    });

    const res = await client.callTool({
      name: 'fyai_create_api_key',
      arguments: { name: 'Agent Key' },
    });

    expect(res.isError).toBeFalsy();
    const body = JSON.parse((res.content[0] as { text: string }).text);
    expect(body.rawKey).toBe('pk_secret_1234');
    expect(body.data.name).toBe('Agent Key');
  });
});
