# Tasdeeq — End-to-End Verification System

## Problem

Organizations and individuals currently face major challenges in conducting background and trust verification processes such as criminal record, employment, education, address, and insurance verification. These processes are largely manual, fragmented across calls, emails, spreadsheets, and physical coordination, and involve multiple stakeholders with no centralized tracking or accountability. As a result, verification operations become slow, error-prone, difficult to monitor, and lacking transparency, creating delays, inconsistent data collection, operational inefficiencies, and poor user experience for both verification providers and customers.

## Solution

Tasdeeq provides a centralized, task-driven verification management platform that digitizes and automates the complete verification lifecycle for corporations and individual consumers. The system connects Tasdeeq administrators, corporate clients, educational institutes, consumers, employees, and field agents within a secure ecosystem where users can submit documents, respond to verification requests, perform field activities, upload evidence, and monitor progress in real time.

---

## Roles

### Tasdeeq Internal Users
- **Tasdeeq Admin** — manages the full platform, reviews tasks before execution, assigns field agents, can access and operate corporate client portals on their behalf, and configures verification workflows.
- **Tasdeeq Finance** — verifies manual payments (bank transfer, cash) before releasing tasks to the admin queue.

### External Users
- **Corporate Client User** — accesses the corporate portal to create verifications, manage employees, and view reports. Some corporate clients are flagged as **Education Institutes**, which unlocks an additional education verification module on their portal.
- **End Consumer** — uses the Tasdeeq mobile app to verify household servants (drivers, maids, guards, etc.). Submits the subject's details; the subject does not need to be registered on Tasdeeq.
- **Field Agent** — freelance agent who performs physical verifications (address, insurance). Field agents can self-register via the mobile app, but are manually vetted and approved by Tasdeeq before they are onboarded and eligible to receive tasks. Tasdeeq will initially seed the platform with agents from its existing driver database. Uses a mobile app that supports offline-first operation for areas with poor connectivity.

### Subjects (Persons Being Verified)
A subject is the individual whose background is being checked. Subjects do not need to be registered on Tasdeeq. Their details (name, CNIC, etc.) are submitted by the initiating party. A subject can be a company employee, a job applicant, or a household servant.

---

## Verification Initiation

Verifications can be initiated by:
- **End consumers** via the Tasdeeq mobile app
- **Corporate client users** via the corporate portal
- **Tasdeeq admin users** on behalf of corporate clients (via impersonated portal access)

---

## Verification Types

### Criminal Record Verification
An external API call is made to a third-party criminal records system. Tasdeeq tracks the status and progress from that external system. No manual steps are involved on the Tasdeeq side.

### Employment Verification
1. The requesting party submits the subject's previous employer details.
2. The previous employer receives an OTP-authenticated link via phone/email.
3. Upon authentication, the employer is auto-created as a corporate client and lands on the corporate portal with the verification task assigned to them.
4. The employer fills in the employment details via the task form.
5. A Tasdeeq admin reviews the submission before marking the task complete.
6. If the employer is unresponsive, a Tasdeeq admin creates the employer as a client manually and completes the task on their behalf.

### Education Verification
Same flow as employment verification. The educational institute must be flagged as an **Education Institute** type corporate client. Once flagged, an education module appears on their corporate portal showing degree/diploma verification tasks.

### Address Verification
1. After payment and admin approval, the task enters the field dispatch queue.
2. A field agent is assigned automatically via geo-based dispatch (similar to Uber/Careem ride assignment).
3. The field agent performs the physical visit, captures geo-tagged photos and evidence, and submits remarks via the mobile app.
4. A Tasdeeq admin reviews before marking complete.

### Insurance Verification
Fully manual field agent task. The agent physically verifies that an insurance policy is being availed by the correct person. Same dispatch and review flow as address verification.

---

## Cart & Payment Flow

1. The user adds multiple verifications to the cart. Items are grouped by subject (employee/person) in the cart UI but are separate billable items.
2. The user selects which verifications to proceed with and an invoice is generated.
3. Payment options:
   - **JazzCash / EasyPaisa** — instant payment confirmation; tasks immediately move to the Tasdeeq admin queue.
   - **Bank transfer / Cash** — tasks are placed in a "pending payment verification" hold. A Tasdeeq Finance user manually confirms receipt, then releases tasks to the admin queue.
4. Tasdeeq admin reviews each task before it proceeds to execution.

---

## Verification Task Lifecycle

```
Cart → Invoice → Payment
  ├── Instant (JazzCash/EasyPaisa) → Admin Queue
  └── Manual (Bank/Cash) → Finance Verification → Admin Queue
        ↓
  Admin Review & Approval
        ↓
  Type-Specific Execution
  ├── Criminal → External API call
  ├── Employment/Education → Institution Portal Task
  ├── Address → Field Agent Dispatch
  └── Insurance → Field Agent Dispatch
        ↓
  Admin Marks Complete
        ↓
  Verification Report Generated
```

---

## Unregistered Verifying Institution Flow

When a previous employer or education institute is not yet a Tasdeeq client:
1. Tasdeeq sends them an OTP-authenticated link via phone and email.
2. Upon successful OTP verification, a corporate client account is auto-created for them.
3. They are shown the corporate portal with their assigned verification task(s).
4. **Fallback**: If they cannot be reached digitally, a Tasdeeq admin creates their account manually and completes the task on their behalf.

---

## Key Modules

### Internal Tasdeeq Dashboard
- Admin task queue and workflow management
- Finance payment verification queue
- Field agent management and geo-dispatch
- Client and user management
- Workflow configuration (admin only)
- Platform-wide analytics, SLA tracking

### Corporate Client Portal
- Verification request creation and tracking
- Employee and subject management
- Cart, invoice, and payment
- Document upload and management
- Verification reports and audit history
- Multi-user support with role management
- **Education Institute Module** (visible only when flagged): degree and diploma verification tasks
- Job posting management *(planned, not v1)*

### Tasdeeq Consumer Mobile App
- Verification requests for household servants
- Cart and payment (JazzCash/EasyPaisa)
- Real-time verification status tracking
- Document upload
- Job listings from corporate clients *(planned, not v1)*

### Field Agent Mobile App
- Assigned task list with geo-navigation
- Offline-first operation
- Geo-tagged photo and evidence capture
- Field remarks and proof submission
- Task acceptance/status updates

---

## Out of Scope (Current Phase)

- Criminal/courts system (consumed as external API only)
- NADRA or government database integration (CNIC used as identifier only)
- Subject dispute or challenge resolution
- Data retention and PDPA compliance implementation
- Job posting module (planned for future release)
- International institution verification
