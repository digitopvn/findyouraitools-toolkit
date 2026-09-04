import { Command } from 'commander';
import chalk from 'chalk';
import { ConfigStore } from '../auth/config-store';
import { createClient } from '../utils/client-factory';
import { formatOutput } from '../ui/formatters';
import { maskKey } from '../ui/sanitize';
import { ExitCode } from '../utils/exit-codes';

export function registerAuthCommands(program: Command): void {
  program
    .command('login')
    .description('Authenticate with FindYourAI using an API key')
    .argument('[key]', 'API key')
    .action(async (keyArg: string | undefined) => {
      const isJson = program.opts().json;
      const apiKey = keyArg;

      if (!apiKey) {
        console.error(chalk.red('Please provide your API key: fyai login <key>'));
        process.exit(ExitCode.INVALID_ARGUMENTS);
      }

      const client = createClient({ apiKey });
      try {
        const profile = await client.user.getProfile();
        const store = new ConfigStore();
        store.write({ apiKey });

        if (isJson) {
          console.log(formatOutput({ success: true, user: profile }, { isJson }));
        } else {
          const identifier =
            (typeof profile['name'] === 'string' && profile['name']) ||
            (typeof profile['id'] === 'string' && profile['id']) ||
            'User';
          console.log(chalk.green(`✓ Successfully authenticated as ${identifier}`));
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (isJson) {
          console.log(formatOutput({ success: false, error: msg }, { isJson }));
        } else {
          console.error(chalk.red(`Authentication failed: ${msg}`));
        }
        process.exit(ExitCode.AUTH_FAILURE);
      }
    });

  program
    .command('logout')
    .description('Log out and remove stored credentials')
    .action(() => {
      const store = new ConfigStore();
      store.clear();
      const isJson = program.opts().json;
      if (isJson) {
        console.log(formatOutput({ success: true }, { isJson }));
      } else {
        console.log(chalk.green('✓ Stored credentials cleared successfully.'));
      }
    });

  program
    .command('whoami')
    .description('Display current authenticated user profile')
    .action(async () => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const profile = await client.user.getProfile();
        console.log(formatOutput(profile, { isJson }));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (isJson) {
          console.log(formatOutput({ error: msg }, { isJson }));
        } else {
          console.error(chalk.red(`Error: ${msg}`));
        }
        process.exit(ExitCode.AUTH_FAILURE);
      }
    });

  program
    .command('doctor')
    .description('Verify network health and check credential configuration')
    .action(async () => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      const auth = client.apiKey;
      try {
        const health = await client.getHealth();
        let keyMasked: string | null = null;
        let authenticated = false;

        if (auth) {
          try {
            const keys = await client.keys.list();
            authenticated = true;
            const firstKey = keys && keys.length > 0 ? keys[0] : null;
            keyMasked = firstKey ? maskKey(firstKey.prefix, firstKey.last4) : null;
          } catch {
            authenticated = false;
            keyMasked = null;
          }
        }

        const result = {
          status: health.status,
          auth: {
            configured: Boolean(auth),
            keyMasked,
          },
        };
        console.log(formatOutput(result, { isJson }));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        const result = {
          status: 0,
          auth: {
            configured: Boolean(auth),
            keyMasked: null,
          },
          error: msg,
        };
        console.log(formatOutput(result, { isJson }));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });
}
