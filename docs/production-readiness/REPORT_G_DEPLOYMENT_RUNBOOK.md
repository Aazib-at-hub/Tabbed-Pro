# Report G — Production Deployment Runbook

**Environment:** Production Linux VM / Container Host (Docker & Caddy)  
**Target Domain:** `tabbed.pro`  

---

## 1. Prerequisites Checklist

- [ ] Docker (v24.0+) and Docker Compose (v2.20+) installed.
- [ ] Fully qualified domain name pointing to server IP (`A` record for `tabbed.pro`).
- [ ] Ports 80 and 443 accessible from the public internet.
- [ ] Managed PostgreSQL database (Supabase, Neon, AWS RDS, or local container).
- [ ] Stripe API Keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`).
- [ ] LLM API Keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, or `GEMINI_API_KEY`).
- [ ] Secret generation: `JWT_SECRET=$(openssl rand -hex 32)`.

---

## 2. Environment Configuration (`.env.production`)

```bash
# Application Environment
NODE_ENV=production
PORT=3001
ALLOWED_ORIGIN=https://tabbed.pro

# Authentication
JWT_SECRET=<32-byte-hex-secret>

# Database (PostgreSQL with PgBouncer connection pool)
DATABASE_URL="postgresql://user:password@db.example.com:5432/tabbed_pro?pgbouncer=true&connection_limit=20"

# Redis Distributed Cache
REDIS_URL="redis://redis:6379"

# Stripe Billing
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AI Engine
OPENAI_API_KEY="sk-proj-..."
ANTHROPIC_API_KEY="sk-ant-..."
GEMINI_API_KEY="AIzaSy..."
```

---

## 3. Step-by-Step Deployment Procedure

### Step 1: Database Migration
```bash
# Run migrations from CI runner or bastion host
npx prisma migrate deploy
```

### Step 2: Build & Launch Docker Services
```bash
docker compose -f docker-compose.yml build --no-cache
docker compose -f docker-compose.yml up -d
```

### Step 3: Verification & Smoke Testing
```bash
# 1. Verify Caddy ingress and TLS
curl -I https://tabbed.pro/health

# 2. Check container replica health
docker compose ps

# 3. Test API response
curl -s https://tabbed.pro/api/templates | grep "ok"
```

---

## 4. Rollback Procedure

If a deployment fails health checks or exhibits elevated error rates:
```bash
# 1. Roll back to prior git commit
git checkout <PREVIOUS_STABLE_TAG>

# 2. Rebuild and restart containers
docker compose up -d --build
```
