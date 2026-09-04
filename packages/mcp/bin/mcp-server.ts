import { serve } from '@hono/node-server';
import { createHttpApp } from '../src/transports/http';
import { startStdioServer } from '../src/transports/stdio';

const isHttp = process.argv.includes('--http');

if (isHttp) {
  const portIndex = process.argv.indexOf('--port');
  const port = portIndex !== -1 && process.argv[portIndex + 1] ? parseInt(process.argv[portIndex + 1]!, 10) : 3000;

  const app = createHttpApp();
  serve({ fetch: app.fetch, port }, (info) => {
    console.error(`[FindYourAI MCP] Streamable HTTP server listening on http://localhost:${info.port}/mcp`);
  });
} else {
  startStdioServer().catch((err) => {
    console.error('Fatal MCP server error:', err);
    process.exit(1);
  });
}
