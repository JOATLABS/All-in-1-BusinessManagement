# System Architecture & Roadmap (Afrobeat Lounge Platform)

## Overview
This platform combines a **customer-first** nightlife website with a **multi-location** business management backend operated by the lounge’s own team. Guests can browse galleries, see upcoming events with countdowns, reserve sections, and access conditional ticket pre-sales while partner enquiries route into a dedicated contact modal. The backend lets admins manage events, inventory, contracts, vendors/promoters, accounting, budgeting, messaging, and reporting for each lounge location. Promoters and vendors get their own dashboards (contracts, payments, messaging, meetings) without exposing the system as a public SaaS product.

## Diagrams
The images below are included in this ZIP and referenced by relative paths so they render when you open this README locally.

![High‑level architecture](public/high_level_architecture.png)
![Multi-location architecture](public/multi_tenant_architecture.png)

## Tech Stack (recommended)
- **Next.js 15 + TypeScript** (App Router), **Tailwind CSS**, **shadcn/ui** for fast, accessible UI.
- **Auth.js or Clerk** for location-aware auth & RBAC.
- **PostgreSQL** with **Row-Level Security** (RLS) for location isolation; **Prisma** or **Drizzle ORM**.
- **Redis** (cache, queues). **tRPC/Route Handlers** as the BFF/API gateway.
- **Stripe** (deposits, tickets, invoices), **Cloudinary** (media), **Twilio/Email/Slack** (notifications).
- Deploy on **Vercel/AWS/Supabase**; use **CDN + Edge** for low latency.

### Current prototype snapshot (October 2025)
- **Frontend** – Vite + React single-page experience with animated hero, overlay navigation, and protected admin routes backed by a shared site-content provider.【F:frontend/src/App.tsx†L1-L33】【F:frontend/src/pages/LandingPage.tsx†L1-L178】
- **Backend** – Express + TypeScript API with Helmet/CORS, Postgres persistence, and JSON-driven seeding for hero/event/footer overlays.【F:backend/src/app.ts†L1-L27】【F:backend/src/db/index.ts†L1-L54】【F:backend/src/db/seed.ts†L1-L62】
- **Auth** – Email/password login with bcrypt verification and in-memory session tokens (to be replaced with durable tokens per the audit).【F:backend/src/routes/auth.ts†L1-L40】【F:backend/src/services/sessionService.ts†L1-L33】
- **Content workflow** – Admin configuration saves feed the customer site via `/api/v1/site-content`, maintaining parity with the public landing page without manual edits.【F:backend/src/routes/siteContent.ts†L1-L20】【F:frontend/src/hooks/useSiteContent.ts†L55-L78】

See `best_practices_audit.md` for the latest compliance findings and `project_tasks.md` for remediation commitments tied to this snapshot.

## Key Features to Implement
- **Customer site**: cinematic landing hero, services, event list with countdown, section reservations, conditional ticket pre-sales, partner contact modal.
- **Promoter/Vendor portal**: contracts & signatures, payouts/receipts, messaging, scheduling.
- **Admin**: theme/site config, contract templates, inventory & vendors, budge/accounting, events, CS inbox, payroll, records, reports, audits, notifications and SLA handling.
- **Event policy**: Free entry by default; **ticketed** special events are pre-paid online to avoid lines at the door.

## Roadmap (high-level)
1. **Discovery** → user journeys, data model, location routing style (subdomain vs path).
2. **Design** → mobile‑first, dark mode, accessible UI; component library; micro‑interactions.
3. **MVP** → customer flows (events, reservations, conditional ticketing, contact modal), promoter onboarding, admin basics.
4. **Backoffice** → inventory, contracts, finance, CRM/CS inbox, notifications.
5. **Scale** → RUM monitoring, performance budgets, horizontal scaling, cost observability.

---

> Questions or edits? Update this README and re-export the diagrams as needed. Both images live in `public/` and are referenced with relative paths.

## Architecture deltas to address

The comprehensive README outlines additional objectives and operational guardrails that are not yet reflected in this condensed architecture summary. Update the diagrams and supporting documentation to cover the following gaps:

- **Customer ↔ admin content sync** – illustrate how admin publishes push into versioned site content, including rollback support and service-to-service authentication so the landing page never depends on static JSON.【F:frontend/src/hooks/useSiteContent.ts†L55-L78】【F:backend/src/db/seed.ts†L1-L62】
- **Security hardening** – incorporate rate limiting, durable session storage, structured logging, and environment validation flows surfaced in the October 2025 audit so scale-out deployments stay compliant with OWASP REST guidance.【F:backend/src/app.ts†L1-L27】【F:backend/src/services/sessionService.ts†L1-L33】【3fd5cb†L1-L23】
- **Reservation & inventory lifecycle** – expand diagrams to cover table inventory, reservation status changes, deposits, and the data feeds required to update hero CTAs in real time.【F:project_tasks.md†L29-L63】【F:project_tasks.md†L96-L129】
- **Operational automation & observability** – include automated provisioning, CI/CD, monitoring, logging, and alerting strategies recommended for the lounge’s multi-location platform.【F:README.md†L78-L113】【F:best_practices_audit.md†L1-L46】
- **AI-powered personalisation** – reserve space in the roadmap for the AI recommendations and chatbot initiatives described as future enhancements.【F:README.md†L226-L231】
- **Edge performance & accessibility** – reflect low-latency delivery (CDN/edge) and accessibility mandates (reduced-motion support, alt text workflows) that shape front-end architecture decisions.【F:README.md†L24-L55】【F:best_practices_audit.md†L24-L40】

Documenting these elements keeps the living architecture aligned with the product vision and ensures downstream teams design against the same set of priorities.

---

> For the end-to-end delivery plans, milestones and verification checklists that align the architecture with the README objectives, see `project_plan.md`.
