FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS builder
COPY . .
RUN bun install --frozen-lockfile
RUN cd apps/api && bun run db:generate
RUN cd apps/api && bun run build

FROM base AS runner
ENV NODE_ENV=production
# Preserve monorepo path structure so bun resolves workspace node_modules correctly
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
EXPOSE 3000
CMD ["bun", "apps/api/dist/main.js"]
