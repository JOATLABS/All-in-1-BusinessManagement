# System Architecture & Roadmap (Afrobeat Lounge Platform)

System Architecture and Roadmap for the Customer Website & Business‑Management System

## Introduction

The Afrobeat lounge requires a tightly integrated public web experience and a single‑administrator operations dashboard. The customer site needs to showcase events, enable table reservations, sell digital experiences, and distribute QR tickets. Behind the scenes the owner must manage agreements, collect signatures, receive payment notifications, and trigger reminders without juggling third‑party spreadsheets or email threads. This document summarises current UX research, outlines the core capabilities, describes the supporting architecture, and provides an implementation roadmap for the unified platform.

## Developer Guides

- [Admin Dashboard & Configuration API](docs/admin_dashboard.md) – how to run the admin console, authenticate, and update the content powering the public site.
- [Reservation Workflow Overview](docs/reservation_workflow.md) – how availability, payment, and QR confirmations flow through the stack.

## UX research and design guidance

### Night‑life website trends

Research into bar and nightclub websites indicates that visitors expect a modern and immersive experience. According to a 2024 design trends article for bars and nightclubs, dark mode is increasingly popular because it produces a sleek, nightclub‑appropriate feel, bold typography captures attention, and interactive elements such as animations and parallax scrolling keep visitors engaged.
Minimalist layouts with generous white space help users find information quickly. Video backgrounds can create an immersive feeling, but designers must balance impact with performance. Accessibility is a growing requirement; the same article emphasises that websites must be usable by people with disabilities.

### General UX guidelines for 2025

Modern UX guidelines emphasise personalised experiences and a mobile‑first approach. CloudMellow’s 2025 UX guide notes that personalisation using AI (for example, recommending playlists or reminding users about events they attended) can increase engagement when balanced with transparent data‑use policies. Because most traffic now arrives via mobile devices, the site should be designed for mobile first and then scaled up for desktop. Speed is critical – even a one‑second delay increases bounce rates – so images need to be compressed, browser caching enabled and code minified. Navigation should be intuitive, using familiar patterns and breadcrumb trails for deep pages. High‑quality visuals and legible typography should be used sparingly; white space prevents clutter and emphasises important information. Accessibility must follow the Web Content Accessibility Guidelines (WCAG) by providing keyboard navigation, screen‑reader support and alt text for images. Interactive elements such as polls and quizzes help transform passive browsing into active engagement. Clear calls‑to‑action (e.g., “Reserve your Section”) should be visually distinct, and consistent branding across pages builds trust. Finally, gathering feedback through surveys and analytics helps iterate the design.

## Core capabilities for the single‑admin dashboard

1. **Event reservations and ticketing** – Admins define event inventory (VIP sections, tables, general admission). Guests reserve through the public site and complete payment via hosted Stripe Checkout sessions that support Apple Pay and Google Pay. Upon successful payment, the system issues QR codes for door staff.
2. **Digital upsells and experiences** – Stripe Checkout drives additional SKUs such as DJ shout‑outs or premium media packages. The customer experience remains responsive across mobile wallets and traditional cards.
3. **Contract and agreement lifecycle** – The admin can upload contract templates, trigger electronic signature requests, and monitor completion. Automated reminders notify signees when agreements are pending or expiring, and a dedicated signature submission page captures uploads for walk‑ins.
4. **Documentation repository** – Signed agreements, compliance documents, and attachments are stored in a searchable library with retention policies that align with hospitality record‑keeping requirements.
5. **Notification centre** – The dashboard aggregates payment confirmations, agreement reminders, low inventory alerts, and event capacity warnings. Admin actions (acknowledge, snooze, escalate) feed back into workflows.
6. **Analytics snapshots** – High‑level metrics summarise weekly revenue, reservation conversion rates, and contract completion status.

## Payment and document flows

