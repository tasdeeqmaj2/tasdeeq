# Tasdeeq — Tech Stack

## Monorepo Structure (Turborepo)

```
apps/
  web-admin/        # React + Vite — Tasdeeq internal dashboard
  web-corporate/    # React + Vite — Corporate client portal
  web-employee/     # React + Vite — Lightweight employee self-reporting portal (OTP-gated, task forms only)
  mobile-consumer/  # React Native (Expo) — Consumer app
  mobile-agent/     # React Native (Expo) — Field agent app
packages/
  shared-types/     # TypeScript interfaces shared across all apps
  api-client/       # Shared API calls and hooks
  ui-web/           # Shared web components (admin + corporate portals)
  ui-mobile/        # Shared React Native components (consumer + agent apps)
  verification/     # Shared verification logic, forms, validation
```

The consumer mobile app and corporate portal share significant verification functionality (form logic, document upload, status tracking, cart), which is the primary justification for the monorepo approach.

---

## Backend Architecture: Modular Monolith

The backend is structured as a **modular monolith** — a single deployable NestJS application composed of fully isolated domain modules. Each module:
- Owns its own data and does not share database tables with other modules
- Communicates with other modules via well-defined interfaces (events or command bus), not direct service imports across module boundaries
- Can be extracted into an independent microservice by swapping the internal event bus with a network transport (RabbitMQ, Kafka, gRPC) with minimal code changes

Planned domain modules: `auth`, `users`, `verification`, `payments`, `notifications`, `field-agents`, `documents`, `reports`, `workflow`

---

## Containerization

Every app and service is Dockerized from the start. Each app (`web-admin`, `web-corporate`, `web-employee`, `api`) has its own `Dockerfile`. A single `docker-compose.yml` at the monorepo root brings up the entire stack for local development:

- NestJS API
- React + Vite web portals (admin, corporate, employee)
- PostgreSQL (with PostGIS)
- Redis
- MinIO (S3-compatible local storage)

The full project runs with a single `docker compose up` from the root with no manual environment setup.

---

## Stack Decisions

| Layer | Choice | Reason |
|---|---|---|
| Runtime & Package Manager | Bun | Faster installs, built-in TypeScript, replaces Node.js/npm |
| Backend | NestJS (TypeScript, runs on Bun) | Modular monolith — isolated domain modules extractable into microservices with minimal config changes |
| Web Portals | React + Vite (TypeScript) | SPA; SSR not needed as all portals are behind authentication |
| UI (Web) | Tailwind CSS + shadcn/ui | Utility-first styling with accessible, composable components |
| Mobile | React Native + Expo | Shared verification logic and components with web portals |
| ORM | Prisma | Type-safe auto-generated client, clean migrations, schema as single source of truth |
| Database | PostgreSQL + PostGIS | Relational data, audit logs, geo queries for field dispatch (PostGIS geo queries use Prisma `$queryRaw`) |
| Cache & Queues | Redis + BullMQ | Task state transitions, geo-dispatch, notification jobs |
| Real-time | Socket.io | Live task status updates to portals and dashboards |
| File Storage | AWS S3 / DigitalOcean Spaces | Documents, CNIC scans, geo-tagged field photos |
| Local Storage (dev) | MinIO | S3-compatible; no code changes needed between dev and prod |
| SMS / OTP | Twilio (or Jazz Business API) | OTP authentication, workflow notifications |
| Email | SendGrid | Workflow notifications, OTP links to institutions and employees |
| Payments | JazzCash / EasyPaisa merchant APIs | Primary payment methods |
