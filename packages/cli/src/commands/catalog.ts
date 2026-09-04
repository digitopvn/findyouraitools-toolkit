import { Command } from 'commander';
import chalk from 'chalk';
import { createClient } from '../utils/client-factory';
import { formatOutput } from '../ui/formatters';
import { ExitCode } from '../utils/exit-codes';

export function registerMcpCommands(program: Command): void {
  const mcpCmd = program.command('mcps').description('Explore and manage MCP directory entries');

  mcpCmd
    .command('list')
    .description('List MCP directory entries')
    .action(async () => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const list = await client.mcp.list();
        console.log(formatOutput(list, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  mcpCmd
    .command('get <slug>')
    .description('Get MCP entry details by slug')
    .action(async (slug: string) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const mcp = await client.mcp.getBySlug(slug);
        console.log(formatOutput(mcp, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  mcpCmd
    .command('create')
    .description('Register a new MCP server listing')
    .requiredOption('-n, --name <name>', 'MCP server name')
    .option('-d, --desc <description>', 'Description of MCP capabilities')
    .option('-c, --category <category>', 'Primary category')
    .action(async (opts: { name: string; desc?: string; category?: string }) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const mcp = await client.mcp.create({
          name: opts.name,
          description: opts.desc,
          category: opts.category,
        });
        console.log(formatOutput(mcp, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  mcpCmd
    .command('update <id>')
    .description('Update metadata of an existing MCP server')
    .option('-n, --name <name>', 'Updated name')
    .option('-d, --desc <description>', 'Updated description')
    .option('-c, --category <category>', 'Updated category')
    .action(async (id: string, opts: { name?: string; desc?: string; category?: string }) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const mcp = await client.mcp.update(id, {
          name: opts.name,
          description: opts.desc,
          category: opts.category,
        });
        console.log(formatOutput(mcp, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  mcpCmd
    .command('delete <id>')
    .description('Delete an MCP server listing by ID')
    .action(async (id: string) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const res = await client.mcp.deleteById(id);
        console.log(formatOutput(res, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });
}

export function registerProductsCommands(program: Command): void {
  const productsCmd = program.command('products').description('Explore and manage AI products');

  productsCmd
    .command('list')
    .description('List AI products')
    .action(async () => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const list = await client.product.list();
        console.log(formatOutput(list, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  productsCmd
    .command('find [query]')
    .description('Search AI products by keyword')
    .option('-q, --query <query>', 'Search query')
    .action(async (queryArg: string | undefined, opts: { query?: string }) => {
      const isJson = program.opts().json;
      const query = queryArg || opts.query;
      if (!query) {
        console.error(chalk.red('Error: please specify a search query: fyai products find <query>'));
        process.exit(ExitCode.INVALID_ARGUMENTS);
      }
      const client = createClient(program.opts());
      try {
        const results = await client.product.find({ query });
        console.log(formatOutput(results, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });
  productsCmd
    .command('get <slug>')
    .description('Get product details by slug')
    .action(async (slug: string) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const product = await client.product.getBySlug(slug);
        console.log(formatOutput(product, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  productsCmd
    .command('create')
    .description('Register a new AI product listing')
    .requiredOption('-n, --name <name>', 'Product name')
    .option('-t, --tagline <tagline>', 'Short tagline')
    .option('-d, --desc <description>', 'Detailed description')
    .action(async (opts: { name: string; tagline?: string; desc?: string }) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const product = await client.product.create({
          name: opts.name,
          tagline: opts.tagline,
          description: opts.desc,
        });
        console.log(formatOutput(product, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  productsCmd
    .command('update <id>')
    .description('Update metadata of an existing AI product')
    .option('-n, --name <name>', 'Updated name')
    .option('-t, --tagline <tagline>', 'Updated tagline')
    .option('-d, --desc <description>', 'Updated description')
    .action(async (id: string, opts: { name?: string; tagline?: string; desc?: string }) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const product = await client.product.update(id, {
          name: opts.name,
          tagline: opts.tagline,
          description: opts.desc,
        });
        console.log(formatOutput(product, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  productsCmd
    .command('delete <id>')
    .description('Delete an AI product listing by ID')
    .action(async (id: string) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const res = await client.product.deleteById(id);
        console.log(formatOutput(res, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });
}

export function registerBlogCommands(program: Command): void {
  const blogCmd = program.command('blog').description('Read and manage community blog posts');

  blogCmd
    .command('list')
    .description('List blog posts')
    .action(async () => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const posts = await client.blog.list();
        console.log(formatOutput(posts, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  blogCmd
    .command('get <slug>')
    .description('Read a blog post by slug')
    .action(async (slug: string) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const post = await client.blog.getBySlug(slug);
        console.log(formatOutput(post, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });

  blogCmd
    .command('create')
    .description('Publish a community article')
    .requiredOption('-t, --title <title>', 'Post title')
    .requiredOption('-c, --content <content>', 'Post content')
    .action(async (opts: { title: string; content: string }) => {
      const isJson = program.opts().json;
      const client = createClient(program.opts());
      try {
        const post = await client.blog.create({ title: opts.title, content: opts.content });
        console.log(formatOutput(post, { isJson }));
      } catch (err: unknown) {
        console.error(chalk.red(`Error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(ExitCode.GENERAL_ERROR);
      }
    });
}
