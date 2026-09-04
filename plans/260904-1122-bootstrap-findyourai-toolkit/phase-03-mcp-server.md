---
phase: 3
title: "MCP Server (@findyourai/mcp-server)"
status: completed
priority: P1
effort: "1.5d"
dependencies: [1]
---

# Phase 3: MCP Server (@findyourai/mcp-server)

## Overview
Implement the official FindYourAI Model Context Protocol (MCP) server package (`@findyourai/mcp-server`). Built on the official `@modelcontextprotocol/sdk`, this server exposes 22 verified FindYourAI resources and actions as structured tools to AI agents across both local desktop clients (Claude Desktop, Cursor via stdio) and remote serverless architectures (Streamable HTTP / SSE with Bearer or API Key authentication).

## Requirements

### Functional
- Core Server initialization using `@modelcontextprotocol/sdk` with server capabilities (`tools: {}`).
- Support Dual Transports:
  1. **stdio Transport**: Default for local developer desktops, launched via `npx @findyourai/mcp-server` or `fyai mcp`.
  2. **Streamable HTTP Transport**: Remote endpoint at `/mcp` with Server-Sent Events (SSE) support for multi-tenant and cloud agent environments.
- Authentication on HTTP Transport:
  - Validates `Authorization: Bearer <token>` or `X-API-KEY: <key>` against `/profile`.
  - Rejects unauthorized requests with HTTP 401 and JSON-RPC error `-32001` (Unauthorized).
  *(OAuth 2.1 is out-of-scope; only verified apiKey and bearerAuth are supported)*.
- Implement Full Agent Tool Catalog (22 verified tools, `snake_case` naming per MCP standard):
  - **Health & Diagnostic Tools**:
    - `fyai_get_health`: Verifies backend service reachability against `/healthz`.
  - **User & Balance Tools**:
    - `fyai_get_my_profile`: Fetches authenticated user identity and timestamps from `/profile`.
    - `fyai_get_my_balance`: Returns current credit balances from `/user/balance` (extracting `balance` envelope).
    - `fyai_list_my_transactions`: Retrieves paginated cash and credit transactions from `/user-balance/cash-transaction`.
  - **API Key Tools**:
    - `fyai_list_api_keys`: Lists user API keys with prefix/last4 status from `/api-keys`.
    - `fyai_create_api_key`: Issues a new key returning `rawKey` from `POST /api-key`.
    - `fyai_rotate_api_key`: Regenerates an existing key from `POST /api-key/{id}/regenerate`.
    - `fyai_revoke_api_key`: Revokes and deletes an API key from `DELETE /api-key/{id}`.
  - **MCP Directory Tools**:
    - `fyai_list_my_mcps`: Lists user-owned MCP entries from `/mcp`.
    - `fyai_get_mcp`: Fetches detailed MCP specification and endpoints by ID or slug from `/mcp/by-slug/{slug}`.
    - `fyai_create_mcp`: Registers a new MCP server in the directory via `POST /mcp`.
    - `fyai_update_mcp`: Updates MCP entry parameters via `PUT /mcp/{id}`.
    - `fyai_delete_mcp`: Removes an MCP server entry via `DELETE /mcp/{id}`.
  - **Product Directory Tools**:
    - `fyai_list_my_products`: Lists products owned by user from `/product`.
    - `fyai_find_products`: Searches public products by keyword/category from `GET /product/find`.
    - `fyai_get_product`: Retrieves complete product profile and stats from `/product/by-slug/{slug}`.
    - `fyai_create_product`: Adds a new AI product listing via `POST /product`.
    - `fyai_update_product`: Updates product metadata via `PATCH /product/{id}`.
    - `fyai_delete_product`: Deletes a product listing via `DELETE /product/{id}`.
  - **Content & AI Tools**:
    - `fyai_create_blog_post`: Publishes a community article via `POST /blog/posts`.
    - `fyai_ask_ai`: Queries the FindYourAI model gateway via `POST /ask-ai`.
    - `fyai_list_ai_models`: Lists available LLMs accessible through `GET /ask-ai/models`.
  - **Admin Oversight Tools** (Session/Key gated):
    - `fyai_admin_list_all_keys`: System-wide key enumeration via `GET /admin/api-keys`.
    - `fyai_admin_get_key_stats`: Platform API key volume metrics via `GET /admin/api-keys/stats`.
    - `fyai_admin_issue_key`: Issues an administrative key via `POST /admin/api-key`.
    - `fyai_admin_revoke_key`: Administrative revocation of any key via `DELETE /admin/api-key/{id}`.
    - `fyai_admin_search_users`: Administrative search for users via `GET /search/user`.
    - `fyai_admin_get_user`: Retrieves detailed user administrative profile via `GET /user/{id}`.
