import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { FindYourAiClient, FindYourAiError } from '@findyourai/toolkit-core';
import { z } from 'zod';

export interface RegisterToolsOptions {
  coreClient: FindYourAiClient;
}

export function registerAllTools(server: Server, options: RegisterToolsOptions): void {
  const client = options.coreClient;

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'fyai_get_health',
          description: 'Verify network health and connectivity to FindYourAI.tools backend (/healthz).',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'fyai_get_my_profile',
          description: 'Get current authenticated user profile, identity, and timestamps.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'fyai_get_my_balance',
          description: 'Get current user credit balances and currency information.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'fyai_list_my_transactions',
          description: 'List recent balance cash transactions and grant history.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'fyai_list_api_keys',
          description: 'List API keys owned by the authenticated user.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'fyai_create_api_key',
          description: 'Create a new FindYourAI API key (returns rawKey once).',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Descriptive name for the API key (1-100 chars)' },
            },
            required: ['name'],
          },
        },
        {
          name: 'fyai_rotate_api_key',
          description: 'Regenerate an existing API key by ID (returns new rawKey).',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'API Key ID' },
            },
            required: ['id'],
          },
        },
        {
          name: 'fyai_revoke_api_key',
          description: 'Revoke and delete an API key by ID.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'API Key ID' },
            },
            required: ['id'],
          },
        },
        {
          name: 'fyai_list_my_mcps',
          description: 'List MCP server directory listings created by the user.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'fyai_get_mcp',
          description: 'Get full MCP server specification, tags, and endpoints by slug.',
          inputSchema: {
            type: 'object',
            properties: {
              slug: { type: 'string', description: 'MCP server slug (e.g. claude-desktop-mcp)' },
            },
            required: ['slug'],
          },
        },
        {
          name: 'fyai_create_mcp',
          description: 'Register a new MCP server in the FindYourAI directory.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'MCP server name' },
              description: { type: 'string', description: 'Overview of capabilities' },
              category: { type: 'string', description: 'Primary category' },
            },
            required: ['name'],
          },
        },
        {
          name: 'fyai_update_mcp',
          description: 'Update parameters or metadata of an existing MCP server listing.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'MCP server ID' },
              name: { type: 'string', description: 'Updated name' },
              description: { type: 'string', description: 'Updated description' },
              category: { type: 'string', description: 'Updated category' },
            },
            required: ['id'],
          },
        },
        {
          name: 'fyai_delete_mcp',
          description: 'Delete an MCP server listing by ID.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'MCP server ID' },
            },
            required: ['id'],
          },
        },
        {
          name: 'fyai_list_my_products',
          description: 'List AI products registered by the user.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'fyai_find_products',
          description: 'Search public AI products in FindYourAI directory by keyword query (/product/find).',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search term or keyword' },
            },
            required: ['query'],
          },
        },
        {
          name: 'fyai_get_product',
          description: 'Get detailed product profile, tagline, and reviews by slug.',
          inputSchema: {
            type: 'object',
            properties: {
              slug: { type: 'string', description: 'Product slug (e.g. voice-transcribe-ai)' },
            },
            required: ['slug'],
          },
        },
        {
          name: 'fyai_create_product',
          description: 'Register a new AI product listing.',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Product name' },
              tagline: { type: 'string', description: 'One-line value proposition' },
              description: { type: 'string', description: 'Detailed product description' },
            },
            required: ['name'],
          },
        },
        {
          name: 'fyai_update_product',
          description: 'Update metadata of an AI product listing.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Product ID' },
              name: { type: 'string', description: 'Updated product name' },
              tagline: { type: 'string', description: 'Updated tagline' },
              description: { type: 'string', description: 'Updated description' },
            },
            required: ['id'],
          },
        },
        {
          name: 'fyai_delete_product',
          description: 'Delete an AI product listing by ID.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Product ID' },
            },
            required: ['id'],
          },
        },
        {
          name: 'fyai_create_blog_post',
          description: 'Publish a community article or tutorial on FindYourAI blog.',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Post title' },
              content: { type: 'string', description: 'Post content (Markdown)' },
            },
            required: ['title', 'content'],
          },
        },
        {
          name: 'fyai_ask_ai',
          description: 'Execute a prompt on FindYourAI model gateway (/ask-ai).',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: { type: 'string', description: 'Prompt text' },
              model: { type: 'string', description: 'Model ID (default: google/gemini-2.0-flash-001)' },
            },
            required: ['prompt'],
          },
        },
        {
          name: 'fyai_list_ai_models',
          description: 'List available AI models accessible through the FindYourAI gateway.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'fyai_admin_list_all_keys',
          description: 'Admin: List all API keys across users.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'fyai_admin_get_key_stats',
          description: 'Admin: Get API key volume and request statistics.',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'fyai_admin_issue_key',
          description: 'Admin: Issue an administrative API key for a specified user.',
          inputSchema: {
            type: 'object',
            properties: {
              userId: { type: 'string', description: 'Target user ID' },
              name: { type: 'string', description: 'API key name' },
            },
            required: ['userId', 'name'],
          },
        },
        {
          name: 'fyai_admin_revoke_key',
          description: 'Admin: Revoke any API key by ID.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'API key ID' },
            },
            required: ['id'],
          },
        },
        {
          name: 'fyai_admin_search_users',
          description: 'Admin: Search platform users by email, name, or ID.',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search term' },
            },
            required: ['query'],
          },
        },
        {
          name: 'fyai_admin_get_user',
          description: 'Admin: Get user profile details by ID.',
          inputSchema: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'User ID' },
            },
            required: ['id'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result: unknown;

      switch (name) {
        case 'fyai_get_health': {
          result = await client.getHealth();
          break;
        }
        case 'fyai_get_my_profile': {
          result = await client.user.getProfile();
          break;
        }
        case 'fyai_get_my_balance': {
          result = await client.user.getBalance();
          break;
        }
        case 'fyai_list_my_transactions': {
          result = await client.user.getTransactions();
          break;
        }
        case 'fyai_list_api_keys': {
          result = await client.keys.list();
          break;
        }
        case 'fyai_create_api_key': {
          const parsed = z.object({ name: z.string().min(1).max(100) }).parse(args);
          result = await client.keys.create({ name: parsed.name });
          break;
        }
        case 'fyai_rotate_api_key': {
          const parsed = z.object({ id: z.string().min(1) }).parse(args);
          result = await client.keys.rotate(parsed.id);
          break;
        }
        case 'fyai_revoke_api_key': {
          const parsed = z.object({ id: z.string().min(1) }).parse(args);
          result = await client.keys.deleteById(parsed.id);
          break;
        }
        case 'fyai_list_my_mcps': {
          result = await client.mcp.list();
          break;
        }
        case 'fyai_get_mcp': {
          const parsed = z.object({ slug: z.string().min(1) }).parse(args);
          result = await client.mcp.getBySlug(parsed.slug);
          break;
        }
        case 'fyai_create_mcp': {
          const parsed = z
            .object({
              name: z.string().min(1),
              description: z.string().optional(),
              category: z.string().optional(),
            })
            .parse(args);
          result = await client.mcp.create(parsed);
          break;
        }
        case 'fyai_list_my_products': {
          result = await client.product.list();
          break;
        }
        case 'fyai_find_products': {
          const parsed = z.object({ query: z.string().min(1) }).parse(args);
          result = await client.product.find({ query: parsed.query });
          break;
        }
        case 'fyai_get_product': {
          const parsed = z.object({ slug: z.string().min(1) }).parse(args);
          result = await client.product.getBySlug(parsed.slug);
          break;
        }
        case 'fyai_create_product': {
          const parsed = z
            .object({
              name: z.string().min(1),
              tagline: z.string().optional(),
              description: z.string().optional(),
            })
            .parse(args);
          result = await client.product.create(parsed);
          break;
        }
        case 'fyai_create_blog_post': {
          const parsed = z.object({ title: z.string().min(1), content: z.string().min(1) }).parse(args);
          result = await client.blog.create(parsed);
          break;
        }
        case 'fyai_ask_ai': {
          const parsed = z
            .object({
              prompt: z.string().min(1),
              model: z.string().optional(),
            })
            .parse(args);
          result = await client.ai.ask({
            model: parsed.model,
            messages: [{ role: 'user', content: parsed.prompt }],
          });
          break;
        }
        case 'fyai_list_ai_models': {
          result = await client.ai.getModels();
          break;
        }
        case 'fyai_admin_list_all_keys': {
          result = await client.admin.listKeys();
          break;
        }
        case 'fyai_admin_get_key_stats': {
          result = await client.admin.getKeyStats();
          break;
        }
        case 'fyai_update_mcp': {
          const parsed = z
            .object({
              id: z.string().min(1),
              name: z.string().optional(),
              description: z.string().optional(),
              category: z.string().optional(),
            })
            .parse(args);
          const { id, ...data } = parsed;
          result = await client.mcp.update(id, data);
          break;
        }
        case 'fyai_delete_mcp': {
          const parsed = z.object({ id: z.string().min(1) }).parse(args);
          result = await client.mcp.deleteById(parsed.id);
          break;
        }
        case 'fyai_update_product': {
          const parsed = z
            .object({
              id: z.string().min(1),
              name: z.string().optional(),
              tagline: z.string().optional(),
              description: z.string().optional(),
            })
            .parse(args);
          const { id, ...data } = parsed;
          result = await client.product.update(id, data);
          break;
        }
        case 'fyai_delete_product': {
          const parsed = z.object({ id: z.string().min(1) }).parse(args);
          result = await client.product.deleteById(parsed.id);
          break;
        }
        case 'fyai_admin_issue_key': {
          const parsed = z
            .object({
              userId: z.string().min(1),
              name: z.string().min(1),
            })
            .parse(args);
          result = await client.admin.issueKey(parsed.userId, parsed.name);
          break;
        }
        case 'fyai_admin_revoke_key': {
          const parsed = z.object({ id: z.string().min(1) }).parse(args);
          result = await client.admin.revokeKey(parsed.id);
          break;
        }
        case 'fyai_admin_search_users': {
          const parsed = z.object({ query: z.string().min(1) }).parse(args);
          result = await client.admin.searchUsers(parsed.query);
          break;
        }
        case 'fyai_admin_get_user': {
          const parsed = z.object({ id: z.string().min(1) }).parse(args);
          result = await client.admin.getUser(parsed.id);
          break;
        }
        default:
          throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  error: true,
                  code: 'VALIDATION_ERROR',
                  message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
                  remediation: 'Please check tool parameters against the declared inputSchema.',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const code = err instanceof FindYourAiError ? err.code : 'TOOL_EXECUTION_ERROR';
      const remediation =
        err instanceof FindYourAiError
          ? err.remediation
          : 'Check that credentials are valid and network endpoint is accessible.';

      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: true,
                code,
                message: err instanceof Error ? err.message : String(err),
                remediation,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  });
}