- **Stripe Checkout sessions** handle deposits, ticket purchases, reservations, and upsells. Each session uses server‑side creation to set metadata (event ID, guest contact). Webhooks capture payment status and dispatch QR ticket generation.
- **Wallet support**: Apple Pay and Google Pay are enabled directly through Stripe’s hosted surface to minimise PCI scope while offering the payment methods most requested by lounge guests.
- **Agreement lifecycle**: Draft contracts are generated from templates, sent via email with secure links, and stored once signed. Reminder jobs monitor outstanding signatures and expiring agreements. Guests without email access can submit signatures through the hosted submission page by scanning a QR code in‑venue.
- **Ticket distribution**: After payment, guests receive an email and SMS containing a unique QR code. Codes are also available through the admin dashboard for manual resend. Scanning the QR code validates entry and marks the ticket as redeemed.
- **Admin notifications**: Webhook events (payment succeeded, checkout abandoned, signature completed) funnel into a notification queue displayed in the dashboard and optionally mirrored to SMS or Slack for after‑hours monitoring.

## High‑level system architecture

### Front‑end experiences

- **Public site**: A Next.js (App Router) application delivers the event catalogue, reservation flows, and checkout initiation. Tailwind CSS and shadcn/ui support the dark, high‑contrast aesthetic while maintaining accessibility. React Hook Form + Zod drive validation for reservation details and signature submissions.
- **Admin dashboard**: A secured single‑tenant workspace provides contract management, notification review, and analytics. Admin authentication uses Auth.js or Clerk with enforced multi‑factor authentication. Because only one organisation operates the system, tenant resolution logic is removed; the app bootstraps directly into the lounge’s data set.

### Backend services

- **Backend‑for‑Frontend (BFF)**: Next.js Route Handlers or an Express/tRPC layer orchestrate reservation workflows, contract actions, and webhook ingestion. The BFF exposes simplified endpoints for the admin dashboard while guarding webhook secrets and signature uploads.
- **Event & reservation service**: Manages event schedules, table inventory, guest manifests, QR generation, and redemption tracking. Integrates with Stripe to create Checkout sessions for each reservation or upsell.
- **Agreement service**: Stores templates, tracks signature status, renders reminder timelines, and serves the standalone submission page. Documents are stored in object storage with metadata saved in PostgreSQL.
- **Notification service**: Consumes Stripe and agreement events from a queue (Redis Streams or AWS SQS), aggregates them into actionable alerts, and persists admin acknowledgement state.
- **Reporting module**: Provides pre‑computed aggregates for revenue, attendance, and contract lifecycle metrics. Materialised views or scheduled jobs prepare dashboards without blocking transactional queries.

### Data and integrations

- **PostgreSQL** serves as the primary datastore. Tables are scoped by functional domains (events, reservations, agreements, notifications). Row‑level policies restrict access to the single admin user and service accounts but no longer require tenant filters.
- **Redis** delivers caching for frequently accessed event listings and powers the notification queue. It also supports rate limiting on the signature submission page.
- **Object storage (e.g., Cloudinary or S3)** retains signed agreements, uploaded IDs, and promotional media. Signed URLs secure document downloads.
- **Stripe** processes all payments and sends webhook events for payment success, expiration, and refunds. Metadata links payments to reservations and digital upsells.
- **Email/SMS (SendGrid, Twilio)** distribute receipts, QR codes, reminders, and notifications.

## Security posture

- Enforce HTTPS across all environments with HSTS and strict Content Security Policies.
- Require multi‑factor authentication for the admin account; remove dormant sessions aggressively.
- Store secrets in a managed vault (e.g., Doppler, 1Password Secrets Automation, AWS Secrets Manager) and rotate Stripe webhook signing secrets on a schedule.
- Validate every inbound webhook signature and use idempotency keys when writing payment or signature events.
- Encrypt agreement documents at rest in object storage and restrict access via signed URLs that expire quickly.
- Implement audit logging for admin actions (contract updates, notification acknowledgements, QR reissues) with immutable storage for compliance.

## Implementation roadmap

### Discovery & Requirements (2 weeks)

- Confirm the scope of reservation types, contract templates, and notification destinations.
- Map guest journeys for reservations, contract signature, and ticket redemption.
- Gather compliance requirements for document retention and payment reconciliation.

