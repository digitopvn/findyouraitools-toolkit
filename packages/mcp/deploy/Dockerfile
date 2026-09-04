# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/core ./packages/core
COPY packages/mcp ./packages/mcp
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @findyourai/toolkit-core build
RUN pnpm --filter @findyourai/mcp-server build
RUN pnpm --filter @findyourai/mcp-server deploy --legacy --prod /app/pruned

# Production runner stage (<150MB)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/pruned ./
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1
CMD ["node", "dist/bin/mcp-server.js", "--http", "--port", "3000"]
