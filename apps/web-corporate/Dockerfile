FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb* ./
COPY apps/web-corporate/package.json ./apps/web-corporate/
COPY packages/ui-web/package.json ./packages/ui-web/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/verification/package.json ./packages/verification/
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN cd apps/web-corporate && bun run build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web-corporate/dist /usr/share/nginx/html
COPY apps/web-corporate/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