### UX & Visual Design (3 weeks)

- Produce Figma prototypes for the public site, checkout launch points, admin dashboards, and signature submission page.
- Validate mobile flows for Apple Pay/Google Pay and QR code handling.
- Conduct usability testing with staff to ensure the single‑admin workflow is intuitive.

### Architecture & Foundation (1 week)

- Finalise the Next.js + Express/tRPC stack with shared TypeScript types.
- Provision PostgreSQL, Redis, Stripe, and object storage in the target cloud environment.
- Configure infrastructure as code (Terraform or Pulumi) for deterministic environments.

### Feature Implementation (6 weeks)

1. **Reservations & ticketing**
   - Build event CRUD, availability calculations, and QR code generation.
   - Integrate Stripe Checkout for reservations, tickets, and shout‑outs.
   - Implement webhook handling for payment success, failure, and expiration.
2. **Agreement lifecycle**
   - Create template management, signature requests, and reminder scheduling.
   - Implement the signature submission page with file uploads and identity capture.
3. **Notification centre**
   - Build the notification queue, admin inbox UI, and actionable controls (acknowledge, snooze, escalate).
4. **Analytics & reporting**
   - Generate summary cards for revenue, contract completion, and event attendance.

### Hardening & Launch (3 weeks)

- Write automated tests (unit, integration, end‑to‑end) for reservation flows, webhook processing, and signature submissions.
- Conduct performance tuning (image optimisation, caching, CDN configuration) to meet Core Web Vitals targets.
- Run security reviews covering webhook validation, document access controls, and MFA enforcement.
- Prepare runbooks for incident response, payment reconciliation, and contract disputes.

### Ongoing Enhancements

- Expand analytics with cohort comparisons and cancellation insights.
- Automate reconciliation exports to accounting platforms.
- Introduce AI‑driven recommendations (e.g., suggest upsells based on previous purchases).
- Evaluate staff‑facing mobile tooling for on‑floor reservation adjustments.

## Prototype development setup

The current repository includes a working Vite/React landing experience and an Express‑based admin API so we can validate the content workflow without accruing technical debt. The steps below keep both experiences running locally while honouring the architecture roadmap.

The backend persists hero, event, footer and overlay copy in PostgreSQL through Drizzle ORM so admin edits survive restarts while matching the production‑ready stack documented earlier.

### Backend API (Express + TypeScript)

1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and point `DATABASE_URL` at your PostgreSQL instance (for local work a Dockerised Postgres 15+ container is recommended).
4. `npm run db:seed` to load the hero/event/footer seed data and the default admin user (the server will create any missing tables automatically).
5. `npm run dev`

The API listens on **http://localhost:4000** by default and reads/writes content using the `DATABASE_URL` connection string. Adjust the backend `.env` or `VITE_API_PROXY_TARGET` if you need to run it elsewhere.

### Frontend (Vite + React + TypeScript)

1. `cd frontend`
2. `npm install`
3. Copy `.env.example` to `.env.local` if you need to override the defaults (e.g. `VITE_API_BASE_URL` for remote environments).
4. `npm run dev`

The Vite dev server proxies `/api` requests to the backend, so no extra CORS configuration is required for local work.

### Admin access for the prototype

- Email: `owner@ojaplusclub.com`
- Password: `Nightlife!23`

After signing in, the **Site Configuration** workspace saves changes directly to the API and refreshes the landing content. Run `npm run lint` and `npm run build` in `frontend/` plus `npm run build` in `backend/` before committing changes to maintain quality gates.

## Conclusion

By focusing on a single‑admin operations model the platform removes unnecessary tenant complexity and concentrates on the capabilities that matter most: reliable payments, streamlined agreements, responsive QR ticketing, and timely notifications. The recommended architecture leverages modern web tooling to deliver a polished customer journey while giving the owner immediate insight into reservations, documents, and revenue. Following this roadmap establishes a scalable foundation that can expand with future hospitality offerings.
