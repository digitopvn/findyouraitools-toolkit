import { Command } from 'commander';
import chalk from 'chalk';
import { createClient } from '../utils/client-factory';
import { formatOutput } from '../ui/formatters';
import { ExitCode } from '../utils/exit-codes';

export function registerAiCommands(program: Command): void {
  program
    .command('ask <prompt>')
    .description('Prompt the FindYourAI model gateway')
    .option('-m, --model <model>', 'AI Model to use', 'google/gemini-2.0-flash-001')
    .action(async (prompt: string, options: { model: string }) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const response = await client.ai.ask({
          model: options.model,
          messages: [{ role: 'user', content: prompt }],
        });
        if (isJson) {
          console.log(formatOutput(response, { isJson }));
        } else {
          console.log(response.data?.text || JSON.stringify(response.data));
        }
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });
}

export function registerAdminCommands(program: Command): void {
  const adminCmd = program.command('admin').description('Administrative oversight commands');

  const adminKeysCmd = adminCmd.command('keys').description('Manage all platform API keys');

  adminKeysCmd
    .command('list')
    .description('List platform API keys across all users')
    .action(async () => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const keys = await client.admin.listKeys();
        console.log(formatOutput(keys, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  adminKeysCmd
    .command('stats')
    .description('View platform API key volume and request metrics')
    .action(async () => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const stats = await client.admin.getKeyStats();
        console.log(formatOutput(stats, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  adminKeysCmd
    .command('issue')
    .description('Issue an administrative API key for a specified user')
    .requiredOption('-u, --user-id <userId>', 'Target user ID')
    .requiredOption('-n, --name <name>', 'Key name')
    .action(async (opts: { userId: string; name: string }) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const result = await client.admin.issueKey(opts.userId, opts.name);
        console.log(formatOutput(result, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  adminKeysCmd
    .command('revoke <id>')
    .description('Revoke any platform API key by ID')
    .action(async (id: string) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const result = await client.admin.revokeKey(id);
        console.log(formatOutput(result, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  const adminUsersCmd = adminCmd.command('users').description('Search and inspect platform users');

  adminUsersCmd
    .command('search <query>')
    .description('Search platform users by name, email, or ID')
    .action(async (query: string) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const users = await client.admin.searchUsers(query);
        console.log(formatOutput(users, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  adminUsersCmd
    .command('get <id>')
    .description('Get user details by ID')
    .action(async (id: string) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const user = await client.admin.getUser(id);
        console.log(formatOutput(user, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });
}
