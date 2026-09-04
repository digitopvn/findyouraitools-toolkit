---
phase: 1
title: "Monorepo Foundation & Core SDK (@findyourai/toolkit-core)"
status: completed
priority: P1
effort: "1.5d"
dependencies: []
---

# Phase 1: Monorepo Foundation & Core SDK (@findyourai/toolkit-core)

## Overview
Establish the pnpm workspaces monorepo infrastructure and build the zero-dependency TypeScript Core Client library (`@findyourai/toolkit-core`). This package encapsulates HTTP communication, credential injection (`X-API-KEY` and `Bearer`), error mapping with remediation hints, and full service wrappers for all 78 verified FindYourAI REST endpoints based on the vendored OpenAPI 3.0.3 spec (`reports/openapi.json`).

## Requirements

### Functional
- Initialize pnpm monorepo root with workspaces, TypeScript base configuration, shared linting, and unified test runner (Vitest).
- Implement `FindYourAiClient` supporting native `fetch`, configurable base URL (`https://findyourai.tools/api/v1`), custom timeouts (default 30s), custom fetch injection (for edge/worker runtimes), and exponential backoff retry on HTTP 429 and 5xx errors.
- Implement credential resolution and injection:
  - Header `X-API-KEY: <key>`
  - Header `Authorization: Bearer <token>`
  *(Note: OAuth 2.1, PKCE, and token refresh are out-of-scope as they do not exist in the live spec).*
- Implement strongly typed service classes wrapping all OpenAPI endpoints:
  - `KeyService`: `/api-key` (create), `/api-keys` (list), `/api-key/{id}` (delete, patch), `/api-key/{id}/regenerate` (post).
  - `McpService`: `/mcp` (list, create), `/mcp/by-slug/{slug}` (get), `/mcp/all-slugs` (get all slugs), `/mcp/{id}` (get, put, delete), `/mcp/{id}/upvote`, `/mcp/{id}/downvote`, `/mcp/{id}/increment-views`, `/mcp/categories`, `/mcp/tags`.
  - `ProductService`: `/product` (list, create), `/product/find` (search/filter), `/product/by-slug/{slug}` (get), `/product/all-products`, `/product/{id}` (get, patch, delete), `/product/{id}/upvote`, `/product/categories`, `/product/tags`.
  - `BlogService`: `/blog/posts` (list, create), `/blog/posts/by-slug/{slug}` (get), `/blog/posts/{id}` (get, patch, delete), `/blog/categories`, `/blog/tags`.
  - `UserService`: `/profile` (get current user, envelope `{ data }`), `/user/balance` (get credits, envelope `{ balance }`), `/user-balance/cash-transaction` (list transaction history).
  - `AiService`: `/ask-ai` (prompt execution with `messages`, `model`, `stream` parameters), `/ask-ai/models` (available model listing).
  - `AdminService`: `/admin/api-keys` (list all), `/admin/api-key` (issue), `/admin/api-key/{id}` (patch, delete, regenerate), `/admin/api-keys/stats` (usage stats), `/search/user` (user search).
- Implement actionable error hierarchy extending standard `Error`:
  - `FindYourAiError`: Base class with `status`, `code`, `details`, and `remediation`.
  - `AuthenticationError` (401/403): Missing or invalid API key / expired token.
  - `NotFoundError` (404): Resource missing or deleted.
  - `ValidationError` (400/422): Input validation failures with field-level issues extracted from OpenAPI `issues` array.
  - `RateLimitError` (429): Quota exceeded with `retryAfterMs`.
  - `ServerError` (500/502/503): Backend failure.
- Type System Strategy (Schema-Rich vs Schema-Opaque):
  - **Schema-Rich Types**: Derived from inline operation schemas in `openapi.json` for API keys, MCPs, products, blog, and transactions.
  - **Schema-Opaque Types**: Handwritten interfaces with golden contract fixtures for `/profile` (`UserProfile`), `/user/balance` (`UserBalance`), `/ask-ai` (`AskAiResponse`), and `/search/user` (`AdminUserSearchResult`).

### Non-functional
- Zero external runtime dependencies in `packages/core` (relying exclusively on web standard `fetch`, `Headers`, `Request`, `Response`).
- Strict TypeScript (`strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`).
- ESM and CommonJS dual distribution with TypeScript declaration maps (`.d.ts`, `.d.ts.map`) generated via `tsup`.
- Unit test coverage ≥85% for all client methods, error parsers, and services.

## Architecture

