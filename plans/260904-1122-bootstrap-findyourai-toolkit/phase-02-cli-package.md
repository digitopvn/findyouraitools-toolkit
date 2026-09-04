---
phase: 2
title: "CLI Package (@findyourai/cli / fyai)"
status: completed
priority: P1
effort: "1.5d"
dependencies: [1]
---

# Phase 2: CLI Package (@findyourai/cli / fyai)

## Overview
Develop the official, publishable NPM command-line tool (`@findyourai/cli`, executable as `fyai` and `findyourai`). Built with `commander`, this package enables developers and terminal operators to authenticate via API key, inspect balance and transactions, list and register MCPs and products, launch the local MCP server via `fyai mcp`, query AI models, and perform administrative oversight with formatted tables, spinners, and machine-readable `--json` output.

## Requirements

### Functional
- Executable binary installed via `npm install -g @findyourai/cli` or invoked via `npx @findyourai/cli` / `fyai`.
- Implement credential resolution chain:
  1. CLI flag `--api-key <key>` (ephemeral, highest precedence)
  2. Environment variables: `FYAI_API_KEY` or `FINDYOURAI_API_KEY`
  3. Local directory `.env` or `.env.local`
  4. Global config file: `~/.fyai/config.json` (created/updated via `fyai login`)
  *(OAuth 2.1 is out-of-scope per live spec; auth resolves API keys)*.
- Implement Core Commands:
  - `fyai login`: Interactive prompt for API key, validates against `/profile`, and stores key in `~/.fyai/config.json` with strict mode `0600`.
  - `fyai logout`: Safely purges stored credentials from `~/.fyai/config.json`.
  - `fyai whoami`: Displays current authenticated user, user ID, and account creation time.
  - `fyai balance`: Displays available balance/credits (extracting `{ balance: ... }`), with sub-command `fyai balance transactions` listing cash transactions.
  - `fyai doctor`: Diagnostic command testing network reachability to `https://findyourai.tools/api/v1/healthz`, validating API key validity, reporting masked key using server-provided `prefix` and `last4` (`<prefix>...<last4>`), and warning on missing credentials.
  - `fyai mcp`: Launches the `@findyourai/mcp-server` over stdio for instant desktop integration (Claude Desktop, Cursor).
  - `fyai keys`:
    - `fyai keys list`: Table of user API keys (name, prefix, last4, created, last used).
    - `fyai keys create --name <name>`: Generates a new API key and prints raw key once.
    - `fyai keys rotate <id>`: Regenerates an existing key and prints new raw key.
    - `fyai keys delete <id>`: Revokes an existing API key.
  - `fyai mcps`:
    - `fyai mcps list`: Lists user-owned or featured MCP servers.
    - `fyai mcps get <id|slug>`: Displays full MCP metadata, tags, upvotes, endpoints.
    - `fyai mcps create`: Interactive or flagged creation of an MCP entry.
    - `fyai mcps update <id>`: Modifies an MCP entry.
    - `fyai mcps delete <id>`: Removes an MCP entry.
    *(Note: `fyai mcps search` is omitted as no `/mcp/search` endpoint exists in the spec).*
  - `fyai products`:
    - `fyai products list`: Lists products with categories, view counts, and upvotes.
    - `fyai products find <query>`: Calls `/product/find` to search products.
    - `fyai products get <id|slug>`: Displays product details and related blog posts.
    - `fyai products create`: Registers a new AI product.
    - `fyai products update <id>`: Updates product metadata.
    - `fyai products delete <id>`: Removes a product.
  - `fyai blog`:
    - `fyai blog list`: Lists blog posts with category and publication status.
    - `fyai blog get <id|slug>`: Displays post markdown and metadata.
    - `fyai blog create`: Submits a new community article.
  - `fyai ask "<prompt>"`:
    - Direct invocation of `/ask-ai` from terminal with optional `--model <model>`, `--json`.
  - `fyai admin`:
    - `fyai admin keys list`: Lists all platform keys across users.
    - `fyai admin keys stats`: Shows system-wide API key volume and request metrics.
    - `fyai admin keys issue --user-id <id> --name <name>`: Issues an administrative key.
    - `fyai admin users search <query>`: Searches users across platform.
