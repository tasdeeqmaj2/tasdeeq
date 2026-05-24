# Tasdeeq — Implementation Plan

---

## Phase 1: Foundation & Infrastructure

**Goal:** One `docker compose up` runs the entire project. All apps scaffold and connect.

- [x] Initialize Turborepo monorepo with Bun workspaces
- [x] Scaffold all 5 apps: `web-admin`, `web-corporate`, `web-employee`, `mobile-consumer`, `mobile-agent`
- [x] Scaffold shared packages: `shared-types`, `api-client`, `ui-web`, `ui-mobile`, `verification`
- [x] Set up NestJS backend (`apps/api`) with modular folder structure
- [x] Configure Prisma with PostgreSQL + PostGIS (schema setup, migration pipeline, Prisma Client generation)
- [x] Write `Dockerfile` for each app and the API
- [x] Write root `docker-compose.yml` (API, PostgreSQL+PostGIS, Redis, MinIO)
- [x] Configure environment variables and `.env.example` for all apps
- [x] Set up ESLint + TypeScript config shared across the monorepo
- [x] Set up Tailwind CSS + shadcn/ui in `ui-web` package and wire into `web-admin` and `web-corporate`

---

## Phase 2: Authentication & RBAC

**Goal:** Every role can register, log in, and be authorized. OTP works end to end.

- [ ] Define all role types in `shared-types`: `TASDEEQ_ADMIN`, `TASDEEQ_FINANCE`, `CORPORATE_USER`, `CONSUMER`, `FIELD_AGENT`
- [ ] Build `auth` NestJS module: JWT access + refresh token strategy
- [ ] Build OTP service: generate, store in Redis (TTL), verify via email and SMS
- [ ] Implement RBAC guards and role decorators
- [ ] Corporate client registration (company profile + first admin user)
- [ ] Corporate multi-user management (invite users, assign roles within a company)
- [ ] Tasdeeq staff accounts (admin + finance roles, internal only)
- [ ] Consumer registration via mobile (name, email, phone, CNIC)
- [ ] Field agent self-registration (collect profile, docs) + Tasdeeq manual approval flow
- [ ] Session management: token refresh, logout, revocation

---

## Phase 3: Corporate Portal — Shell & Client Management

**Goal:** Corporate users can log in, manage their company profile and employees.

- [ ] `web-corporate`: routing, layout, auth guards, role-based navigation
- [ ] `web-admin`: routing, layout, auth guards
- [ ] Corporate company profile management
- [ ] Corporate user management (invite, roles, deactivate)
- [ ] Employee/subject management (add, edit, list subjects to be verified)
- [ ] Education Institute flag: toggle visibility of education module per client
- [ ] Tasdeeq admin impersonation — access any corporate client's portal on their behalf (all actions logged)

---

## Phase 4: Verification Request Creation & Cart

**Goal:** A corporate user or consumer can build a cart of verifications for one or more subjects.

- [ ] Define verification domain model: `VerificationRequest`, `VerificationItem`, `VerificationStatus` state machine
- [ ] Document upload service: MinIO integration, file type/size validation, presigned URLs
- [ ] Verification item creation UI: select verification type per subject
- [ ] Verification type forms in `packages/verification` (employment details, education details, address, insurance)
- [ ] Two data-entry options per item: **fill now** (client fills) or **send to employee** (deferred)
- [ ] Cart: group items by subject, add/remove items, review before checkout
- [ ] Invoice generation from cart contents
- [ ] Cart persistence (resume incomplete carts)

---

## Phase 5: Employee Self-Reporting Portal

**Goal:** Employees receive a link, verify via OTP, fill their details, and submission returns to client for review.

- [ ] Unique signed link generation per verification item (expiry, one-time use)
- [ ] Email dispatch of self-reporting link (SendGrid)
- [ ] `web-employee`: minimal app — OTP verification screen + task forms only
- [ ] Reuse verification type forms from `packages/verification`
- [ ] Employee submits → status updates to `PENDING_CLIENT_REVIEW`
- [ ] Client review screen on `web-corporate`: view employee submission, edit if needed, approve to cart
- [ ] Client can recall link and fill data themselves at any point

---

## Phase 6: Payment

**Goal:** Verifications move forward only after payment is confirmed.

- [ ] JazzCash merchant API integration (checkout, callback, webhook)
- [ ] EasyPaisa merchant API integration (checkout, callback, webhook)
- [ ] Bank transfer / cash payment flow: tasks held in `PENDING_PAYMENT_VERIFICATION`
- [ ] Finance role dashboard: list pending manual payments, confirm/reject with remarks
- [ ] On confirmation: tasks released to `ADMIN_QUEUE`
- [ ] Payment history and receipt generation per invoice

