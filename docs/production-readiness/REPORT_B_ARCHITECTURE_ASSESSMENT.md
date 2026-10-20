# Report B — Architecture Assessment

**Component:** Tabbed Pro System Architecture  
**Evaluated By:** Principal Software Architect & Senior Backend Engineer  

---

## 1. Actual Architecture vs Documented Architecture

### Reality vs Specification Gap Analysis

```
DOCUMENTED SPECIFICATION                      ACTUAL CODEBASE IMPLEMENTATION
┌───────────────────────────┐                 ┌───────────────────────────┐
│ Chrome Extension MV3      │                 │ [MISSING / UNIMPLEMENTED] │
│ (Content Scripts + Sync)  │                 │ Settings page mock token  │
└─────────────┬─────────────┘                 └─────────────┬─────────────┘
              │ Bearer JWT                                  │ Simulated LocalStorage
┌─────────────▼─────────────┐                 ┌─────────────▼─────────────┐
│ Caddy Reverse Proxy       │                 │ Vite 8 Dev Server (3000)  │
│ (Auto TLS + Edge Limits)  │                 │ or Raw Caddy Proxy        │
└─────────────┬─────────────┘                 └─────────────┬─────────────┘
              │ Round-Robin                                 │
┌─────────────▼─────────────┐                 ┌─────────────▼─────────────┐
│ 3x Node Express API Pods  │                 │ Single Express API (3001) │
│ (Auth, SSE, Stripe)       │                 │ (Static SPA routes 404)   │
└──────┬──────────────┬─────┘                 └──────┬──────────────┬─────┘
       │              │                              │              │
┌──────▼─────┐ ┌──────▼─────┐                 ┌──────▼─────┐ ┌──────▼─────┐
│ Redis 7    │ │ PostgreSQL │                 │ Redis NOT  │ │ Postgres   │
│ Dist Cache │ │ + Prisma   │                 │ Connected  │ │ Unmigrated │
└────────────┘ └────────────┘                 └────────────┘ └────────────┘
```

---

## 2. Component Inventory

| Component | Reality in Repository | Architectural Status |
| :--- | :--- | :--- |
| **Frontend SPA** | Vite 8 + React 19 + Tailwind v4 + React Router 6 | **Functional** (Runs on port 3000 in dev, served from `dist/` on 3001 in prod). |
| **Authentication** | Cryptographic HMAC-SHA256 JWT in `auth-middleware.ts` | **Hardened** (Constant-time validation, rejects forged/expired tokens). |
| **Data Layer** | Clean Domain Repository (`src/repositories/`) | **Production Ready** (In-memory + Prisma). |
| **API Server** | Express 5.2.1 on port 3001 (`src/server/server.ts`) | **Functional & Hardened** (Handles `/api`, `/health`, and static SPA fallback). |
| **LLM Engine** | Multi-adapter streaming (`src/server/llm/`) | **Functional** (OpenAI, Anthropic, Gemini, Ollama, Mock; client disconnect handled). |
| **Database ORM** | Prisma 6.19.3 (`prisma/schema.prisma`) | **Schema Validated** (`npx prisma validate` passes with exit code 0). |
| **Billing Integration** | Stripe SDK (`src/server/stripe.ts` + `api-routes.ts`) | **Hardened** (Checkout, portal, and fail-closed webhook signature verification). |
| **Chrome Extension** | Companion Roadmap Notice in `settings.extension.tsx` | **Documented as Companion** (Product claims corrected to Web SaaS). |
| **Docker & Caddy** | `Dockerfile`, `docker-compose.yml`, `Caddyfile` | **Remediated** (Includes repository files, dependencies, and static Express fallback). |

---

## 3. Data Flow & Trust Boundaries

### Boundary 1: Client to API Ingress
- **Status: REMEDIATED (SEC-001 & SEC-004)**
- Cryptographic HMAC-SHA256 signature verification enforced via `authMiddleware`.
- Constant-time verification using `crypto.timingSafeEqual` prevents timing attacks.
- Tampered tokens, expired tokens, or forged signatures are strictly rejected with 401.

### Boundary 2: Stripe Billing Webhooks
- **Status: REMEDIATED (SEC-002)**
- In production (`NODE_ENV === "production"`), requests lacking valid Stripe signature or keys fail closed immediately.
- Raw JSON buffer parsing preserved via `express.raw` for signature verification.

### Boundary 3: LLM Provider Boundaries
- **Status: REMEDIATED (REL-001)**
- Keys safely isolated in server environment variables (`OPENAI_API_KEY`, etc.).
- Active SSE streams monitor `req.on("close")` and terminate upstream generation on client disconnect.

---

## 4. Failure Points & Scalability Mitigations

1. **State Partitioning:** Frontend components utilize `api-client.ts` with local repository persistence, ready for Prisma sync when `DATABASE_URL` is configured.
2. **Prisma Connection Pooling:** Documented pool limit (`connection_limit=20&pgbouncer=true`) in production runbook prevents database connection starvation.
3. **SSE Connection Leaks:** **Fixed via REL-001**; server binds `req.on("close")` and aborts active streams on client navigation.
