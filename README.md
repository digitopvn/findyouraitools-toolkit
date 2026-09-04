# FindYourAI.tools Toolkit

[![CI](https://github.com/digitopvn/findyouraitools-toolkit/actions/workflows/ci.yml/badge.svg)](https://github.com/digitopvn/findyouraitools-toolkit/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NPM Core](https://img.shields.io/npm/v/@findyourai/toolkit-core.svg)](https://www.npmjs.com/package/@findyourai/toolkit-core)

> Official developer & AI-agent toolkit for [FindYourAI.tools](https://findyourai.tools): zero-dependency TypeScript SDK, publishable CLI (`fyai`), Model Context Protocol (MCP) server, and companion Agent Skills.

---

## 🏛️ Monorepo Architecture

```text
findyouraitools-toolkit/
├── packages/
│   ├── core/                  # @findyourai/toolkit-core: Zero-dependency TS API Client & Schemas
│   ├── cli/                   # @findyourai/cli: Publishable NPM CLI (`fyai` / `findyourai`)
│   └── mcp/                   # @findyourai/mcp-server: MCP Server (stdio & Streamable HTTP)
├── claude/skills/findyourai/  # Companion Agent Skill (npx skills, Claude Plugins)
├── gpt/openapi.yaml           # ChatGPT Actions / Custom GPTs manifest
└── .github/workflows/         # Automated CI & Release pipelines
```

---

## 🚀 Quick Start

### 1. Developer CLI (`fyai`)

Install globally or execute via `npx`:

```bash
# Global install
npm install -g @findyourai/cli

# Authenticate with your API key
fyai login <your_api_key>

# Verify setup & reachability
fyai doctor

# Manage assets
fyai keys list
fyai products find -q "transcription"
fyai balance
```

### 2. Model Context Protocol (MCP) Integration

Connect FindYourAI to **Claude Desktop**, **Cursor**, or any MCP-compliant client.

#### Claude Desktop Configuration (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "findyourai": {
      "command": "npx",
      "args": ["-y", "@findyourai/mcp-server"],
      "env": {
        "FYAI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

#### Cursor Configuration (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "findyourai": {
      "command": "npx",
      "args": ["-y", "@findyourai/mcp-server"],
      "env": {
        "FYAI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 3. Companion Agent Skills

Install into autonomous agents or Claude Code via the open Agent Skills standard:

```bash
npx skills add digitopvn/findyouraitools-toolkit
```

### 4. Zero-Dependency TypeScript Core SDK

```bash
pnpm add @findyourai/toolkit-core
```

```typescript
import { FindYourAiClient } from '@findyourai/toolkit-core';

const client = new FindYourAiClient({
  apiKey: process.env.FYAI_API_KEY,
});

// Check balance
const balance = await client.user.getBalance();
console.log('Available credits:', balance.credits);

// Find AI products
const products = await client.product.find({ query: 'voice' });
console.log('Products:', products);
```

---

## 🔐 Authentication Resolution

The toolkit resolves credentials in order:
1. `--api-key <key>` CLI flag
2. `FYAI_API_KEY` or `FINDYOURAI_API_KEY` environment variable
3. Local `.env` / `.env.local`
4. Stored config `~/.fyai/config.json` (created with `fyai login`)

---

## 🛠️ Development & Contributing

```bash
# Clone & install
git clone https://github.com/digitopvn/findyouraitools-toolkit.git
cd findyouraitools-toolkit
pnpm install

# Run test suite
pnpm test

# Typecheck & Build
pnpm typecheck
pnpm build
```

---

## 📄 License

MIT © [Digitop](https://digitop.vn)