```text
packages/core/src/
├── index.ts                   # Re-exports: FindYourAiClient, services, errors, types
├── client.ts                  # FindYourAiClient (core request dispatcher, retries, headers)
├── auth/
│   ├── index.ts               # Auth types and resolver interfaces
│   ├── api-key-auth.ts        # X-API-KEY header handler
│   └── bearer-auth.ts         # Bearer token handler
├── errors/
│   ├── base.ts                # FindYourAiError with remediation property
│   ├── auth.ts                # AuthenticationError
│   ├── not-found.ts           # NotFoundError
│   ├── rate-limit.ts          # RateLimitError
│   ├── validation.ts          # ValidationError
│   └── parse-error.ts         # Error extractor parsing OpenAPI { message, code, issues }
├── services/
│   ├── base-service.ts        # BaseService with client reference and request helper
│   ├── key-service.ts         # API Key CRUD & regeneration
│   ├── mcp-service.ts         # MCP directory & taxonomy
│   ├── product-service.ts     # Product directory & taxonomy (/product/find)
│   ├── blog-service.ts        # Blog posts & categories
│   ├── user-service.ts        # Profile ({ data }), balance ({ balance }), cash transactions
│   ├── ai-service.ts          # Ask AI prompt & model listing
│   └── admin-service.ts       # Super admin keys & user search
└── types/
    ├── common.ts              # Pagination, generic API response wrappers
    ├── api-key.ts             # ApiKey, CreateApiKeyRequest, ApiKeyStats (schema-rich)
    ├── mcp.ts                 # McpItem, CreateMcpRequest, McpCategory (schema-rich)
    ├── product.ts             # ProductItem, CreateProductRequest (schema-rich)
    ├── blog.ts                # BlogPost, CreateBlogPostRequest (schema-rich)
    ├── user.ts                # UserProfile, UserBalance, CashTransaction (schema-opaque contracts)
    └── ai.ts                  # AskAiRequest, AskAiResponse, AiModel (schema-opaque contracts)
```

## Related Code Files

- Create:
  - `package.json` (root workspaces config)
  - `pnpm-workspace.yaml`
  - `tsconfig.base.json`
  - `vitest.config.ts`
  - `.gitignore`
  - `packages/core/package.json`
  - `packages/core/tsconfig.json`
  - `packages/core/tsup.config.ts`
  - `packages/core/src/index.ts`
  - `packages/core/src/client.ts`
  - `packages/core/src/auth/index.ts`
  - `packages/core/src/auth/api-key-auth.ts`
  - `packages/core/src/auth/bearer-auth.ts`
  - `packages/core/src/errors/base.ts`
  - `packages/core/src/errors/auth.ts`
  - `packages/core/src/errors/not-found.ts`
  - `packages/core/src/errors/rate-limit.ts`
  - `packages/core/src/errors/validation.ts`
  - `packages/core/src/errors/parse-error.ts`
  - `packages/core/src/services/base-service.ts`
  - `packages/core/src/services/key-service.ts`
  - `packages/core/src/services/mcp-service.ts`
  - `packages/core/src/services/product-service.ts`
  - `packages/core/src/services/blog-service.ts`
  - `packages/core/src/services/user-service.ts`
  - `packages/core/src/services/ai-service.ts`
  - `packages/core/src/services/admin-service.ts`
  - `packages/core/src/types/index.ts`
  - `packages/core/src/types/common.ts`
  - `packages/core/src/types/api-key.ts`
  - `packages/core/src/types/mcp.ts`
  - `packages/core/src/types/product.ts`
  - `packages/core/src/types/blog.ts`
  - `packages/core/src/types/user.ts`
  - `packages/core/src/types/ai.ts`
  - `packages/core/tests/client.test.ts`
  - `packages/core/tests/errors.test.ts`
  - `packages/core/tests/services.test.ts`
  - `packages/core/tests/fixtures/golden-responses.ts`

## Implementation Steps

1. **Vendor OpenAPI Spec & Monorepo Scaffolding**:
   - Verify `plans/.../reports/openapi.json` is vendored.
   - Write root `package.json` with scripts: `build`, `test`, `typecheck`, `lint`.
   - Write `pnpm-workspace.yaml` declaring `packages/*`.
   - Write `tsconfig.base.json` with modern Node/ESM module resolution and strict checks.
   - Write root `vitest.config.ts` configured for workspace packages.
   - Write `.gitignore` ignoring `node_modules`, `dist`, `.env*`, `coverage`, and `.fyai`.

2. **Core Package Configuration**:
   - Write `packages/core/package.json` with name `@findyourai/toolkit-core`, zero runtime dependencies, and dual exports (`import`, `require`, `types`).
   - Write `packages/core/tsconfig.json` extending `../../tsconfig.base.json`.
   - Write `packages/core/tsup.config.ts` building ESM (`dist/index.mjs`), CJS (`dist/index.cjs`), and DTS (`dist/index.d.ts`).

