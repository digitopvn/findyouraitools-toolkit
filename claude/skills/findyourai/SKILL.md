---
name: findyourai
description: Discover AI agents, MCP servers, and AI products, manage API keys, check balances, and automate assets on FindYourAI.tools.
version: 0.1.0
---

# FindYourAI.tools Agent Skill

Comprehensive agent skill for interacting with the official FindYourAI.tools platform (`https://findyourai.tools`). Use this skill whenever managing AI agents, querying the model gateway, checking balances, rotating API keys, or discovering AI tools.

## When to Use

Activate this skill when the user requests to:
- "Find AI tools for transcription, marketing, or development"
- "Search or inspect the MCP server directory"
- "Register or update an MCP server or AI product"
- "Check FindYourAI balance, credits, or recent transactions"
- "Issue, rotate, or revoke FindYourAI API keys"
- "Prompt the FindYourAI AI model gateway"
- "Audit platform keys or search users (administrative)"

## Tool Mappings

| Natural Language Intent | Recommended Tool | Core CLI Alternative |
|---|---|---|
| Check service reachability | `fyai_get_health` | `fyai doctor` |
| View authenticated account profile | `fyai_get_my_profile` | `fyai whoami` |
| Check credits & transaction history | `fyai_get_my_balance`, `fyai_list_my_transactions` | `fyai balance` |
| List or create user API keys | `fyai_list_api_keys`, `fyai_create_api_key` | `fyai keys list`, `fyai keys create` |
| Rotate or revoke an API key | `fyai_rotate_api_key`, `fyai_revoke_api_key` | `fyai keys rotate`, `fyai keys delete` |
| Explore user MCP directory | `fyai_list_my_mcps`, `fyai_get_mcp` | `fyai mcps list`, `fyai mcps get` |
| Register or modify an MCP server | `fyai_create_mcp`, `fyai_update_mcp` | `fyai mcps create` |
| Find AI products in directory | `fyai_find_products`, `fyai_get_product` | `fyai products find`, `fyai products get` |
| Publish a community article | `fyai_create_blog_post` | `fyai blog create` |
| Prompt the AI model gateway | `fyai_ask_ai` | `fyai ask "<prompt>"` |
| Platform administrative auditing | `fyai_admin_list_all_keys`, `fyai_admin_get_key_stats` | `fyai admin keys list` |

## Workflow Playbooks

### 1. Diagnostic Verification
Always begin by verifying network reachability and credentials:
```text
Call: fyai_get_health()
If ok:
  Call: fyai_get_my_profile()
  Report user name and current credit balance via fyai_get_my_balance()
```

### 2. Finding & Inspecting AI Products
When a user asks for AI tools in a specific domain:
```text
Call: fyai_find_products({ query: "<domain>" })
Parse results: Return top AI products with taglines, upvotes, and slugs.
Optional: Call fyai_get_product({ slug: "<slug>" }) for deep specification.
```

### 3. API Key Rotation
When rotating a key:
```text
Call: fyai_list_api_keys() -> locate target ID.
Call: fyai_rotate_api_key({ id: "<id>" }) -> safely return new rawKey once.
Remind user: Store the raw key securely; it cannot be viewed again.
```
