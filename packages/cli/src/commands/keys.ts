import { Command } from 'commander';
import chalk from 'chalk';
import { createClient } from '../utils/client-factory';
import { formatOutput } from '../ui/formatters';
import { ExitCode } from '../utils/exit-codes';

export function registerKeysCommands(program: Command): void {
  const keysCmd = program.command('keys').description('Manage FindYourAI API keys');

  keysCmd
    .command('list')
    .description('List your API keys')
    .action(async () => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const keys = await client.keys.list();
        console.log(formatOutput(keys, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  keysCmd
    .command('create')
    .description('Generate a new API key')
    .requiredOption('-n, --name <name>', 'Descriptive key name')
    .action(async (options: { name: string }) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const res = await client.keys.create({ name: options.name });
        console.log(formatOutput(res, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  keysCmd
    .command('rotate <id>')
    .description('Regenerate an existing API key')
    .action(async (id: string) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const res = await client.keys.rotate(id);
        console.log(formatOutput(res, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  keysCmd
    .command('delete <id>')
    .description('Revoke an API key')
    .action(async (id: string) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const res = await client.keys.deleteById(id);
        console.log(formatOutput(res, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });
}