- Output Standards:
  - Every tool returns a structured `CallToolResult` with `content: [{ type: "text", text: JSON.stringify(result, null, 2) }]`.
  - Errors caught from `@findyourai/toolkit-core` format actionable error responses: `{ error: true, code: err.code, message: err.message, remediation: err.remediation }` with `isError: true`.

### Non-functional
- Zero stdio pollution: stdout is strictly reserved for JSON-RPC messages; all debug/logging uses `console.error` (stderr).
- Type-safe input schema definitions using `zod` for automatic JSON schema generation.
- Response latency overhead <10ms added by the MCP adapter layer.

## Architecture

```text
packages/mcp/src/
├── index.ts                   # Executable entrypoint (CLI flags: --stdio, --http, --port)
├── server.ts                  # McpServer factory & tool registry
├── transports/
│   ├── stdio.ts               # StdioServerTransport setup
│   └── http.ts                # Streamable HTTP server (Hono with SSE support)
├── auth/
│   ├── token-validator.ts     # Validates incoming HTTP bearer/apiKey with core client
│   └── context.ts             # Stores per-request auth context in AsyncLocalStorage
├── tools/
│   ├── index.ts               # Aggregates and registers all 22 verified tools
│   ├── health-tools.ts        # fyai_get_health
│   ├── profile-tools.ts       # fyai_get_my_profile, fyai_get_my_balance, fyai_list_my_transactions
│   ├── key-tools.ts           # fyai_list_api_keys, create, rotate, revoke
│   ├── mcp-tools.ts           # fyai_list_my_mcps, get, create, update, delete
│   ├── product-tools.ts       # fyai_list_my_products, fyai_find_products, get, create, update, delete
│   ├── content-tools.ts       # fyai_create_blog_post, fyai_ask_ai, fyai_list_ai_models
│   └── admin-tools.ts         # fyai_admin_* tools
└── utils/
    ├── tool-helper.ts         # Wraps core service calls and formats CallToolResult
    └── schema-helpers.ts      # Common Zod parameter patterns
```

## Related Code Files

- Create:
  - `packages/mcp/package.json`
  - `packages/mcp/tsconfig.json`
  - `packages/mcp/tsup.config.ts`
  - `packages/mcp/bin/mcp-server.ts`
  - `packages/mcp/src/index.ts`
  - `packages/mcp/src/server.ts`
  - `packages/mcp/src/transports/stdio.ts`
  - `packages/mcp/src/transports/http.ts`
  - `packages/mcp/src/auth/token-validator.ts`
  - `packages/mcp/src/auth/context.ts`
  - `packages/mcp/src/tools/index.ts`
  - `packages/mcp/src/tools/health-tools.ts`
  - `packages/mcp/src/tools/profile-tools.ts`
  - `packages/mcp/src/tools/key-tools.ts`
  - `packages/mcp/src/tools/mcp-tools.ts`
  - `packages/mcp/src/tools/product-tools.ts`
  - `packages/mcp/src/tools/content-tools.ts`
  - `packages/mcp/src/tools/admin-tools.ts`
  - `packages/mcp/src/utils/tool-helper.ts`
  - `packages/mcp/src/utils/schema-helpers.ts`
  - `packages/mcp/tests/protocol.test.ts`
  - `packages/mcp/tests/tools.test.ts`
  - `packages/mcp/tests/http-transport.test.ts`

## Implementation Steps

1. **Package Setup**:
   - Create `packages/mcp/package.json` with dependencies: `@modelcontextprotocol/sdk`, `zod`, `@findyourai/toolkit-core: workspace:*`, `hono` (for HTTP transport).
   - Configure `tsup.config.ts` targeting Node 18+ and bundling dependencies for fast zero-install execution (`npx @findyourai/mcp-server`).

