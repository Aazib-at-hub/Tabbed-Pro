# ─────────────────────────────────────────────────────────────────────────────
# Tabbed Pro — Production Multi-stage Dockerfile (Optimized for 10k users)
# ─────────────────────────────────────────────────────────────────────────────

# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies with clean cache
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code and build production Vite bundle & Prisma client
COPY . .
RUN npx prisma generate
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Copy production assets and server dependencies
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/repositories ./src/repositories
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/src/server ./src/server

# Run as non-root user for container security
USER node

EXPOSE 3001

CMD ["npx", "tsx", "src/server/server.ts"]
