# FindYourAI.tools Toolkit — Reconciled Evidence Packet

> Ground truth technical contract and live OpenAPI reconciliation for `digitopvn/findyouraitools-toolkit`.
> Built against live OpenAPI 3.0.3 specification at `https://findyourai.tools/api/openapi.json` (78 paths, vendored at `reports/openapi.json`).

---

## 1. Live API Contract Specification

- **Specification Standard**: OpenAPI 3.0.3
- **Base Server URL**: `https://findyourai.tools/api/v1`
- **Total Paths**: 78
- **Authentication Schemes** (from `components.securitySchemes`):
  1. `apiKey`:
     - Type: `apiKey`
     - In: `header`
     - Name: `X-API-KEY`
  2. `bearerAuth`:
     - Type: `http`
     - Scheme: `bearer`
- **Error Response Structure** (from `components.responses.error`):
  ```json
  {
    "message": "Error description",
    "code": "ERROR_CODE",
    "issues": [
      {
        "message": "Field-specific validation issue"
      }
    ]
  }
  ```

---

## 2. Critical Reconciliation & Inventions Rejection

Comparing Issue #1 prose against the live OpenAPI spec reveals several items that must NOT be implemented or assumed:

| Issue #1 Claim | Live Spec Fact | Reconciled Decision |
|---|---|---|
| **OAuth 2.1 + PKCE & Token Refresh** | Spec contains ONLY `apiKey` (`X-API-KEY`) and `bearerAuth`. Zero OAuth2 endpoints or token refresh paths exist. | **REJECT OAuth 2.1 / PKCE**. Auth resolution supports CLI flag, ENV, local `.env`, and global config file (`~/.fyai/config.json`). OAuth marked unverified / out-of-scope. |
| **Auto-derived types from OpenAPI schemas** | Spec `components.schemas` is empty (`null`). All schemas are declared inline per operation. Several key endpoints return empty object definitions (`{}`). | **REJECT full codegen as sole truth**. Classify operations into Schema-Rich (derived from operation schemas) and Schema-Opaque (handwritten TypeScript interfaces with golden contract test fixtures). |
| **`/user/balance` Envelope** | Returns `{ "balance": {} }`, NOT `{ "data": ... }`. | **Client must deserialize `balance` property** specifically for balance calls. |
| **`fyai mcps search` / `fyai_search_mcps`** | No `/mcp/search` or `/mcp/find` endpoint exists in the spec. MCP directory exposes `/mcp`, `/mcp/by-slug/{slug}`, `/mcp/all-slugs`, `/mcp/categories`, and `/mcp/tags`. | **DROP `fyai mcps search` / `fyai_search_mcps`**. Provide `list` (with client-side filtering or category/tag queries), `get`, `create`, `update`, `delete`. |
| **Product Search** | Product domain has explicit `/product/find` endpoint. | **Map product search to `/product/find`**. |
| **`fyai_check_health`** | Health endpoint is `/healthz` (returns `{ status: "ok" }`). | **Expose `fyai doctor` in CLI and `/healthz` in Core Client**. Tool named `fyai_get_health` or directly call `/healthz`. |
| **API Key Format: `fyai_` and 32 characters** | Spec defines `prefix: string | null` and `last4: string | null` in key object. | **DO NOT assume prefix is `fyai_` or length is 32**. Masking must use `prefix` and `last4` returned by the server. |
| **`ask-ai` Streaming** | Endpoint `/ask-ai` accepts `stream: boolean` but responses are defined as standard JSON `{ status, data, messages }`. | **Implement request payload with `stream` option**, but do not construct an SSE parser until server SSE format is verified with live calls. |

---

## 3. Schema Classification

### Schema-Rich Operations
The following endpoints have detailed inline request/response property declarations in `openapi.json`:
- **API Keys**:
  - `POST /api-key`: `{ name: string (minLength 1, maxLength 100) }` → `{ data: { id, name, prefix, last4, userId, isActive, allowAdmin, createdAt, lastUsedAt }, rawKey: string }`
  - `GET /api-keys`: list of user keys
  - `DELETE /api-key/{id}`, `PATCH /api-key/{id}`
  - `POST /api-key/{id}/regenerate` → `{ data, rawKey }`
- **Admin API Keys**:
  - `GET /admin/api-keys`, `POST /admin/api-key`, `DELETE /admin/api-key/{id}`, `PATCH /admin/api-key/{id}`, `POST /admin/api-key/{id}/regenerate`, `GET /admin/api-keys/stats`
- **MCP Operations**:
  - `GET /mcp`, `POST /mcp`, `GET /mcp/by-slug/{slug}`, `GET /mcp/all-slugs`, `GET /mcp/{id}`, `PUT /mcp/{id}`, `DELETE /mcp/{id}`
  - `PATCH /mcp/{id}/upvote`, `PATCH /mcp/{id}/downvote`, `PATCH /mcp/{id}/increment-views`
  - `GET /mcp/categories`, `POST /mcp/category`, `GET /mcp/tags`, `POST /mcp/tag`
- **Product Operations**:
  - `GET /product`, `POST /product`, `GET /product/by-slug/{slug}`, `GET /product/find`, `GET /product/all-products`, `GET /product/{id}`, `PATCH /product/{id}`, `DELETE /product/{id}`
  - `PATCH /product/{id}/upvote`, `PATCH /product/{id}/downvote`, `PATCH /product/{id}/increment-views`
  - `GET /product/categories`, `POST /product/categories`, `GET /product/tags`, `POST /product/tags`