2. **Core Server & Tool Factory**:
   - Implement `createFindYourAiMcpServer(options)` instantiating `Server` from `@modelcontextprotocol/sdk/server/index.js`.
   - Register request handlers for `ListToolsRequestSchema` and `CallToolRequestSchema`.

3. **Tool Registration Modules**:
   - Define each tool with explicit Zod schema, parameter descriptions, and execution handler delegating to `FindYourAiClient`.
   - Implement `tool-helper.ts` converting `FindYourAiError` into JSON error responses with `remediation` hints.

4. **stdio Transport Implementation**:
   - Wire `StdioServerTransport` connected to `process.stdin` and `process.stdout`.
   - Intercept global `console.log` during stdio mode to redirect accidental stdout writes to `console.error` (preventing JSON-RPC corruption).

5. **Streamable HTTP Transport Implementation**:
   - Implement lightweight Hono server mounting POST `/mcp` (session-based JSON-RPC) and GET `/mcp` (SSE stream).
   - Add auth middleware verifying Bearer tokens or API keys against `FindYourAiClient`.

## TDD Workflow & Test Matrix

```
Phase 3: MCP Server
├── Step A: Write tests for protocol handshake, tools/list, and tool execution
├── Step B: Add MCP test client seam (InMemoryTransport / MockTransport)
├── Step C: Implement server, tools, and transports
└── Step D: Verify protocol conformance, schema validity & error handling
```

### Step A: Tests Before
- Write `packages/mcp/tests/protocol.test.ts`:
  - Test: client connects over in-memory transport and receives server capabilities (`tools: {}`).
  - Test: client calls `tools/list` and receives all 22 registered tool definitions with complete input JSON schemas.
  - Test: client calls unknown tool and receives JSON-RPC error `-32601` (Method not found).
- Write `packages/mcp/tests/tools.test.ts`:
  - Test: `fyai_get_my_profile` executes core client `profile.get()` and returns formatted text JSON.
  - Test: `fyai_get_my_balance` extracts `{ balance: ... }` properly.
  - Test: `fyai_find_products` calls `product.find({ query })`.
  - Test: `fyai_create_api_key` passes `{ name: "agent-key" }` and returns `rawKey`.
  - Test: invalid parameters trigger Zod schema validation error before invoking network client.
  - Test: network 401 error returns formatted `isError: true` with remediation instructions.
- Write `packages/mcp/tests/http-transport.test.ts`:
  - Test: HTTP request to `/mcp` without auth header returns 401 Unauthorized.
  - Test: HTTP request with valid Bearer token executes tool and returns SSE or JSON response.

### Step B: Shared Infrastructure & Seams
- Implement test helper connecting an official `Client` to the `Server` using `InMemoryTransport`.
- Inject a mocked `FindYourAiClient` into the server instance.

### Step C: Implementation
- Implement source files in `packages/mcp/src/` until all protocol and tool test suites pass.

### Step D: Tests After & Regression Gate
- Run `pnpm --filter @findyourai/mcp-server test`.
- Run `pnpm --filter @findyourai/mcp-server build`.
- **Regression Gate**:
  ```bash
  pnpm --filter @findyourai/mcp-server test && pnpm --filter @findyourai/mcp-server typecheck && pnpm --filter @findyourai/mcp-server build
  ```

## Success Criteria

- [x] MCP Server initializes successfully over stdio.
- [x] `tools/list` returns all 22 verified tools matching the reconciled agentization map.
- [x] Every tool parameter schema validates cleanly with Zod.
- [x] Accidental stdout pollution is prevented via stderr redirection in stdio mode.
- [x] Streamable HTTP transport handles concurrent SSE connections with authentication.
- [x] 100% of unit and integration tests pass in `packages/mcp/tests/`.

## Risk Assessment

- **Risk**: stdio transport breaks due to random `console.log` from third-party libraries or child processes.
  - *Assumption*: AI desktop clients (Claude, Cursor) crash when non-JSON-RPC text appears on stdout.
  - *Signal of Breakage*: Claude Desktop logs "Unexpected token in JSON-RPC stream".
  - *Mitigation*: Override `process.stdout.write` in stdio mode to discard or redirect non-JSON-RPC text to `process.stderr`.