- Global Flags:
  - `--json`: Outputs raw, parseable JSON payload to stdout (suppressing banners, spinners, and ANSI formatting) for scripting and agent tool calls.
  - `--api-key <key>`: Overrides active credential for this single execution.
  - `--quiet` / `-q`: Suppresses non-essential log output.
  - `--verbose`: Emits request IDs, latency, and HTTP status codes to stderr.

### Non-functional
- Fast startup time (<150ms).
- Graceful exit codes: `0` (success), `1` (general error), `2` (invalid arguments/flags), `3` (authentication failure), `4` (rate limited).
- Clean separation of UI logic (`ora` spinners, `chalk` colors, `cli-table3`) from command business logic.

## Architecture

```text
packages/cli/src/
├── index.ts                   # Command registration & global error boundary
├── bin/
│   └── fyai.ts                # Shebang entrypoint (#!/usr/bin/env node)
├── auth/
│   ├── config-store.ts        # Reads and writes ~/.fyai/config.json with safe file permissions
│   ├── resolver.ts            # 4-step credential resolution pipeline
│   └── login-flow.ts          # Interactive prompt & token validation
├── commands/
│   ├── login.ts
│   ├── logout.ts
│   ├── whoami.ts
│   ├── balance.ts
│   ├── doctor.ts
│   ├── mcp-launcher.ts        # Spawns or boots MCP server in stdio mode
│   ├── keys.ts
│   ├── mcps.ts
│   ├── products.ts
│   ├── blog.ts
│   ├── ask.ts
│   └── admin/
│       ├── index.ts
│       ├── keys.ts
│       └── users.ts
├── ui/
│   ├── formatters.ts          # Table builders and date formatting
│   ├── logger.ts              # Stderr logger respecting --quiet and --verbose
│   ├── spinner.ts             # Ora wrapper disabled during --json or non-TTY
│   └── sanitize.ts            # Masking functions using server prefix/last4
└── utils/
    ├── client-factory.ts      # Instantiates FindYourAiClient with resolved credentials
    └── exit-codes.ts          # Standardized exit codes
```

## Related Code Files

- Create:
  - `packages/cli/package.json`
  - `packages/cli/tsconfig.json`
  - `packages/cli/tsup.config.ts`
  - `packages/cli/bin/fyai.ts`
  - `packages/cli/src/index.ts`
  - `packages/cli/src/auth/config-store.ts`
  - `packages/cli/src/auth/resolver.ts`
  - `packages/cli/src/auth/login-flow.ts`
  - `packages/cli/src/commands/login.ts`
  - `packages/cli/src/commands/logout.ts`
  - `packages/cli/src/commands/whoami.ts`
  - `packages/cli/src/commands/balance.ts`
  - `packages/cli/src/commands/doctor.ts`
  - `packages/cli/src/commands/mcp-launcher.ts`
  - `packages/cli/src/commands/keys.ts`
  - `packages/cli/src/commands/mcps.ts`
  - `packages/cli/src/commands/products.ts`
  - `packages/cli/src/commands/blog.ts`
  - `packages/cli/src/commands/ask.ts`
  - `packages/cli/src/commands/admin/index.ts`
  - `packages/cli/src/commands/admin/keys.ts`
  - `packages/cli/src/commands/admin/users.ts`
  - `packages/cli/src/ui/formatters.ts`
  - `packages/cli/src/ui/logger.ts`
  - `packages/cli/src/ui/spinner.ts`
  - `packages/cli/src/ui/sanitize.ts`
  - `packages/cli/src/utils/client-factory.ts`
  - `packages/cli/src/utils/exit-codes.ts`
  - `packages/cli/tests/resolver.test.ts`
  - `packages/cli/tests/commands.test.ts`
  - `packages/cli/tests/json-output.test.ts`

## Implementation Steps

1. **Package Setup**:
   - Create `packages/cli/package.json` specifying `bin: { "fyai": "bin/fyai.js", "findyourai": "bin/fyai.js" }`.
   - Add internal dependency: `"@findyourai/toolkit-core": "workspace:*"`.
   - Add dependencies: `commander`, `chalk`, `ora`, `cli-table3`, `dotenv`.
   - Configure `tsup.config.ts` targeting Node 18+.

