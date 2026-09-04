import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createFindYourAiMcpServer } from '../server';
import { FindYourAiClient } from '@findyourai/toolkit-core';

export async function startStdioServer(): Promise<void> {
  // Divert any stray console.log to stderr to prevent stdout JSON-RPC stream corruption
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    console.error(...args);
  };

  const coreClient = new FindYourAiClient({
    apiKey: process.env.FYAI_API_KEY || process.env.FINDYOURAI_API_KEY,
  });

  const server = createFindYourAiMcpServer({ coreClient });
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error('[FindYourAI MCP] Server connected via stdio');
}
