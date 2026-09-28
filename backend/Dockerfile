# ─── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install native dependencies required for build
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code and build config
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Compile NestJS production distribution
RUN npm run build

# Prune dev dependencies for lean production container
RUN npm prune --production

# ─── Stage 2: Production Runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install runtime security packages
RUN apk add --no-cache curl tzdata

# Create dedicated non-root user
RUN addgroup -g 1001 -S commerza && \
    adduser -S commerza -u 1001 -G commerza

# Copy node_modules and built dist from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Create persistent storage directories for uploads
RUN mkdir -p uploads/public uploads/private && \
    chown -R commerza:commerza /app

USER commerza

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health/live || exit 1

CMD ["node", "dist/src/main.js"]
