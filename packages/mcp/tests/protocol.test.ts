import { describe, it, expect, beforeEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createFindYourAiMcpServer } from '../src/server';
import { FindYourAiClient } from '@findyourai/toolkit-core';

describe('MCP Protocol Handshake & Tool Listing', () => {
  let client: Client;
  let server: Server;
  beforeEach(async () => {
    const mockCoreClient = new FindYourAiClient({ apiKey: 'test-key' });
    server = createFindYourAiMcpServer({ coreClient: mockCoreClient });

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

  it('responds to tools/list with all registered tools and valid schemas', async () => {
    const res = await client.listTools();
    expect(res.tools).toBeDefined();
    expect(res.tools.length).toBeGreaterThanOrEqual(15);

    const toolNames = res.tools.map((t) => t.name);
    expect(toolNames).toContain('fyai_get_health');
    expect(toolNames).toContain('fyai_get_my_profile');
    expect(toolNames).toContain('fyai_get_my_balance');
    expect(toolNames).toContain('fyai_list_api_keys');
    expect(toolNames).toContain('fyai_create_api_key');
    expect(toolNames).toContain('fyai_list_my_mcps');
    expect(toolNames).toContain('fyai_get_mcp');
    expect(toolNames).toContain('fyai_list_my_products');
    expect(toolNames).toContain('fyai_find_products');
    expect(toolNames).toContain('fyai_ask_ai');
    expect(toolNames).toContain('fyai_admin_list_all_keys');

    // Verify all tools have descriptions and inputSchemas
    for (const tool of res.tools) {
      expect(tool.description).toBeDefined();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe('object');
    }
  });
});
