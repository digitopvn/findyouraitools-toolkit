import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { FindYourAiClient } from '@findyourai/toolkit-core';
import { registerAllTools } from './tools/index';

export interface ServerOptions {
  coreClient?: FindYourAiClient;
}

export function createFindYourAiMcpServer(options: ServerOptions = {}): Server {
  const coreClient = options.coreClient || new FindYourAiClient();

  const server = new Server(
    {
      name: 'findyourai-mcp-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  registerAllTools(server, { coreClient });

  return server;
}
