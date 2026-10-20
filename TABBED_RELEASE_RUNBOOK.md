# Tabbed Pro — 14-Day Production Release Runbook & Checklist

**Release Target:** Tabbed v3 Extension + Tabbed Pro Web Platform  
**Scale Target:** 10,000+ Users  
**Cadence:** Controlled Staging → Canary Cohort → Public Launch

---

## 1. 14-Day Implementation Schedule & Milestones

```text
[Day 1-2] Baseline Freeze & Architecture Audit
    ├── Freeze feature additions
    ├── Generate .env configurations & audit Prisma schema
    └── Set up staging environment & Redis cluster

[Day 3-4] P0 Security Hardening
    ├── Replace dev auth fallback with real JWT cryptographic checks
    ├── Add Zod schemas to eliminate BOPLA / mass assignment
    └── Enforce user-scoped Prisma queries across all routes

[Day 5-6] Stripe Lifecycle & Sync Conflict Hardening
    ├── Test Stripe test-mode subscription, cancellation, failed renewals
    ├── Verify raw HMAC webhook verification
    └── Implement optimistic concurrency check on prompt sync

[Day 7-8] Load & Performance Testing
    ├── Run k6 load script (15–50 req/sec sustained, 3x burst)
    ├── Profile PostgreSQL connection pool and query latency
    └── Verify 429 rate limit behavior under burst load

[Day 9-10] Operations, Backups & Chrome Compliance
    ├── Configure Sentry / error tracking & Prometheus health alerts
    ├── Execute automated PostgreSQL backup & restore drill
    └── Verify Chrome Web Store privacy disclosures and manifest CSP

[Day 11-12] Staging Beta & Release Candidate Sign-off
    ├── Deploy Release Candidate (RC-1) to staging
    ├── Run end-to-end smoke tests (Auth -> Onboarding -> Optimizer -> Stripe)
    └── Review Go / No-Go decision matrix

[Day 13-14] Controlled Launch & Canary Monitoring
    ├── Enable production Stripe live keys
    ├── Publish extension update to Chrome Web Store
    └── Monitor error budgets, webhook deliveries, and DB pool
```

---

## 2. Production Deployment Sequence

### Step 1: Pre-Flight Environment Verification

```bash
# Verify environment variables exist and are populated
test -n "$DATABASE_URL" && echo "DATABASE_URL OK"
test -n "$JWT_SECRET" && echo "JWT_SECRET OK"
test -n "$STRIPE_SECRET_KEY" && echo "STRIPE_SECRET_KEY OK"
test -n "$STRIPE_WEBHOOK_SECRET" && echo "STRIPE_WEBHOOK_SECRET OK"
test -n "$OPENAI_API_KEY" || test -n "$ANTHROPIC_API_KEY" || test -n "$GEMINI_API_KEY"
```

### Step 2: Database Migration Drill

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Run schema migration (non-destructive)
npx prisma migrate deploy

# 3. Verify database health
node -e "const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); p.\$queryRaw\`SELECT 1\`.then(() => console.log('DB Connection Verified')).catch(console.error);"
```

### Step 3: Application Container Launch

```bash
# Build and deploy scaled cluster
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up -d

# Verify 3 application replicas running
docker compose ps
```

### Step 4: Health Check & Smoke Verification

```bash
# Verify Caddy edge reverse proxy and health endpoint
curl -f -k https://localhost/health || curl -f http://localhost:3001/health
```

---

## 3. Automated Smoke Test Script (`smoke-test.sh`)

```bash
#!/usr/bin/env bash
set -e
BASE_URL="http://localhost:3001"

echo "1. Checking API Health..."
curl -sf "${BASE_URL}/health" | grep '"status":"ok"' > /dev/null

echo "2. Checking Rate Limiter Response..."
for i in {1..5}; do
  curl -sf -o /dev/null "${BASE_URL}/api/me"
done

echo "3. Checking Stripe Config Status..."
curl -sf "${BASE_URL}/api/subscription/status?tier=pro" | grep '"tier":"pro"' > /dev/null

echo "4. Checking Prompt Scoring Fallback..."
curl -sf -X POST "${BASE_URL}/api/llm/analyze" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"write python code to sort array"}' | grep '"score"' > /dev/null

echo "✅ All core smoke tests passed!"
```

---

## 4. Go / No-Go Decision Gate

Every criteria must have verified proof before signing off launch:

| Release Gate                    | Verification Requirement                                      | Status           |
| :------------------------------ | :------------------------------------------------------------ | :--------------- |
| **BOLA / IDOR Protection**      | Cross-account prompt read/update blocked on all routes        | [ ] Pending Test |
| **Entitlement Integrity**       | Local storage modification cannot unlock Pro features         | [ ] Pending Test |
| **Stripe Webhook Verification** | HMAC signature rejects tampered / unsigned webhooks           | [ ] Pending Test |
| **Rate Limiter Defense**        | Exceeding 20 prompt optimizations/min returns HTTP 429        | [ ] Pending Test |
| **No Leaked Secrets**           | Production bundle inspected; zero API keys or secrets present | [ ] Verified     |
| **Legal Compliance**            | Privacy Policy & Terms of Service live and linked             | [x] Verified     |
| **DB Backup & Restore Drill**   | Database restored in sandbox environment successfully         | [ ] Pending Test |
| **Clean Build Verification**    | `npm run build` passes with zero type or bundling errors      | [x] Verified     |

---

## 5. Rollback & Disaster Recovery Protocol

If critical failure occurs post-launch:

### Scenario A: Unhandled Application Errors / Crash Loop

1. Roll back Docker containers to previous verified release tag:
   ```bash
   git checkout tags/v2.4.0
   docker compose up -d --build
   ```
2. Notify users via status banner.

### Scenario B: Database Schema Failure

1. Revert to pre-migration snapshot taken prior to `prisma migrate deploy`.
2. Do not run destructive column drops during live migration windows.

### Scenario C: Compromised API Secret

1. Rotate secret immediately in provider dashboard (Stripe / OpenAI / Anthropic / Google).
2. Update `.env` on production host.
3. Restart pods gracefully: `docker compose restart app`.