---

## Phase 7: Admin Task Queue & Workflow Management

**Goal:** Tasdeeq admins can review, approve, and route all incoming verification tasks.

- [ ] Admin task queue: list all tasks in `ADMIN_QUEUE` with filters (type, client, date, status)
- [ ] Task detail view: subject info, documents, verification type, payment status
- [ ] Admin approve → routes task to type-specific execution (see phases 8–10)
- [ ] Admin reject with reason → notifies client
- [ ] SLA tracking: flag overdue tasks
- [ ] Admin can create a corporate client manually and operate on their behalf

---

## Phase 8: Employment & Education Verification Flow

**Goal:** Previous employers and institutes receive tasks, fill them, and admin reviews results.

- [ ] Unregistered institution OTP link generation and email/SMS dispatch
- [ ] Auto-create corporate client account on OTP verification
- [ ] Institution lands on `web-corporate` with only their assigned verification task visible
- [ ] Employment verification task form (dates, role, reason for leaving, remarks)
- [ ] Education verification task form (degree, result, graduation date, remarks) — visible only to Education Institute clients
- [ ] Institution submits → status updates to `PENDING_ADMIN_REVIEW`
- [ ] Admin reviews institution submission → marks complete or requests revision
- [ ] Fallback: admin creates institution client manually, fills task on their behalf

---

## Phase 9: Criminal Verification Flow

**Goal:** Criminal check is triggered via external API and tracked passively.

- [ ] External criminal records API integration (client, auth, request format)
- [ ] Trigger API call on admin approval
- [ ] Poll or webhook handler to receive status updates from external system
- [ ] Map external statuses to internal `VerificationStatus`
- [ ] Surface result and raw response in admin task view

---

## Phase 10: Field Agent System (Address & Insurance)

**Goal:** Field agents receive geo-dispatched tasks, complete them offline, and upload evidence.

- [ ] Field agent mobile app scaffold (`mobile-agent`): auth, task list, task detail
- [ ] PostGIS-based geo-dispatch: find nearest available approved field agent on task approval
- [ ] Task assignment push notification to field agent
- [ ] Field agent accepts/declines task
- [ ] Offline-first task queue: cache assigned tasks locally (MMKV or WatermelonDB)
- [ ] Address verification: geo-tagged photo capture, remarks form, submit evidence
- [ ] Insurance verification: same evidence capture flow, confirm correct person
- [ ] Evidence upload to MinIO/S3 on connectivity restore
- [ ] Admin reviews field agent submission → marks complete

---

## Phase 11: Notifications & Real-time

**Goal:** All parties are informed of status changes instantly.

- [ ] Socket.io server integration on NestJS + client hooks in web apps
- [ ] Real-time task status updates pushed to corporate portal and admin dashboard
- [ ] Email notification triggers (SendGrid): map every `VerificationStatus` transition to template
- [ ] SMS notification triggers (Twilio): OTP, task assigned, status updates
- [ ] In-app notification centre (web + mobile)
- [ ] Pending task reminders and SLA escalation alerts (BullMQ scheduled jobs)

---

## Phase 12: Consumer Mobile App

**Goal:** Individual consumers can verify household servants end to end from the mobile app.

- [ ] `mobile-consumer` scaffold: auth, navigation, shared component wiring from `ui-mobile`
- [ ] Subject creation: add household servant details (name, CNIC, address, photo)
- [ ] Verification type selection and cart (reuse `packages/verification` forms)
- [ ] JazzCash / EasyPaisa in-app payment
- [ ] Real-time verification status tracking per subject
- [ ] Document upload from mobile camera / gallery
- [ ] Verification result and report download

---

## Phase 13: Reports & Audit

**Goal:** Every verification has a complete paper trail and a downloadable report.

- [ ] Activity timeline per verification: every status change, actor, timestamp
- [ ] Full audit log: admin impersonations, institution submissions, field agent actions
- [ ] Verification report template (PDF): subject details, verification results, evidence, timestamps
- [ ] PDF generation and download (corporate portal + admin dashboard)
- [ ] Admin analytics dashboard: verification volumes, SLA metrics, payment status breakdown
- [ ] Corporate client dashboard: their own verification history and stats

---

## Phase 14: QA & Launch Preparation

**Goal:** System is stable, secure, and ready for production.

- [ ] End-to-end workflow testing for all verification types
- [ ] Role-based access control audit (ensure no privilege escalation paths)
- [ ] Security review: OTP brute-force protection, signed link expiry, file upload sanitization
- [ ] Production Docker configuration (multi-stage builds, environment hardening)
- [ ] Load testing on task queue and geo-dispatch under concurrent requests
- [ ] Runbook: deployment, rollback, database migration procedure
