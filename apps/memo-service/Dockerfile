# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY libs/common/package.json ./libs/common/
COPY apps/memo-service/package.json ./apps/memo-service/
RUN pnpm install --frozen-lockfile

COPY libs/common/ ./libs/common/
COPY apps/memo-service/ ./apps/memo-service/
RUN pnpm --filter @memo-app/common build && pnpm --filter memo-service build
RUN pnpm --filter memo-service deploy --legacy --prod /prod

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /prod/node_modules ./node_modules
COPY --from=builder /app/apps/memo-service/dist ./dist
EXPOSE 4002
CMD ["node", "dist/main.js"]
