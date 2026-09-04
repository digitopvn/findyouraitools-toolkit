---
phase: 5
title: "Companion Agent Skills (npx skills, Claude Plugins, ChatGPT)"
status: completed
priority: P2
effort: "0.5d"
dependencies: [1, 2, 3]
---

# Phase 5: Companion Agent Skills (npx skills, Claude Plugins, ChatGPT)

## Overview
Author and validate cross-agent skills and manifests for the FindYourAI toolkit, enabling AI assistants across the ecosystem—including Claude Desktop, Cursor, Windsurf, ChatGPT Custom GPTs, and Codex agents—to automatically discover, prompt, and orchestrate verified FindYourAI tools with natural language trigger workflows.

## Requirements

### Functional
- Open Agent Skills Standard (`npx skills`):
  - Author `claude/skills/findyourai/SKILL.md` adhering to the open Agent Skills specification:
    - Clear frontmatter: `name`, `description`, `version`.
    - Natural language trigger phrases ("Find AI tools for transcription", "Explore MCP directory", "Register my AI product", "Issue FindYourAI API key", "Check my FindYourAI credit balance").
    - Actionable tool mappings connecting user prompts directly to verified `fyai_*` MCP tools and CLI commands.
    - Progressive disclosure guides explaining common multi-step agent workflows:
      1. Authentication & Diagnostic Verification (`fyai doctor`, `fyai_get_health`, `fyai_get_my_profile`).
      2. Resource Discovery (`fyai_list_my_mcps`, `fyai_get_mcp`, `fyai_find_products`).
      3. Resource Publishing (`fyai_create_mcp`, `fyai_create_product`).
      4. Administrative Auditing (`fyai_admin_get_key_stats`, `fyai_admin_list_all_keys`).
- Claude Plugins Marketplace Integration:
  - Author `.claude-plugin/plugin.json` providing plugin metadata, icons, contact info, and capability mapping.
- ChatGPT Actions / Custom GPTs Manifest:
  - Author `gpt/openapi.yaml` providing a clean, validated OpenAPI 3.1 action specification covering key agent tools:
    - Authentication via `apiKey` (header `X-API-KEY`) and `bearerAuth` (HTTP Bearer). *(Note: OAuth2 is dropped as it is absent from the live spec)*.
    - Exposing endpoints: `/profile`, `/user/balance`, `/mcp/by-slug/{slug}`, `/product/find`, `/product/by-slug/{slug}`, `/ask-ai`, `/api-keys`.

### Non-functional
- Zero syntax errors in Markdown frontmatter and YAML manifests.
- Validated with OpenAPI 3.1 linter.
- Clear error remediation instructions embedded in `SKILL.md` so autonomous agents self-heal when encountering auth or validation errors.

## Architecture

```text
findyouraitools-toolkit/
├── claude/
│   └── skills/
│       └── findyourai/
│           ├── SKILL.md       # Agent skill definition (triggers, tools, workflows)
│           └── icon.svg       # Official vector icon
├── .claude-plugin/
│   └── plugin.json            # Claude Plugins Marketplace manifest
└── gpt/
    └── openapi.yaml           # ChatGPT Actions OpenAPI 3.1 specification (apiKey & bearerAuth)
```

## Related Code Files

- Create:
  - `claude/skills/findyourai/SKILL.md`
  - `claude/skills/findyourai/icon.svg`
  - `.claude-plugin/plugin.json`
  - `gpt/openapi.yaml`
  - `tests/skills-validation.test.ts`

## Implementation Steps

1. **Agent Skill Specification (`SKILL.md`)**:
   - Write `claude/skills/findyourai/SKILL.md` with:
     - YAML frontmatter defining name, description, and tools list.
     - "When to Use" section listing specific developer intents.
     - "Workflow Playbooks":
       - Playbook A: Finding and inspecting MCP tools (`fyai_get_mcp`).
       - Playbook B: Publishing products or MCPs (`fyai_create_mcp`, `fyai_create_product`).
       - Playbook C: Rotating keys and resolving authentication failures (`fyai_rotate_api_key`).
     - Tool reference table mapping natural commands to verified MCP tool signatures.

2. **Claude Plugin Manifest (`plugin.json`)**:
   - Write `.claude-plugin/plugin.json` with schema version, publisher info (`Digitop`), and capability references pointing to `packages/mcp`.

3. **ChatGPT Action Manifest (`openapi.yaml`)**:
   - Extract verified subset from `reports/openapi.json` into `gpt/openapi.yaml`.
   - Update server URL to `https://findyourai.tools/api/v1`.
   - Configure security schemes strictly to `apiKey` (`X-API-KEY`) and `bearerAuth` (`Bearer`).

## TDD Workflow & Test Matrix

```
Phase 5: Companion Agent Skills
├── Step A: Write schema validation tests for YAML, JSON, and SKILL.md
├── Step B: Add schema validation harnesses (openapi-lint, yaml-parser)
├── Step C: Author SKILL.md, plugin.json, and openapi.yaml
└── Step D: Verify schema validity and npx skills compatibility
```

### Step A: Tests Before
- Write `tests/skills-validation.test.ts`:
  - Test: `claude/skills/findyourai/SKILL.md` has valid YAML frontmatter with `name` and `description`.
  - Test: `.claude-plugin/plugin.json` matches Claude Plugin schema specification.
  - Test: `gpt/openapi.yaml` parses as valid OpenAPI 3.1 without circular references and configures only `apiKey` and `bearerAuth`.
  - Test: all tool names in `SKILL.md` match registered tool names in `packages/mcp/src/tools/index.ts`.

### Step B: Shared Infrastructure & Seams
- Add dev dependencies: `yaml`, `zod`.
- Create parser script verifying tool name parity between code and documentation.

### Step C: Implementation
- Author `claude/skills/findyourai/SKILL.md`, `.claude-plugin/plugin.json`, and `gpt/openapi.yaml`.

### Step D: Tests After & Regression Gate
- Run `pnpm test tests/skills-validation.test.ts`.
- **Regression Gate**:
  ```bash
  pnpm test tests/skills-validation.test.ts
  ```

## Success Criteria

- [x] `SKILL.md` parses cleanly and conforms to Agent Skills specification.
- [x] Tool names documented in `SKILL.md` exactly match verified MCP tools registered in Phase 3.
- [x] `gpt/openapi.yaml` validates with zero OpenAPI syntax errors and contains no unverified oauth2 schemes.
- [x] `.claude-plugin/plugin.json` satisfies marketplace metadata standards.

## Risk Assessment

- **Risk**: Tool names or parameters drift between code (`packages/mcp`) and skill documentation (`SKILL.md`).
  - *Assumption*: AI assistants rely on exact parameter names to construct valid tool arguments.
  - *Signal of Breakage*: Agent fails to invoke tool or hallucinate non-existent parameter names.
  - *Mitigation*: Enforce automated test `tests/skills-validation.test.ts` comparing tool exports in `@findyourai/mcp-server` directly with `SKILL.md`.
