# Tabbed Pro — Security Threat Model & OWASP API Audit

**Framework:** OWASP API Security Top 10 (2023) + Chrome Extension Security Model  
**Target:** Tabbed v3 Extension + Tabbed Pro Backend

---

## 1. Asset & Risk Classification

| Asset                         | Sensitivity                                      | Threat Scenarios                                                 | Primary Controls                                                    |
| :---------------------------- | :----------------------------------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------ |
| **User Prompt Vault**         | High (Confidential IP, proprietary instructions) | Unauthorized cross-account reads, data leaks, eavesdropping      | Scoped Prisma queries (`userId`), TLS 1.3, AES-256 rest encryption. |
| **User AI Profile**           | Medium (Workflow preferences, tech stack)        | Tampering with rules, injection of malicious system instructions | Schema validation (Zod), property allowlisting.                     |
| **Subscription Entitlements** | High (Direct financial loss)                     | Client claiming `isPro: true`, forged webhook, replayed webhook  | Server-side validation against Stripe API, HMAC webhook check.      |
| **LLM Provider API Keys**     | Critical (Expensive API quota drain)             | Secret leak in client bundle, extraction from network requests   | Keys stored only in server env; client receives only SSE streams.   |
| **Chrome Extension Storage**  | Medium (Cached prompts & tokens)                 | XSS on host pages, malicious extensions reading local storage    | Content script isolation, `chrome.storage.local` encrypted values.  |

---

## 2. OWASP API Top 10 Threat Analysis & Test Scenarios

### API1:2023 — Broken Object Level Authorization (BOLA / IDOR)

- **Risk:** Attacker changes `promptId` or `folderId` in request path or body to access another user's prompt.
- **Code Location:** `src/server/api-routes.ts`
- **Vulnerability Identified in Code:**
  - In `router.delete("/folders/:id")`: Prisma call must enforce `where: { id: req.params.id, userId }`.
  - In `router.get("/prompts")`: Prisma query must strictly enforce `whereClause.userId = authenticatedUserId`.
- **Test Case:**
  ```bash
  # Attempt to read prompt belonging to User B using User A's token
  curl -X GET "https://api.tabbed.pro/api/prompts/pmt_user_b" \
    -H "Authorization: Bearer <USER_A_TOKEN>"
  # Expected Response: 404 Not Found or 403 Forbidden
  ```

### API2:2023 — Broken Authentication

- **Risk:** Token forging, expired token acceptance, or development header bypass in production.
- **Code Location:** `src/server/auth-middleware.ts`
- **Vulnerability Identified in Code:**
  - Lines 61–69 currently allow `x-user-id` header when `NODE_ENV !== "production"`.
  - **Required Action:** Ensure build script enforces `NODE_ENV="production"` in Docker and disallows any header bypass.
  - Implement cryptographic signature verification with `jsonwebtoken` and `JWT_SECRET`.
- **Test Case:**
  ```bash
  # Test dev header injection in staging/production
  curl -X GET "https://api.tabbed.pro/api/me" \
    -H "x-user-id: usr_admin"
  # Expected Response: 401 Unauthorized
  ```

### API3:2023 — Broken Object Property Level Authorization (BOPLA)

- **Risk:** Attacker sends `subscriptionTier: "pro"` or `role: "admin"` inside a regular `PUT /api/user/profile` or workspace invite request.
- **Code Location:** `src/server/api-routes.ts`
- **Mitigation:**
  - Strict field allowlisting using Zod schemas. Disallow modifying `subscriptionTier`, `stripeCustomerId`, or `emailVerified` through user profile endpoints.
- **Test Case:**
  ```bash
  curl -X PUT "https://api.tabbed.pro/api/user/profile" \
    -H "Authorization: Bearer <TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"profession":"Developer","subscriptionTier":"pro"}'
  # Verify database: subscriptionTier remains "free"
  ```

### API4:2023 — Unrestricted Resource Consumption

- **Risk:** DoS or excessive cloud LLM billing through flood of prompt optimization requests.
- **Code Location:** `src/server/server.ts`
- **Controls:**
  - `globalLimiter`: 120 reqs/min per IP.
  - `llmLimiter`: 20 prompt optimizations/min per IP.
  - Express body limit: capped at `1mb` (`express.json({ limit: "1mb" })`).
- **Test Case:** Send 25 consecutive POST requests to `/api/llm/optimize/stream` within 60 seconds. Requests 21–25 must return `429 Too Many Requests`.

### API5:2023 — Broken Function Level Authorization

- **Risk:** Regular workspace member accessing `/api/workspaces/:id/standards` admin settings.
- **Code Location:** `src/server/api-routes.ts`
- **Mitigation:** Query `WorkspaceMember` table to verify caller has `role: "admin"` before allowing standards modification.

---

## 3. Stripe Billing & Webhook Threat Matrix

| Threat                         | Attack Vector                                            | Prevention Mechanism                                                                                   |
| :----------------------------- | :------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Forged Webhook**             | Attacker sends fake `checkout.session.completed` POST    | `stripe.webhooks.constructEvent(rawBody, sig, secret)` verifies HMAC-SHA256 signature.                 |
| **Webhook Replay**             | Attacker re-sends valid past webhook                     | Store `event.id` in Redis table with 24h TTL; reject already-processed event IDs.                      |
| **Out-of-Order Webhooks**      | `customer.subscription.deleted` arrives before `updated` | Inspect `event.created` timestamp and current subscription status before overwriting database records. |
| **Client-Side Tier Tampering** | Manipulating local storage `subscriptionTier: "pro"`     | Server ignores client tier claim; evaluates access dynamically against database / Stripe customer ID.  |

---

## 4. Chrome Extension v3 Security Boundaries

1. **Manifest Permissions Principle of Least Privilege:**
   - Only request `storage` and `activeTab`.
   - Disallow broad `all_urls` (`<all_urls>`). Restrict `host_permissions` strictly to target platforms:
     - `https://chatgpt.com/*`
     - `https://claude.ai/*`
     - `https://gemini.google.com/*`
     - `https://www.perplexity.ai/*`
2. **Content Security Policy (CSP):**
   - Enforce `script-src 'self'; object-src 'self'` in `manifest.json`.
   - Zero remote script loading. Zero `unsafe-eval`.
3. **Cross-Context Messaging:**
   - Use `chrome.runtime.onMessage.addListener`.
   - Validate `sender.id === chrome.runtime.id` to prevent malicious web pages on host tabs from sending commands into extension service worker.
4. **DOM Injection Prevention:**
   - Never use `innerHTML` or `dangerouslySetInnerHTML` with raw prompt text or score feedback received from network.
   - Use text nodes or sanitized React JSX nodes.
