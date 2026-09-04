# System Architecture & Technical Design

This document details the architectural boundaries, design decisions, and system topology of the **FindYourAI.tools Toolkit** (`findyouraitools-toolkit`).

---

## 1. Monorepo Topology & Boundaries

The codebase is organized as a `pnpm` workspaces monorepo with strict dependency direction:

```text
               ┌───────────────────────────────┐
               │    @findyourai/toolkit-core   │
               │   (Zero Runtime Dependencies) │
               └───────────────┬───────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
  ┌────────────────────────┐      ┌────────────────────────┐
  │    @findyourai/cli     │      │ @findyourai/mcp-server │
  │   (Commander, Tables)  │      │  (MCP SDK, Stdio/HTTP) │
  └────────────────────────┘      └────────────────────────┘
```

### Package Responsibilities

1. **`@findyourai/toolkit-core` (`packages/core`)**:
   - **Role**: Pure TypeScript client wrapping the FindYourAI REST API.
   - **Zero Runtime Dependencies**: Relies exclusively on standard web primitives (`fetch`, `Headers`, `Request`, `Response`, `AbortController`).
   - **Universal Runtime**: Compiles to dual ESM/CJS outputs; runs identically in Node.js 22+, Bun, Cloudflare Workers, and browser contexts.
   - **Resilience**: Configurable exponential backoff retries with jitter for HTTP 429 and 5xx errors.

2. **`@findyourai/cli` (`packages/cli` - `fyai` / `findyourai`)**:
   - **Role**: Command-line developer tool for terminal operators and local scripts.
   - **Execution Contract**: When `--json` is supplied, stdout contains strictly valid JSON with zero ANSI formatting or spinner text.
   - **Exit Codes**: Standardized exit codes (`0` for success, `1` for general error, `2` for invalid arguments, `3` for auth failure, `4` for rate limit).

3. **`@findyourai/mcp-server` (`packages/mcp`)**:
   - **Role**: Model Context Protocol server exposing FindYourAI capabilities to AI assistants (Claude Desktop, Cursor, Windsurf, autonomous agents).
   - **Dual Transports**:
     - *stdio*: Default for desktop assistants; redirects stdout writes to stderr to protect JSON-RPC framing.
     - *Streamable HTTP*: Standalone HTTP server (Hono + `@hono/node-server`) mounting `/mcp` (SSE and JSON-RPC) and `/healthz`.

---

## 2. Credential Resolution Chain

The toolkit resolves authentication credentials using a 4-step pipeline:

```text
[1. CLI Flag: --api-key <key>]
         │ (not set)
         ▼
[2. Environment: FYAI_API_KEY or FINDYOURAI_API_KEY]
         │ (not set)
         ▼
[3. Local Files: .env.local -> .env]
         │ (not set)
         ▼
[4. Global Config: ~/.fyai/config.json (or $FYAI_CONFIG_DIR)]
```

- **Security Rule**: Secrets are never logged or echoed in plaintext.
- **Masking Contract**: Key masking relies exclusively on server-provided `prefix` and `last4` (`maskKey(prefix, last4)`), never arbitrary string slicing.

---

## 3. Deployment Architecture

### Cloudflare Workers Edge Deployment
- **Entrypoint**: `packages/mcp/deploy/worker.ts`
- **Configuration**: `packages/mcp/wrangler.toml` with `nodejs_compat` compatibility flag.
- **Characteristics**: Global cold starts <50ms; zero native Node.js binary bindings.

### Multi-Stage Distroless Docker Image
- **Dockerfile**: `packages/mcp/deploy/Dockerfile`
- **Builder**: `node:22-alpine` using `pnpm --filter @findyourai/mcp-server deploy --legacy --prod` to prune development dependencies.
- **Runner**: Lightweight alpine runner (<150MB total image size).
- **Process**: Runs `node dist/bin/mcp-server.js --http --port 3000`.

---

## 4. CI/CD & Provenance Architecture

- **Continuous Integration (`.github/workflows/ci.yml`)**:
  - Tests across Node.js `22.x` and `24.x`.
  - Enforces `pnpm build` before `pnpm typecheck` to resolve workspace package DTS references.
- **Continuous Deployment (`.github/workflows/release.yml`)**:
  - Tag-triggered release pipeline (`v*.*.*`).
  - **NPM Trusted Publishing (OIDC)**: Emits verifiable SLSA v1 provenance attestations without long-lived `NPM_TOKEN` secrets.
  - **GitHub Container Registry**: Builds multi-arch images (`linux/amd64`, `linux/arm64`) and pushes to `ghcr.io`.
  - **Automated GitHub Releases**: Creates releases with generated release notes linked to NPM artifacts.