2. **Credential Manager & Sanitizer**:
   - Implement `maskKey(prefix, last4)` displaying `${prefix || 'key'}...${last4 || '****'}` without assuming fixed length.
   - Implement `resolveCredentials(options)` checking CLI flags, environment variables, local `.env`, and `~/.fyai/config.json`.
   - Implement `ConfigStore` managing file creation, reading, and atomic writes with `0600` permissions.

3. **Client Factory & Command Registration**:
   - Create `createClientFromContext(cmd)` injecting resolved auth into `FindYourAiClient`.
   - Scaffold Commander program with global options (`--json`, `--api-key`, `--quiet`, `--verbose`).
   - Register all command modules, including `fyai mcp`.

4. **UI & Output Layer**:
   - Ensure every command checks `cmd.opts().json` before printing: if true, emit `console.log(JSON.stringify(data, null, 2))` and return immediately without spinners or tables.
   - Format human-readable tables for `keys`, `mcps`, `products`, and `balance` in TTY mode.

5. **Executable Verification**:
   - Create `bin/fyai.ts` importing `src/index.ts` and executing with `process.argv`.
   - Add `chmod +x` permissions and link locally via `pnpm --filter @findyourai/cli link`.

## TDD Workflow & Test Matrix

```
Phase 2: CLI Package
├── Step A: Write tests for argv parsing, credential hierarchy & JSON formatting
├── Step B: Add CLI test harness (exec/spawn runner, mocked stdout/stderr)
├── Step C: Implement commands, UI formatters, and auth resolution
└── Step D: Verify executable boots, exit codes & regression tests
```

### Step A: Tests Before
- Write `packages/cli/tests/resolver.test.ts`:
  - Test: `--api-key` flag overrides environment variable `FYAI_API_KEY`.
  - Test: environment variable overrides `~/.fyai/config.json`.
  - Test: returns null when no credentials exist without throwing.
  - Test: `maskKey` formats `prefix` and `last4` properly regardless of key length.
- Write `packages/cli/tests/commands.test.ts`:
  - Test: `fyai doctor` executes without credentials, checks `/healthz`, and reports missing key with remediation instructions.
  - Test: `fyai whoami` exits with code 3 (Auth Failure) when unauthenticated.
  - Test: `fyai keys list` calls `client.keys.list()` and formats table.
  - Test: `fyai products find query` calls `client.product.find({ query })`.
- Write `packages/cli/tests/json-output.test.ts`:
  - Test: `fyai keys list --json` outputs parseable JSON with zero ANSI escape codes or spinner artifacts on stdout.
  - Test: `fyai doctor --json` outputs `{ status: "ok", auth: { configured: true, keyMasked: "test...abcd" } }`.

### Step B: Shared Infrastructure & Seams
- Implement CLI test runner helper executing commands in-process by redirecting `stdout` and `stderr` streams.
- Mock `FindYourAiClient` inside CLI test context.

### Step C: Implementation
- Implement `packages/cli/src/` files until all test suites pass.

### Step D: Tests After & Regression Gate
- Run `pnpm --filter @findyourai/cli test`.
- Run `pnpm --filter @findyourai/cli build`.
- Smoke test built executable:
  ```bash
  node packages/cli/dist/bin/fyai.js --help
  node packages/cli/dist/bin/fyai.js doctor --json
  ```
- **Regression Gate**:
  ```bash
  pnpm --filter @findyourai/cli test && pnpm --filter @findyourai/cli typecheck && pnpm --filter @findyourai/cli build
  ```

## Success Criteria

- [x] `fyai --help` outputs all registered commands including `mcp` and global flags.
- [x] `fyai doctor --json` outputs valid diagnostic JSON against `/healthz`.
- [x] Passing `--api-key` executes authenticated calls successfully.
- [x] Passing `--json` guarantees zero non-JSON stdout pollution.
- [x] Stored credentials in `~/.fyai/config.json` use strict file permissions (`0600`).
- [x] All unit and command tests pass in `packages/cli/tests/`.

## Risk Assessment

- **Risk**: Terminal styling libraries (Chalk/Ora) pollute stdout when piped to tools like `jq` or agent runtimes.
  - *Assumption*: Users rely on `--json` for automation and piping.
  - *Signal of Breakage*: `fyai keys list --json | jq .` throws JSON parse error due to ANSI escape sequences.
  - *Mitigation*: Strictly gate Ora spinners and Chalk styling behind `!opts.json && process.stdout.isTTY`; enforce stdout inspection tests in CI.
