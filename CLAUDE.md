<!-- Mirrors AGENTS.md for Claude Code / Claude Desktop -->
# Claude Process Memory & Rules

Refer to [`AGENTS.md`](./AGENTS.md) for the authoritative rules, mandatory tooling (`pnpm@11.24.0`), build order gotchas, live OpenAPI contracts, and pre-flight gates.

## Quick Reference
- **Pre-flight Gate**: `pnpm build && pnpm typecheck && pnpm test`
- **Single Test**: `pnpm vitest run <path/to/test.ts>`
- **Coverage**: `pnpm vitest run --coverage packages/core`
- **Spec Ground Truth**: `plans/260904-1122-bootstrap-findyourai-toolkit/reports/openapi.json` (base `https://findyourai.tools/api/v1`)
- **Key Envelope Rule**: `GET /user/balance` returns `{ balance: ... }` (not `{ data: ... }`)
- **Auth**: `X-API-KEY` or `Authorization: Bearer` (no OAuth2)
