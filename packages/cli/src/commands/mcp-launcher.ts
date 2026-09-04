import { Command } from 'commander';
import { spawn } from 'node:child_process';

export function registerMcpLauncher(program: Command): void {
  program
    .command('mcp')
    .description('Launch the FindYourAI Model Context Protocol (MCP) server on stdio')
    .action(() => {
      // Spawn MCP server child process inheriting stdio for Claude/Cursor
      const mcpProcess = spawn('npx', ['-y', '@findyourai/mcp-server'], {
        stdio: 'inherit',
        env: process.env,
      });

      mcpProcess.on('error', (err) => {
        console.error('Failed to spawn MCP server:', err.message);
        process.exit(1);
      });

      mcpProcess.on('exit', (code) => {
        process.exit(code ?? 0);
      });
    });
}
