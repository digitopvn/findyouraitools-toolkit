export const GOLDEN_RESPONSES = {
  health: {
    status: 1,
  },
  apiKeyCreate: {
    data: {
      id: 'key_12345',
      name: 'Agent Key',
      prefix: 'fyai_pk',
      last4: '9a8b',
      userId: 'user_001',
      isActive: true,
      allowAdmin: false,
      createdAt: '2026-09-04T00:00:00.000Z',
      lastUsedAt: null,
    },
    rawKey: 'fyai_pk_live_secret_9a8b',
  },
  apiKeysList: {
    data: [
      {
        id: 'key_12345',
        name: 'Agent Key',
        prefix: 'fyai_pk',
        last4: '9a8b',
        userId: 'user_001',
        isActive: true,
        allowAdmin: false,
        createdAt: '2026-09-04T00:00:00.000Z',
        lastUsedAt: null,
      },
    ],
  },
  profile: {
    data: {
      id: 'user_001',
      name: 'Alice Developer',
      email: 'alice@digitop.vn',
      role: 'developer',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  },
  balance: {
    balance: {
      credits: 1500,
      currency: 'USD',
      updatedAt: '2026-09-04T00:00:00.000Z',
    },
  },
  transactions: {
    data: [
      {
        id: 'tx_001',
        amount: 25.0,
        type: 'CREDIT',
        description: 'Monthly subscription grant',
        createdAt: '2026-09-01T00:00:00.000Z',
      },
    ],
  },
  mcpGet: {
    data: {
      id: 'mcp_001',
      name: 'Claude Desktop MCP',
      slug: 'claude-desktop-mcp',
      description: 'Official MCP integration for Claude',
      category: 'Developer Tools',
      tags: ['claude', 'mcp', 'agent'],
      upvotes: 42,
      views: 1200,
      createdAt: '2026-02-15T00:00:00.000Z',
    },
  },
  productFind: {
    data: [
      {
        id: 'prod_001',
        name: 'VoiceTranscribe AI',
        slug: 'voice-transcribe-ai',
        tagline: 'Instant audio transcription for teams',
        category: 'Audio',
        upvotes: 95,
        views: 3400,
      },
    ],
  },
  askAi: {
    status: 200,
    data: {
      text: 'Hello! I am FindYourAI assistant.',
      model: 'google/gemini-2.0-flash-001',
    },
    messages: ['Execution completed.'],
  },
  errorUnauthorized: {
    message: 'Invalid or missing API key',
    code: 'UNAUTHORIZED',
    issues: [{ message: 'Header X-API-KEY was rejected' }],
  },
  errorValidation: {
    message: 'Validation failed',
    code: 'BAD_REQUEST',
    issues: [{ message: 'Field name must be between 1 and 100 characters' }],
  },
  errorNotFound: {
    message: 'Resource not found',
    code: 'NOT_FOUND',
  },
};
