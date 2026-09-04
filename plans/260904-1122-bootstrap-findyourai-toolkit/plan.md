---
title: "Bootstrap FindYourAI.tools Toolkit (MCP, CLI, Skills)"
description: "Architecture, engineering roadmap, and TDD-driven implementation plan for the official FindYourAI.tools developer and AI-agent toolkit."
status: completed
priority: P1
effort: "6-8 days"
tags:
  - bootstrap
  - mcp
  - cli
  - core-sdk
  - agent-skills
  - tdd
  - pnpm-workspaces
created: 2026-09-04
---

# Bootstrap FindYourAI.tools Toolkit (MCP, CLI, Skills)

## Overview

This implementation plan defines the complete bootstrap and delivery roadmap for **FindYourAI.tools Toolkit** (`digitopvn/findyouraitools-toolkit`) based on [Issue #1](https://github.com/digitopvn/findyouraitools-toolkit/issues/1) reconciled against the live OpenAPI 3.0.3 specification (`https://findyourai.tools/api/openapi.json`, 78 paths vendored at `reports/openapi.json`).

The repository provides a cross-platform, multi-runtime surface exposing verified FindYourAI REST endpoints to developers, autonomous AI agents (Claude, Cursor, Windsurf, ChatGPT, Codex), and terminal users. The architecture adopts a pnpm workspaces monorepo separating zero-dependency core logic, CLI binaries, MCP server transports, companion skills, and CI/CD pipelines.

## Architectural Principles & Spec Ground Truth

1. **Reconciled Specification Ground Truth**:
   - The vendored OpenAPI 3.0.3 spec (`reports/openapi.json`, 78 paths, base `https://findyourai.tools/api/v1`) is the authoritative source for endpoint paths, HTTP verbs, and headers.
   - **Supported Auth Schemes**: `apiKey` (Header `X-API-KEY`) and `bearerAuth` (HTTP `Authorization: Bearer <token>`).
   - **Out-of-Scope / Dropped Inventions**: OAuth 2.1, PKCE, dynamic token refresh, and MCP directory search (no `/mcp` search endpoint exists; use `/mcp`, `/mcp/by-slug/{slug}`, `/mcp/all-slugs`). Product search maps to `/product/find`.

2. **Strict Dependency Layering**:
   - `packages/core` (`@findyourai/toolkit-core`): Zero runtime dependencies, pure TypeScript HTTP client targeting standard fetch API (Node.js 18+, Bun, Cloudflare Workers, browsers).
   - `packages/cli` (`@findyourai/cli` / `fyai`): Publishes executable CLI with Commander, key management, table/spinner formatting, and machine-readable `--json` output. Launches MCP server via `fyai mcp`.
   - `packages/mcp` (`@findyourai/mcp-server`): Model Context Protocol server exposing user and admin tools via stdio and Streamable HTTP.
   - `claude/skills/findyourai`, `gpt/openapi.yaml`: Standards-compliant agent skill manifests using verified paths and authentication schemes.

3. **Schema-Rich vs Schema-Opaque Strategy**:
   - `components.schemas` in the live spec is empty; schemas are declared inline per operation.
   - **Schema-Rich Endpoints** (API Keys, Products, MCPs, Blog, Transactions): Types derived directly from inline operation schemas.
   - **Schema-Opaque Endpoints** (`/profile` -> `{ data: {} }`, `/user/balance` -> `{ balance: {} }`, `/ask-ai` -> `{ data: {} }`): Handwritten TypeScript interfaces protected by contract test fixtures. Note: `/user/balance` returns `{ balance: ... }`, NOT `{ data: ... }`.

4. **Test-Driven Development (TDD)**:
   - Each phase embeds strict Tests-Before (contract test definitions with mock HTTP responses), Implementation/Seams, Tests-After (boundary and negative cases), and Regression Gates (`pnpm build`, `pnpm test`, `pnpm typecheck`).

## Monorepo Layout & Packaging

```text
findyouraitools-toolkit/
├── packages/
│   ├── core/                  # @findyourai/toolkit-core: Zero-dependency TS API Client & Schemas
│   │   ├── src/
│   │   │   ├── index.ts       # Public exports (Client, Services, Types, Errors)
│   │   │   ├── client.ts      # FindYourAiClient (fetch, retries, headers, timeout)
│   │   │   ├── auth/          # Credential resolvers (X-API-KEY, Bearer)
│   │   │   ├── services/      # Service wrappers (Key, Mcp, Product, Blog, User, Ai, Admin)
│   │   │   ├── types/         # Domain interfaces (derived + handwritten contracts)
│   │   │   └── errors/        # Actionable error hierarchy (FindYourAiError, etc.)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts     # ESM + CJS + DTS bundle
│   │
│   ├── cli/                   # @findyourai/cli: Publishable NPM CLI (`fyai` / `findyourai`)
│   │   ├── bin/fyai.ts        # Executable entrypoint (#!/usr/bin/env node)
│   │   ├── src/
│   │   │   ├── index.ts       # Program registration
│   │   │   ├── commands/      # keys, admin, mcps, products, blog, balance, ask, doctor, whoami, mcp
│   │   │   ├── auth/          # Token storage (~/.fyai/config.json, env)
│   │   │   └── ui/            # Formatted tables, spinners, sanitized output
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
│   │
│   └── mcp/                   # @findyourai/mcp-server: Model Context Protocol Server
│       ├── src/
│       │   ├── index.ts       # CLI / stdio launcher
│       │   ├── server.ts      # McpServer instance & tool registrations
│       │   ├── transports/    # stdio, Streamable HTTP (Hono with SSE fallback)
│       │   ├── auth/          # Bearer & API key validation for remote transport
│       │   └── tools/         # User tools (profile, keys, mcps, products, blog, ask) & admin tools
│       ├── deploy/            # Cloudflare Worker entry (`worker.ts`) & Dockerfile
│       ├── wrangler.toml      # Edge deployment config
│       ├── package.json
│       └── tsconfig.json
│
├── claude/
│   └── skills/
│       └── findyourai/        # Companion Agent Skill (npx skills, Claude Plugins Marketplace)
│           ├── SKILL.md       # Trigger rules, tool mappings, workflow guides
│           └── plugin.json    # Claude Plugins Marketplace metadata
│
├── gpt/
│   └── openapi.yaml           # ChatGPT Action / Custom GPTs manifest (apiKey & bearerAuth only)
│
├── .github/
│   └── workflows/
│       ├── ci.yml             # Lint, typecheck, unit and integration tests
│       └── release.yml        # NPM publish (provenance), Docker build, Cloudflare deploy
│
├── package.json               # Workspaces root
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── vitest.config.ts
└── README.md
```

## Credential Resolution Chain

To provide zero-friction developer experience while maintaining strict secret hygiene:

1. **CLI Flag**: `--api-key <key>` (ephemeral, highest priority)
2. **Environment Variable**: `FYAI_API_KEY` or `FINDYOURAI_API_KEY`
3. **Local Project File**: `.env` or `.env.local` in current working directory
4. **User Global Config**: `~/.fyai/config.json` (stored after `fyai login`)

*Rule*: Secrets are never printed in clear text in logs or terminal; `fyai doctor` reports only server-provided prefix and last4 (`prefix...last4`).

## Phases Roadmap

| # | Phase | Status | Priority | Effort | Deliverable |
|---|-------|--------|----------|--------|-------------|
| 1 | [Monorepo Foundation & Core SDK](./phase-01-monorepo-foundation-and-core-sdk.md) | Completed | P1 | 1.5d | Working pnpm monorepo, zero-dependency `@findyourai/toolkit-core`, mock HTTP test suite (≥85% coverage). |
| 2 | [CLI Package (`@findyourai/cli` / `fyai`)](./phase-02-cli-package.md) | Completed | P1 | 1.5d | Publishable NPM binary `fyai` with Commander, credentials, commands, `--json` formatting, integration tests. |
| 3 | [MCP Server (`@findyourai/mcp-server`)](./phase-03-mcp-server.md) | Completed | P1 | 1.5d | stdio & Streamable HTTP MCP server, 22 verified agent tools, schema validation, MCP protocol test suite. |
| 4 | [Cloudflare Workers & Docker Packaging](./phase-04-cloudflare-workers-and-docker-packaging.md) | Completed | P2 | 1.0d | Edge worker (`wrangler.toml`), multi-stage Dockerfile (<150MB via production prune), `docker-compose.yml`. |
| 5 | [Companion Agent Skills](./phase-05-companion-agent-skills.md) | Completed | P2 | 0.5d | `claude/skills/findyourai/SKILL.md`, `plugin.json`, `gpt/openapi.yaml` (apiKey/bearerAuth), `npx skills` verification. |
| 6 | [CI/CD & Automated Test Suite](./phase-06-ci-cd-and-automated-test-suite.md) | Completed | P1 | 1.0d | GitHub Actions CI matrix (Node 18/20/22), release workflow with NPM provenance, top-level README. |

## Success Criteria

- [x] All 3 packages build cleanly via `pnpm build` (`tsup` generating ESM, CJS, and `.d.ts`).
- [x] Root `pnpm test` runs all package tests with Vitest achieving ≥85% statement coverage on `@findyourai/toolkit-core`.
- [x] Root `pnpm typecheck` (`tsc --noEmit`) passes with zero TypeScript errors under strict mode.
- [x] CLI executable `fyai --help` and `fyai doctor` run without errors and respect `--json`.
- [x] MCP Server initializes over stdio protocol and responds to `tools/list` and `tools/call`.
- [x] `claude/skills/findyourai/SKILL.md` conforms to agent skills standard and validates against `plugin.json`.
- [x] GitHub Actions CI workflow passes on all targets.

<!-- slug: bootstrap-findyourai-toolkit -->
