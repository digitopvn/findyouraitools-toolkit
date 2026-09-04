# Agent Behavior Guide (`AGENTS.md`)

This file contains imperative rules governing developer and autonomous AI agent behavior across the `findyouraitools-toolkit` monorepo.

---

## 1. Mandatory Tooling & Environment

- **Package Manager**: Use `pnpm` exclusively (`pnpm@11.24.0`). Never invoke `npm` or `yarn` for workspace dependency management.
- **Node.js Runtime**: Node.js **>= 22.13** required (`pnpm@11.24.0` depends on built-in `node:sqlite`). In Docker and CI, use `node:22-alpine` or Node 22/24. Never downgrade to Node 18 or 20.
- **Package Manager Config**: Workspace packages use `packages/*`. The `allowBuilds` in `pnpm-workspace.yaml` authorizes `esbuild`.

---

## 2. Standard Commands

- **Build Whole Monorepo**: `pnpm build` (runs `tsup` on `core`, `cli`, and `mcp`).
- **Typecheck**: `pnpm typecheck` (runs root `tsc --noEmit` and all workspace packages).
- **Run Full Test Suite**: `pnpm test` (runs Vitest in run mode).
- **Run Single Test File**: `pnpm vitest run <path/to/test.ts>` (e.g. `pnpm vitest run packages/core/tests/client.test.ts`).
- **Measure Code Coverage**: `pnpm vitest run --coverage packages/core` (verifies $\ge 85\%$ statement coverage).
- **Definition of Done (Pre-flight Gate)**:
  ```bash
  pnpm build && pnpm typecheck && pnpm test
  ```

---

## 3. Monorepo Build Ordering Gotcha

- **Inter-Package Dependency**: Both `packages/cli` and `packages/mcp` import `@findyourai/toolkit-core`.
- **Clean Checkout Trap**: On a clean checkout, running `pnpm typecheck` before `pnpm build` will fail because `packages/core/dist/index.d.ts` has not been generated yet.
- **Rule**: Always execute `pnpm build` before `pnpm typecheck` in fresh environments or CI workflows.

---

## 4. API Contract Invariants & Non-Negotiables

- **Authoritative Spec**: The vendored OpenAPI 3.0.3 specification (`plans/.../reports/openapi.json`, 78 paths, base `https://findyourai.tools/api/v1`) is the ground truth.
- **Supported Authentication**:
  - `apiKey`: Header `X-API-KEY`
  - `bearerAuth`: Header `Authorization: Bearer <token>`
- **DENY-LIST (Do Not Implement / Do Not Invent)**:
  - **No OAuth 2.1 / PKCE**: The backend has zero OAuth endpoints. Do not plan, stub, or generate OAuth2 authorization flows.
  - **No MCP Search Endpoint**: There is no `/mcp/search` endpoint. Discovery uses `/mcp`, `/mcp/by-slug/{slug}`, `/mcp/all-slugs`, `/mcp/categories`. (Product search exists at `/product/find`).
  - **No Ask-AI Streaming Parser**: The `/ask-ai` endpoint returns standard JSON `{ status, data, messages }`. Do not implement SSE streaming unless live response payloads prove it.
- **Response Envelopes**:
  - `GET /user/balance` returns `{ "balance": { ... } }` — **never** `{ "data": ... }`.
  - `GET /profile` returns `{ "data": { ... } }`.
  - `POST /api-key` returns `{ "data": { ... }, "rawKey": "..." }`.
- **Schema-Opaque Types**: Endpoints with empty schemas (`/profile`, `/user/balance`, `/ask-ai`) are defined as `[key: string]: unknown`. Never assume unverified typed fields (`email`, `role`, `credits`).

---

## 5. Subsystem Conventions

### CLI (`packages/cli` - `fyai`)
- **JSON Output Contract**: When `--json` is supplied, stdout must contain **strictly parseable JSON**. Suppress all spinners (`ora`), ANSI formatting (`chalk`), and banner text.
- **Exit Codes**: Use constants from `src/utils/exit-codes.ts` (`SUCCESS: 0`, `GENERAL_ERROR: 1`, `INVALID_ARGUMENTS: 2`, `AUTH_FAILURE: 3`, `RATE_LIMITED: 4`).
- **Credential Storage**: Credentials saved in `~/.fyai/config.json` (or `FYAI_CONFIG_DIR`) must use strict `0600` file permissions.
- **Key Masking**: Use server-provided `prefix` and `last4` (`maskKey(prefix, last4)`). Never slice raw secret strings (`auth.slice(-4)` is banned).

### MCP Server (`packages/mcp` - `@findyourai/mcp-server`)
- **Zero Stdio Pollution**: In stdio transport mode, redirect `console.log` to `console.error` to avoid corrupting JSON-RPC streams.
- **Tool Schema Validation**: All tool arguments must be validated with Zod schemas in `src/tools/index.ts`.
- **Tool Error Responses**: Caught errors must return `{ error: true, code, message, remediation }` with `isError: true`.
- **HTTP Transport**: Support `initialize`, `tools/list`, `tools/call`, `ping`, and `GET /mcp` SSE stream. Return JSON-RPC code `-32001` on unauthorized requests.

### Docker & Containerization
- Use `node:22-alpine` in both builder and runner stages.
- When pruning in Docker builder, use `pnpm --filter @findyourai/mcp-server deploy --legacy --prod /app/pruned`.

### CI/CD & Releases
- Release pipeline uses **NPM Trusted Publishing (OIDC)** with `id-token: write` and `--provenance`. Never commit or inject long-lived `NPM_TOKEN` secrets.
- Version bumps must be committed before pushing tags (`v*.*.*`).
