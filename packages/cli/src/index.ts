import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth';
import { registerBalanceCommands } from './commands/balance';
import { registerKeysCommands } from './commands/keys';
import { registerMcpCommands, registerProductsCommands, registerBlogCommands } from './commands/catalog';
import { registerAiCommands, registerAdminCommands } from './commands/ai-admin';
import { registerMcpLauncher } from './commands/mcp-launcher';

export function createProgram(): Command {
  const program = new Command();

  program
    .name('fyai')
    .description('FindYourAI.tools Official CLI')
    .version('0.1.0')
    .option('--json', 'Output machine-readable JSON to stdout')
    .option('--api-key <key>', 'Override API key for this execution')
    .option('-q, --quiet', 'Suppress non-error logs')
    .option('-v, --verbose', 'Print verbose network logs');

  registerAuthCommands(program);
  registerBalanceCommands(program);
  registerKeysCommands(program);
  registerMcpCommands(program);
  registerProductsCommands(program);
  registerBlogCommands(program);
  registerAiCommands(program);
  registerAdminCommands(program);
  registerMcpLauncher(program);

  return program;
}
