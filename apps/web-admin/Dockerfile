FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS builder
COPY . .
RUN bun install --frozen-lockfile
RUN cd apps/web-admin && bun run build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web-admin/dist /usr/share/nginx/html
COPY apps/web-admin/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
