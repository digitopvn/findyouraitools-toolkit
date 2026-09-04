import { Command } from 'commander';
import chalk from 'chalk';
import { createClient } from '../utils/client-factory';
import { formatOutput } from '../ui/formatters';
import { ExitCode } from '../utils/exit-codes';

export function registerBalanceCommands(program: Command): void {
  const balanceCmd = program
    .command('balance')
    .description('Check credits balance and transaction history')
    .action(async () => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const balance = await client.user.getBalance();
        console.log(formatOutput(balance, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Failed to fetch balance: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  balanceCmd
    .command('transactions')
    .description('List recent balance transactions')
    .action(async () => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const txs = await client.user.getTransactions();
        console.log(formatOutput(txs, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Failed to fetch transactions: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });
}
