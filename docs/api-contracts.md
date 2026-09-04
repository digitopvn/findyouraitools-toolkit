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

## 4. MCP Tool Catalog

Tool declarations and schemas are registered programmatically in [`packages/mcp/src/tools/index.ts`](../packages/mcp/src/tools/index.ts).

To inspect the registered tools:
```bash
grep -oE "name: 'fyai_[a-z_]+'" packages/mcp/src/tools/index.ts | sort -u
```
Or view the agent skill mapping in [`claude/skills/findyourai/SKILL.md`](../claude/skills/findyourai/SKILL.md).

All tools follow `snake_case` naming (`fyai_*`) and validate arguments via Zod before invoking core services.

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
