# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY libs/common/package.json ./libs/common/
COPY apps/gateway/package.json ./apps/gateway/
RUN pnpm install --frozen-lockfile

COPY libs/common/ ./libs/common/
COPY apps/gateway/ ./apps/gateway/
RUN pnpm --filter @memo-app/common build && pnpm --filter gateway build
RUN pnpm --filter gateway deploy --legacy --prod /prod

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /prod/node_modules ./node_modules
COPY --from=builder /app/apps/gateway/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