- **Blog Operations**:
  - `GET /blog/posts`, `POST /blog/posts`, `GET /blog/posts/by-slug/{slug}`, `GET /blog/posts/{id}`, `PATCH /blog/posts/{id}`, `DELETE /blog/posts/{id}`, `GET /blog/all-posts`
  - `GET /blog/categories`, `POST /blog/categories`, `GET /blog/tags`, `POST /blog/tags`
- **Transactions**:
  - `GET /user-balance/cash-transaction`, `GET /user-balance/cash-transaction/{id}`

### Schema-Opaque Operations
The following endpoints return generic/empty schemas (`{ "type": "object", "properties": { "data": {} } }`):
- `GET /profile` → `{ "data": {} }`: Handwritten `UserProfile` interface (`id`, `name`, `email`, `role`, `createdAt`). Guarded by contract golden test fixtures.
- `GET /user/balance` → `{ "balance": {} }`: Handwritten `UserBalance` interface (`credits`, `currency`, `updatedAt`). Envelope is `balance`.
- `POST /ask-ai` → `{ "status": number, "data": {}, "messages": string[] }`: Handwritten `AskAiResponse`.
- `GET /search/user` → `{ "data": {} }`: Handwritten `AdminUserSearchResult`.

---

## 4. Reconciled Agentization Map

| Domain | Verified Path | CLI Command | MCP Tool (`snake_case`) | Auth Required |
|---|---|---|---|---|
| **Health** | `GET /healthz` | `fyai doctor` | `fyai_get_health` | Public |
| **Profile** | `GET /profile` | `fyai whoami` | `fyai_get_my_profile` | `apiKey` or `bearerAuth` |
| **Balance** | `GET /user/balance` | `fyai balance` | `fyai_get_my_balance` | `apiKey` or `bearerAuth` |
| **Transactions** | `GET /user-balance/cash-transaction` | `fyai balance transactions` | `fyai_list_my_transactions` | `apiKey` or `bearerAuth` |
| **API Keys** | `GET /api-keys`<br>`POST /api-key`<br>`POST /api-key/{id}/regenerate`<br>`DELETE /api-key/{id}` | `fyai keys list`<br>`fyai keys create`<br>`fyai keys rotate`<br>`fyai keys delete` | `fyai_list_api_keys`<br>`fyai_create_api_key`<br>`fyai_rotate_api_key`<br>`fyai_revoke_api_key` | `apiKey` or `bearerAuth` |
| **MCP Directory** | `GET /mcp`<br>`GET /mcp/by-slug/{slug}`<br>`POST /mcp`<br>`PUT /mcp/{id}`<br>`DELETE /mcp/{id}`<br>`GET /mcp/all-slugs` | `fyai mcps list`<br>`fyai mcps get`<br>`fyai mcps create`<br>`fyai mcps update`<br>`fyai mcps delete` | `fyai_list_my_mcps`<br>`fyai_get_mcp`<br>`fyai_create_mcp`<br>`fyai_update_mcp`<br>`fyai_delete_mcp` | Mixed (GET public, mutations auth) |
| **Product Directory** | `GET /product`<br>`GET /product/find`<br>`GET /product/by-slug/{slug}`<br>`POST /product`<br>`PATCH /product/{id}`<br>`DELETE /product/{id}` | `fyai products list`<br>`fyai products find`<br>`fyai products get`<br>`fyai products create`<br>`fyai products update`<br>`fyai products delete` | `fyai_list_my_products`<br>`fyai_find_products`<br>`fyai_get_product`<br>`fyai_create_product`<br>`fyai_update_product`<br>`fyai_delete_product` | Mixed (GET public, mutations auth) |
| **Blog & Content** | `GET /blog/posts`<br>`GET /blog/posts/by-slug/{slug}`<br>`POST /blog/posts`<br>`PATCH /blog/posts/{id}`<br>`DELETE /blog/posts/{id}` | `fyai blog list`<br>`fyai blog get`<br>`fyai blog create` | `fyai_list_blog_posts`<br>`fyai_get_blog_post`<br>`fyai_create_blog_post` | Mixed |
| **Ask AI** | `POST /ask-ai`<br>`GET /ask-ai/models` | `fyai ask "<prompt>"` | `fyai_ask_ai`<br>`fyai_list_ai_models` | `apiKey` or `bearerAuth` |
| **Admin Keys** | `GET /admin/api-keys`<br>`GET /admin/api-keys/stats`<br>`POST /admin/api-key`<br>`DELETE /admin/api-key/{id}` | `fyai admin keys list`<br>`fyai admin keys stats`<br>`fyai admin keys issue`<br>`fyai admin keys revoke` | `fyai_admin_list_all_keys`<br>`fyai_admin_get_key_stats`<br>`fyai_admin_issue_key`<br>`fyai_admin_revoke_key` | Admin Auth |
| **Admin Users** | `GET /search/user`<br>`GET /user/{id}` | `fyai admin users search`<br>`fyai admin users get` | `fyai_admin_search_users`<br>`fyai_admin_get_user` | Admin Auth |
