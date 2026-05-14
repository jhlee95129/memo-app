# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY libs/common/package.json ./libs/common/
COPY apps/web/package.json ./apps/web/
RUN pnpm install --frozen-lockfile

COPY libs/common/ ./libs/common/
COPY apps/web/ ./apps/web/
RUN pnpm --filter @memo-app/common build && pnpm --filter web build

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
