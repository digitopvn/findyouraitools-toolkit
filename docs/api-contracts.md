# API Contracts & Specification Ground Truth

This document defines the verified API contract between the **FindYourAI.tools Toolkit** and the live FindYourAI backend (`https://findyourai.tools/api/v1`), based on the vendored OpenAPI 3.0.3 specification (`plans/.../reports/openapi.json`, 78 paths).

---

## 1. Authentication Schemes

The backend supports exactly two authentication mechanisms:

| Scheme | Type | Location | Header Name / Format | Purpose |
|---|---|---|---|---|
| **`apiKey`** | `apiKey` | Header | `X-API-KEY: <key>` | Machine-to-machine, CLI automation, agent tools |
| **`bearerAuth`** | `http` | Header | `Authorization: Bearer <token>` | User session tokens |

> **Out-of-Scope Rule**: OAuth 2.1, PKCE authorization flows, and dynamic token refresh endpoints do not exist in the backend specification and must not be implemented.

---

## 2. Response Envelopes & Gotchas

The backend tRPC/Next.js architecture uses specific response envelopes depending on the domain:

| Endpoint | Method | Envelope Key | Payload Shape |
|---|---|---|---|
| `/healthz` | GET | *(root object)* | `{ status: number, data?: unknown, messages?: string[] }` |
| `/profile` | GET | `data` | `{ data: { ... } }` |
| `/user/balance` | GET | **`balance`** | `{ balance: { ... } }` *(Never `{ data: ... }`)* |
| `/user-balance/cash-transaction` | GET | `data` | `{ data: CashTransaction[] }` |
| `/api-key` | POST | `data` + `rawKey` | `{ data: ApiKeyItem, rawKey: string }` |
| `/api-keys` | GET | `data` | `{ data: ApiKeyItem[] }` |
| `/product/find` | GET | `data` | `{ data: ProductItem[] }` |
| `/mcp/by-slug/{slug}` | GET | `data` | `{ data: McpItem }` |
| `/ask-ai` | POST | `data` + `messages` | `{ status: number, data: { ... }, messages?: string[] }` |

---

## 3. Schema Strategy: Rich vs Opaque

### Schema-Rich Operations
Endpoints with explicit inline JSON schema declarations in the OpenAPI spec:
- **API Keys**: `/api-key`, `/api-keys`, `/api-key/{id}`, `/api-key/{id}/regenerate`, `/admin/api-keys`, `/admin/api-keys/stats`.
- **Directory**: `/product`, `/product/find`, `/product/by-slug/{slug}`, `/mcp`, `/mcp/by-slug/{slug}`, `/mcp/all-slugs`.
- **Taxonomy**: `/product/categories`, `/product/tags`, `/mcp/categories`, `/mcp/tags`.
- **Content**: `/blog/posts`, `/blog/posts/by-slug/{slug}`.

### Schema-Opaque Operations
Endpoints where the OpenAPI spec declares an unconstrained object (`{ "type": "object", "properties": { "data": {} } }`):
- `GET /profile`: User profile shape (`UserProfile = Record<string, unknown>`).
- `GET /user/balance`: Balance shape (`UserBalance = Record<string, unknown>`).
- `POST /ask-ai`: Model gateway payload (`AskAiResponse`).
- `GET /search/user`: Admin user search result (`AdminUserSearchResult`).

*Rule*: Opaque endpoints are treated as `Record<string, unknown>` to prevent unverified assumptions (such as expecting required `email`, `role`, or `credits` properties) from breaking client code.

---

## 4. Verified MCP Tool Catalog

| Tool Name (`snake_case`) | Backend Path | Method | Description |
|---|---|---|---|
| `fyai_get_health` | `/healthz` | GET | Probe backend reachability |
| `fyai_get_my_profile` | `/profile` | GET | Get authenticated user identity |
| `fyai_get_my_balance` | `/user/balance` | GET | Get user credit balances (`balance` envelope) |
| `fyai_list_my_transactions` | `/user-balance/cash-transaction` | GET | List cash transaction history |
| `fyai_list_api_keys` | `/api-keys` | GET | List user API keys |
| `fyai_create_api_key` | `/api-key` | POST | Generate a new API key (returns `rawKey`) |
| `fyai_rotate_api_key` | `/api-key/{id}/regenerate` | POST | Regenerate an existing key |
| `fyai_revoke_api_key` | `/api-key/{id}` | DELETE | Revoke an API key |
| `fyai_list_my_mcps` | `/mcp` | GET | List user MCP directory entries |
| `fyai_get_mcp` | `/mcp/by-slug/{slug}` | GET | Get MCP specification by slug |
| `fyai_create_mcp` | `/mcp` | POST | Register an MCP server |
| `fyai_update_mcp` | `/mcp/{id}` | PUT | Update MCP server parameters |
| `fyai_delete_mcp` | `/mcp/{id}` | DELETE | Remove an MCP server |
| `fyai_list_my_products` | `/product` | GET | List user AI products |
| `fyai_find_products` | `/product/find` | GET | Search AI products by keyword |
| `fyai_get_product` | `/product/by-slug/{slug}` | GET | Get product details by slug |
| `fyai_create_product` | `/product` | POST | Register a new AI product |
| `fyai_update_product` | `/product/{id}` | PATCH | Update AI product metadata |
| `fyai_delete_product` | `/product/{id}` | DELETE | Remove an AI product |
| `fyai_create_blog_post` | `/blog/posts` | POST | Publish a community article |
| `fyai_ask_ai` | `/ask-ai` | POST | Query the AI model gateway |
| `fyai_list_ai_models` | `/ask-ai/models` | GET | List available gateway models |
| `fyai_admin_list_all_keys` | `/admin/api-keys` | GET | Admin: list all platform keys |
| `fyai_admin_get_key_stats` | `/admin/api-keys/stats` | GET | Admin: get API key usage metrics |
| `fyai_admin_issue_key` | `/admin/api-key` | POST | Admin: issue key to user |
| `fyai_admin_revoke_key` | `/admin/api-key/{id}` | DELETE | Admin: revoke any key |
| `fyai_admin_search_users` | `/search/user` | GET | Admin: search users by query |
| `fyai_admin_get_user` | `/user/{id}` | GET | Admin: get user details |

---

## 5. Error Hierarchy & Remediation

All client and tool errors inherit from `FindYourAiError`:

```text
FindYourAiError (base: status, code, details, remediation)
├── AuthenticationError (401/403: "Verify your API key via `fyai doctor` or pass `--api-key`")
├── NotFoundError       (404: "Check that resource ID or slug is correct")
├── RateLimitError      (429: "Rate limit exceeded. Please back off request frequency")
├── ValidationError     (400/422: "Correct input fields: [field issues]")
└── ServerError         (500/502/503: "FindYourAI server encountered an error")
```
