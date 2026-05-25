# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all workspace dependencies
bun install

# Run all apps in dev mode
bun dev

# Run a specific app
cd apps/api && bun dev
cd apps/web-admin && bun dev
cd apps/web-corporate && bun dev
cd apps/web-employee && bun dev
cd apps/mobile-consumer && bun start
cd apps/mobile-agent && bun start

# Prisma
cd apps/api && bun db:generate     # regenerate Prisma client after schema changes
cd apps/api && bun db:migrate      # run migrations in dev
cd apps/api && bun db:push         # push schema without migration (prototyping)
cd apps/api && bun db:studio       # open Prisma Studio

# Run the full stack locally
docker compose up

# Lint all workspaces
bun lint

# Build all
bun build
```

## Architecture

Turborepo monorepo with Bun. One `docker compose up` from root starts everything.

### Apps

| App | Port | Purpose |
|---|---|---|
| `apps/api` | 3000 | NestJS backend |
| `apps/web-admin` | 3001 | Tasdeeq internal dashboard |
| `apps/web-corporate` | 3002 | Corporate client portal |
| `apps/web-employee` | 3003 | Employee self-reporting (OTP-gated, lightweight) |
| `apps/mobile-consumer` | — | Consumer app (Expo) |
| `apps/mobile-agent` | — | Field agent app (Expo) |

### Shared Packages

| Package | Purpose |
|---|---|
| `packages/shared-types` | TypeScript interfaces and enums used across all apps |
| `packages/api-client` | Fetch wrapper and shared API call hooks |
| `packages/ui-web` | Shared React components + `cn()` util for web portals |
| `packages/ui-mobile` | Shared React Native components for mobile apps |
| `packages/verification` | Shared verification form schemas and types |

### Backend: NestJS Modular Monolith

`apps/api/src/modules/` contains one directory per domain: `auth`, `users`, `verification`, `payments`, `notifications`, `field-agents`, `documents`, `reports`, `workflow`.

Each module is isolated — modules must communicate via events or a command bus, never by directly importing another module's services. This design allows any module to be extracted into a microservice by swapping the internal event bus for a network transport (RabbitMQ, gRPC).

`PrismaModule` is global — inject `PrismaService` directly into any module without re-importing.

### Database

Prisma schema is at `apps/api/prisma/schema.prisma`. PostGIS spatial queries (geo-dispatch for field agents) are done via `prisma.$queryRaw`.

### Docker Services

| Service | Port |
|---|---|
| PostgreSQL + PostGIS | 5432 |
| Redis | 6379 |
| MinIO (S3-compatible) | 9000 (API), 9001 (console) |

Copy `.env.example` to `.env` before running locally.

## Documentation

Use **context7** (`mcp__context7__resolve-library-id` + `mcp__context7__query-docs`) to fetch current documentation before writing code that uses any library, framework, or API in this project. Always prefer context7 over training-data recall for:

- NestJS (modules, guards, interceptors, decorators, pipes)
- Prisma (schema syntax, client API, migrations, raw queries)
- Expo / React Native (navigation, permissions, native modules)
- Next.js / React (app router, server components, hooks)
- Turborepo (pipeline config, caching, remote caching)
- Bun (runtime APIs, workspace commands)
- MinIO / S3 SDK (bucket ops, presigned URLs)
- Any other third-party package added to the workspace

Do **not** use context7 for: business logic, refactoring, code review, or general TypeScript/JavaScript concepts.

## Web Admin UI

`apps/web-admin` uses **shadcn/ui** (slate color scheme, CSS variables) on top of Tailwind CSS.

### Adding components

```bash
cd apps/web-admin && bunx shadcn@latest add <component-name>
```

Components land in `src/components/ui/`. Never hand-write shadcn primitives — always use the CLI.

### Path alias

`@/` resolves to `src/` (configured in both `tsconfig.app.json` `paths` and `vite.config.ts` `resolve.alias`).

```ts
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
```

### Component organization

| Location | Contents |
|---|---|
| `src/components/ui/` | shadcn primitives — do not edit these directly |
| `src/components/` | App-level shared components extracted from pages |
| `src/pages/` | Route-level page components |

**When to extract**: if the same pattern appears in 2+ pages, extract it to `src/components/`.

### Shared components

| Component | Purpose |
|---|---|
| `PageHeader` | Page title + optional description + optional right-side action slot |
| `RoleBadge` | Renders role string as a `Badge` (super_admin=default, admin=secondary, user=outline) |
| `StatusBadge` | Renders active/banned/inactive state as a `Badge` |
| `AdminLayout` | Sidebar shell wrapping all authenticated pages |

### TypeScript note

`tsconfig.app.json` sets `verbatimModuleSyntax: true`. Always use type-only imports for types:

```ts
import { type ReactNode } from 'react';
import { type FormEvent } from 'react';
```