3. **Domain Types & Error Hierarchy**:
   - Author schema-rich types in `packages/core/src/types/` derived from operation schemas.
   - Author handwritten contracts in `packages/core/src/types/user.ts` and `ai.ts` for schema-opaque operations.
   - Implement `FindYourAiError` and specific subclass errors with status, code, and remediation suggestions.
   - Implement `parseApiError` extracting backend error responses `{ message, code, issues }`.

4. **HTTP Client & Authentication**:
   - Implement `FindYourAiClient` with configurable options: `baseUrl`, `apiKey`, `bearerToken`, `fetch`, `timeoutMs`, `maxRetries`.
   - Implement request interceptor injecting `X-API-KEY` or `Authorization: Bearer`.
   - Implement exponential backoff retry loop for 429 and 5xx status codes with Jitter.

5. **Service Layer Implementation**:
   - Wire each service (`KeyService`, `McpService`, `ProductService`, `BlogService`, `UserService`, `AiService`, `AdminService`) as property accessors on `FindYourAiClient`.
   - Specifically implement envelope handling: `/user/balance` extracts `res.balance`, `/profile` extracts `res.data`, `/api-key` extracts `{ data, rawKey }`.

## TDD Workflow & Test Matrix

```
Phase 1: Monorepo Foundation & Core SDK
├── Step A: Write contract tests with golden response fixtures
├── Step B: Add shared infrastructure & seams (mock fetch, client setup)
├── Step C: Implement client, errors, services, and types
└── Step D: Verify compile + tests + coverage
```

### Step A: Tests Before (Contract & Failure Tests)
- Write `packages/core/tests/client.test.ts`:
  - Test: should attach `X-API-KEY` header when configured.
  - Test: should attach `Authorization: Bearer` header when configured.
  - Test: should retry on 429 and 503 up to `maxRetries` times before throwing.
  - Test: should abort and throw `FindYourAiError` on request timeout.
- Write `packages/core/tests/errors.test.ts`:
  - Test: HTTP 401 response throws `AuthenticationError` with remediation message "Verify your API key via `fyai doctor` or pass `--api-key`".
  - Test: HTTP 404 response throws `NotFoundError`.
  - Test: HTTP 400 with `{ issues: [...] }` throws `ValidationError` with details array preserved.
- Write `packages/core/tests/services.test.ts`:
  - Test: `client.keys.create({ name: 'test' })` sends POST `/api-key` and extracts `rawKey` and `data`.
  - Test: `client.mcp.getBySlug('claude-mcp')` sends GET `/mcp/by-slug/claude-mcp`.
  - Test: `client.product.find({ query: 'agent' })` sends GET `/product/find`.
  - Test: `client.user.getBalance()` sends GET `/user/balance` and correctly extracts `{ balance: ... }` envelope (NOT `{ data: ... }`).
  - Test: `client.user.getProfile()` sends GET `/profile` and extracts `{ data: ... }` envelope.

### Step B: Shared Infrastructure & Seams
- Set up mock fetch utility (`vi.fn()`) simulating HTTP headers, latency, and status codes.
- Create `packages/core/tests/fixtures/golden-responses.ts` containing recorded JSON structures from the live API.

### Step C: Implementation
- Implement source files in `packages/core/src/` to turn all failing tests green.

### Step D: Tests After & Regression Gate
- Run `pnpm --filter @findyourai/toolkit-core test` to ensure all tests pass.
- Run `pnpm --filter @findyourai/toolkit-core build` to verify `tsup` creates valid CJS/ESM/DTS outputs.
- Verify test coverage is ≥85%.
- **Regression Gate**:
  ```bash
  pnpm --filter @findyourai/toolkit-core test && pnpm --filter @findyourai/toolkit-core typecheck && pnpm --filter @findyourai/toolkit-core build
  ```

## Success Criteria

- [x] `pnpm install` completes successfully across monorepo workspaces.
- [x] `packages/core` compiles cleanly with zero TypeScript errors.
- [x] `tsup` generates `dist/index.mjs`, `dist/index.cjs`, and `dist/index.d.ts`.
- [x] 100% of unit tests pass in `packages/core/tests/`.
- [x] Test coverage exceeds 85% statement coverage.
- [x] Zero runtime dependencies listed in `packages/core/package.json`.

## Risk Assessment

- **Risk**: Schema-opaque endpoints (`/profile`, `/user/balance`) return fields not accounted for in handwritten types.
  - *Assumption*: Backend tRPC endpoints return standard profile and balance shapes.
  - *Signal of Breakage*: Runtime type coercion error or missing properties in downstream CLI/MCP callers.
  - *Mitigation*: Protect opaque endpoints with golden contract fixtures in `packages/core/tests/fixtures/golden-responses.ts`; document fields as optional unless verified with live response payloads.
