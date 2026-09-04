---
phase: 4
title: "Cloudflare Workers & Docker Packaging"
status: completed
priority: P2
effort: "1.0d"
dependencies: [1, 3]
---

# Phase 4: Cloudflare Workers & Docker Packaging

## Overview
Package the `@findyourai/mcp-server` for production cloud deployment across serverless edge infrastructure (Cloudflare Workers via `wrangler`) and containerized platforms (Docker, Fly.io, Railway, Kubernetes via optimized multi-stage Dockerfile and docker-compose).

## Requirements

### Functional
- Cloudflare Workers Edge Deployment:
  - Implement `packages/mcp/deploy/worker.ts` exposing the Streamable HTTP transport over standard web `fetch` handler.
  - Implement `packages/mcp/wrangler.toml` configuring worker name (`findyourai-mcp`), compatibility date, nodejs_compat flags, and environment secret bindings.
  - Support edge-compatible credential validation using Web Crypto and Web Standard `fetch`.
- Containerized Docker Deployment:
  - Create optimized multi-stage `packages/mcp/deploy/Dockerfile`:
    - Stage 1 (`builder`): Node.js 20 alpine, installs pnpm, builds core and mcp packages.
    - Stage 2 (`pruner`): Uses `pnpm --filter @findyourai/mcp-server deploy --prod /app/pruned` to isolate ONLY production runtime dependencies.
    - Stage 3 (`runner`): Minimal Node.js 20 alpine runner containing only the pruned bundle.
  - Expose default HTTP port `3000` with health check endpoint (`/healthz`).
  - Configure entrypoint booting Streamable HTTP server: `node dist/index.js --http --port 3000`.
- Local Development Docker Compose:
  - Provide `docker-compose.yml` allowing one-command boots for local testing (`docker compose up mcp-server`).
  - Read credentials from `.env` file automatically.

### Non-functional
- Final Docker image size <150MB (strictly enforced via pnpm deploy pruner).
- Edge worker bundle size <1MB uncompressed for fast global cold starts (<50ms).
- Zero Node.js native binary bindings (ensuring 100% portability across ARM64 and x86_64).

## Architecture

```text
packages/mcp/
├── deploy/
│   ├── worker.ts              # Cloudflare Workers fetch handler (Export default { fetch })
│   ├── Dockerfile             # Multi-stage Docker build with pnpm deploy prune
│   └── docker-compose.yml     # Local multi-container test harness
└── wrangler.toml              # Cloudflare configuration file
```

## Related Code Files

- Create:
  - `packages/mcp/deploy/worker.ts`
  - `packages/mcp/deploy/Dockerfile`
  - `packages/mcp/deploy/docker-compose.yml`
  - `packages/mcp/wrangler.toml`
  - `packages/mcp/tests/worker.test.ts`
- Modify:
  - `packages/mcp/package.json` (add scripts: `deploy:worker`, `build:docker`)

## Implementation Steps

1. **Cloudflare Worker Entrypoint**:
   - Implement `packages/mcp/deploy/worker.ts` using Hono to handle incoming requests at `/mcp` and `/healthz`.
   - Wire incoming request headers (`Authorization`, `X-API-KEY`) to initialize `FindYourAiClient`.
   - Write `packages/mcp/wrangler.toml` specifying `compatibility_flags = ["nodejs_compat"]` and `main = "deploy/worker.ts"`.

2. **Multi-Stage Dockerfile with Production Pruning**:
   - Author `packages/mcp/deploy/Dockerfile`:
     ```dockerfile
     # Build stage
     FROM node:20-alpine AS builder
     WORKDIR /app
     RUN corepack enable && corepack prepare pnpm@latest --activate
     COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
     COPY packages/core ./packages/core
     COPY packages/mcp ./packages/mcp
     RUN pnpm install --frozen-lockfile
     RUN pnpm --filter @findyourai/toolkit-core build
     RUN pnpm --filter @findyourai/mcp-server build
     RUN pnpm --filter @findyourai/mcp-server deploy --prod /app/pruned

     # Production runner stage (<150MB)
     FROM node:20-alpine AS runner
     WORKDIR /app
     ENV NODE_ENV=production
     COPY --from=builder /app/pruned ./
     EXPOSE 3000
     CMD ["node", "dist/index.js", "--http", "--port", "3000"]
     ```

3. **Docker Compose Harness**:
   - Author `packages/mcp/deploy/docker-compose.yml` defining `mcp-server` service with port forwarding `3000:3000` and `.env` secret injection.

## TDD Workflow & Test Matrix

```
Phase 4: Cloudflare Workers & Docker Packaging
├── Step A: Write tests for Worker fetch handler and Docker healthcheck
├── Step B: Add edge environment simulation seam
├── Step C: Implement worker.ts, wrangler.toml, and Dockerfile
└── Step D: Verify edge build & container execution
```

### Step A: Tests Before
- Write `packages/mcp/tests/worker.test.ts`:
  - Test: `worker.fetch(new Request('http://localhost/healthz'))` returns HTTP 200 `{ status: "ok" }`.
  - Test: `worker.fetch(new Request('http://localhost/mcp', { method: 'POST' }))` without auth returns HTTP 401.
  - Test: worker executes tool call with mocked `FindYourAiClient` on edge runtime.

### Step B: Shared Infrastructure & Seams
- Set up simulated Web Request/Response execution environment in Vitest.

### Step C: Implementation
- Implement `packages/mcp/deploy/worker.ts` and `wrangler.toml`.
- Author `packages/mcp/deploy/Dockerfile`.

### Step D: Tests After & Regression Gate
- Run `pnpm --filter @findyourai/mcp-server test`.
- Verify Docker build succeeds locally:
  ```bash
  docker build -f packages/mcp/deploy/Dockerfile -t findyourai-mcp-test .
  ```
- **Regression Gate**:
  ```bash
  pnpm --filter @findyourai/mcp-server test && pnpm --filter @findyourai/mcp-server build
  ```

## Success Criteria

- [x] `packages/mcp/deploy/worker.ts` bundles cleanly without Node native module errors.
- [x] `wrangler.toml` validates against Cloudflare Workers schema.
- [x] Docker image builds cleanly under 150MB and runs with healthy status.
- [x] HTTP endpoint responds to `/healthz` and `/mcp` inside Docker container.

## Risk Assessment

- **Risk**: Edge worker imports Node.js built-ins (`fs`, `child_process`) that fail in Cloudflare Workers runtime.
  - *Assumption*: `@findyourai/toolkit-core` and `@modelcontextprotocol/sdk` remain pure ESM without native Node dependencies.
  - *Signal of Breakage*: `wrangler deploy` fails with "Could not resolve 'fs'".
  - *Mitigation*: Enable `nodejs_compat` flag in `wrangler.toml`; ensure core SDK relies exclusively on web standards (`fetch`, `crypto.subtle`).
