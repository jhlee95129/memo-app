# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY libs/common/package.json ./libs/common/
COPY apps/auth-service/package.json ./apps/auth-service/
RUN pnpm install --frozen-lockfile

COPY libs/common/ ./libs/common/
COPY apps/auth-service/ ./apps/auth-service/
RUN pnpm --filter @memo-app/common build && pnpm --filter auth-service build
RUN pnpm --filter auth-service deploy --legacy --prod /prod

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /prod/node_modules ./node_modules
COPY --from=builder /app/apps/auth-service/dist ./dist
EXPOSE 4001
CMD ["node", "dist/main.js"]
