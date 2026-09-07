# ------------------------------------------------------------------------------
# 1. Base Stage: Install build dependencies & npm packages
# ------------------------------------------------------------------------------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ------------------------------------------------------------------------------
# 2. Builder Stage: Build Next.js application
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ------------------------------------------------------------------------------
# 3. Runner Stage: Production lightweight image
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_PATH=/app/data/dormitory.db

# Install runtime dependencies for SQLite
RUN apk add --no-cache libc6-compat

# Add non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory for persistent SQLite database
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Copy built artifacts from standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy better-sqlite3 node_modules to standalone if needed
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3

USER nextjs

EXPOSE 3000

VOLUME ["/app/data"]

CMD ["node", "server.js"]
