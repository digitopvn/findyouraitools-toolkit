<!-- Mirrors AGENTS.md for Claude Code / Claude Desktop -->
# Claude Process Memory & Rules

Refer to [`AGENTS.md`](./AGENTS.md) for the authoritative rules, mandatory tooling (`pnpm@11.24.0`), build order gotchas, live OpenAPI contracts, and pre-flight gates.

## Quick Reference
- **Pre-flight Gate**: `pnpm build && pnpm typecheck && pnpm test`
- **Single Test**: `pnpm vitest run <path/to/test.ts>`
- **Core Coverage**: `pnpm vitest run --coverage packages/core`
- **Spec Ground Truth**: `plans/.../reports/openapi.json` (78 paths, base `https://findyourai.tools/api/v1`)
- **Key Envelope Rule**: `GET /user/balance` returns `{ balance: ... }` (not `{ data: ... }`)
- **Auth**: `X-API-KEY` or `Authorization: Bearer` (no OAuth2)
