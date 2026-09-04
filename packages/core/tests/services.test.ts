import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FindYourAiClient } from '../src/client';
import { GOLDEN_RESPONSES } from './fixtures/golden-responses';

describe('Service Layer & Envelopes Full Coverage', () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  let client: FindYourAiClient;

  beforeEach(() => {
    mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/user/balance')) {
        return {
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => GOLDEN_RESPONSES.balance,
        };
      }
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          data: { id: 'test-id', success: true },
          rawKey: 'raw-key-secret',
        }),
      };
    });

    client = new FindYourAiClient({ apiKey: 'k', fetch: mockFetch });
  });

  it('KeyService: exercises list, getById, rotate, deleteById', async () => {
    await client.keys.list();
    await client.keys.getById('k-1');
    await client.keys.rotate('k-1');
    await client.keys.deleteById('k-1');
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it('McpService: exercises all taxonomy, mutation and voting methods', async () => {
    await client.mcp.list();
    await client.mcp.getBySlug('test-slug');
    await client.mcp.getAllSlugs();
    await client.mcp.getById('m-1');
    await client.mcp.create({ name: 'New MCP' });
    await client.mcp.update('m-1', { name: 'Updated' });
    await client.mcp.deleteById('m-1');
    await client.mcp.upvote('m-1');
    await client.mcp.downvote('m-1');
    await client.mcp.incrementViews('m-1');
    await client.mcp.getCategories();
    await client.mcp.getTags();
    expect(mockFetch).toHaveBeenCalledTimes(12);
  });

  it('ProductService: exercises all product methods', async () => {
    await client.product.list();
    await client.product.find({ query: 'ai' });
    await client.product.getBySlug('prod-slug');
    await client.product.getAllProducts();
    await client.product.getById('p-1');
    await client.product.create({ name: 'Prod' });
    await client.product.update('p-1', { name: 'Prod Updated' });
    await client.product.deleteById('p-1');
    await client.product.upvote('p-1');
    expect(mockFetch).toHaveBeenCalledTimes(9);
  });

  it('BlogService: exercises all blog methods', async () => {
    await client.blog.list();
    await client.blog.getBySlug('blog-slug');
    await client.blog.getById('b-1');
    await client.blog.create({ title: 'Post', content: 'Body' });
    await client.blog.update('b-1', { title: 'Updated' });
    await client.blog.deleteById('b-1');
    expect(mockFetch).toHaveBeenCalledTimes(6);
  });

  it('UserService: exercises getProfile, getBalance, getTransactions', async () => {
    const profile = await client.user.getProfile();
    expect(profile).toBeDefined();

    const balance = await client.user.getBalance();
    expect(balance.credits).toBe(1500);

    const txs = await client.user.getTransactions();
    expect(txs).toBeDefined();
  });

  it('AiService: exercises ask and getModels', async () => {
    await client.ai.ask({ messages: [{ role: 'user', content: 'Hi' }] });
    await client.ai.getModels();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('AdminService: exercises listKeys, getKeyStats, issueKey, revokeKey, searchUsers', async () => {
    await client.admin.listKeys();
    await client.admin.getKeyStats();
    await client.admin.issueKey('u-1', 'Admin Key');
    await client.admin.revokeKey('k-1');
    await client.admin.searchUsers('test');
    expect(mockFetch).toHaveBeenCalledTimes(5);
  });
});
