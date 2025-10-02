# Feature Delivery Project Plan (Afrobeat Lounge Platform)

This project plan decomposes the Afrobeat Lounge objectives in `README.md` into feature workstreams that align with the system design in `architecture_roadmap.md`. Each workstream lists:

- **Objectives** traced to the product vision.
- **Frontend and backend modules** required to satisfy the architecture.
- **Cross-cutting dependencies** (data, integrations, operations) to keep the architecture and product roadmap synchronised.
- **Verification gates** so every milestone ships with automated frontend and backend tests.

Maintaining this plan independently ensures we can reconcile the roadmap and architecture against the product source of truth.

## Delivery status tracker

| Workstream | Latest milestone | Status | Verification | Upcoming focus |
| --- | --- | --- | --- | --- |
| Customer experience platform | Landing shell + immersive gallery + events filtering explorer | In progress – guest shell, reservations intake form, floating gallery spotlight, events API + filtering UI merged. | Vitest component + route handler tests, lint/build automation in CI (`npm run lint`, `npm run test`, `CI=1 npm run build`).【F:platform/src/components/events/EventsExplorer.tsx†L1-L179】【F:platform/src/app/api/events/route.test.ts†L1-L48】 | Wire section reservations to live pricing, expand shout-out funnel, optimise media delivery + Lighthouse budgets. |
| Promoter and vendor workspace | Planning baseline | Not started – design + auth scaffolding pending. | N/A | Define role-aware navigation + contract lifecycle flows aligned with roadmap. |
| Administrative backoffice | Planning baseline | Not started – service decomposition + data model design required. | N/A | Prioritise inventory + finance modules, connect to observability plan. |
| Marketing and growth automation | Planning baseline | Not started – dependencies on promoter/admin analytics. | N/A | Establish campaign orchestration MVP with analytics pipelines. |
| Platform automation, observability and ops | Planning baseline | Not started – foundation to follow initial guest launch. | N/A | Stand up IaC repo, monitoring SLIs/SLOs, automated provisioning. |
| AI personalisation and guest engagement | Planning baseline | Not started – gated behind analytics maturity. | N/A | Define data contracts + experimentation guardrails before implementation. |
| Data lifecycle, compliance and resilience | Planning baseline | Not started – retention strategy in backlog. | N/A | Draft retention matrices, recovery playbooks, compliance dashboards. |

> Update the tracker after each merged milestone so delivery status mirrors the architecture roadmap and README objectives.

## Alignment & verification log

| Date | Scope | Alignment notes | Tests executed |
| --- | --- | --- | --- |
| 2025-10-02 | Customer experience platform – CX-01 foundation | Landing hero, floating gallery spotlight, reservations intake, and events explorer satisfy README guest objectives and architecture priorities for galleries, shout-outs, and reservations.【F:README.md†L6-L55】【F:architecture_roadmap.md†L14-L24】【F:platform/src/components/hero/Hero.tsx†L1-L152】【F:platform/src/components/sections/GalleryPreview.tsx†L1-L216】【F:platform/src/components/forms/ReservationForm.tsx†L1-L169】【F:platform/src/components/events/EventsExplorer.tsx†L1-L179】 | `npm run lint`, `npm run test`, `CI=1 npm run build` |

## 1. Customer experience platform
- **Objectives** – Launch the guest-facing site with galleries, playlists, shout-outs, reservations and ticketing emphasising low-latency, mobile-first browsing and accessibility.【F:README.md†L6-L55】【F:README.md†L136-L157】
- **Frontend modules** – Next.js App Router routes for home/events/gallery/playlist/shout-out flows, responsive reservation wizard, countdown widgets, reusable theming primitives (dark mode, typography scale, motion tokens) and Lighthouse accessibility budgets.【F:README.md†L6-L55】
- **Backend modules** – Event catalogue service with availability rules, Stripe-backed payments for deposits and shout-outs, playlist CMS integration, tenant-aware content APIs, CDN/edge caching for media and rate-limited shout-out queueing.【F:README.md†L6-L55】【F:README.md†L136-L144】
- **Dependencies** – Stripe account configuration, media/CDN pipeline, content governance for playlists, analytics instrumentation for conversion funnels and countdown accuracy in edge deployments.【F:README.md†L24-L55】【F:README.md†L136-L144】
- **Verification** – Frontend Playwright journeys (mobile + desktop) for reservations/shout-outs, visual regression for galleries, accessibility audits, backend contract tests for inventory/availability, Jest unit tests for Stripe webhooks and cache fallback simulations.【F:README.md†L24-L55】【F:README.md†L136-L144】
- **Milestones** –
  - **CX-01 Foundation** *(Complete)* – Deliver Next.js App Router shell, hero, floating gallery, reservation intake form and events API/filters, plus Vitest and route handler coverage to protect guest flows.【F:platform/src/app/layout.tsx†L1-L69】【F:platform/src/components/sections/GalleryPreview.tsx†L1-L216】【F:platform/src/components/forms/ReservationForm.tsx†L1-L169】
  - **CX-02 Transaction flows** *(Planned)* – Integrate Stripe deposits, DJ callouts, countdown widgets and CRM handoff instrumentation.
  - **CX-03 Performance + accessibility** *(Planned)* – Edge caching, Lighthouse budgets, accessibility audits, offline fallbacks and analytics instrumentation.

## 2. Promoter and vendor workspace
- **Objectives** – Provide dedicated dashboards for promoters and vendors to manage contracts, payouts, messaging and schedules while honouring RBAC and location isolation.【F:README.md†L6-L13】【F:README.md†L158-L176】
- **Frontend modules** – Location-aware dashboard shell with role-based navigation, contract review/signature views, payout history tables, meeting timeline/calendar, in-app messaging threads and accessibility-compliant data grids.【F:README.md†L158-L176】
- **Backend modules** – Location-provisioned contract service (template merge, e-sign), payout ledger, scheduling service with ICS sync, messaging service with notifications fan-out, RBAC adapters for Auth.js/Clerk and audit trails stored per location.【F:README.md†L78-L113】【F:README.md†L158-L176】
- **Dependencies** – Document storage for contracts, payment processor settlements, calendar/email integrations, provisioning pipeline for new lounge locations and shared notification infrastructure aligned with the architecture roadmap.【F:README.md†L78-L113】【F:README.md†L158-L176】
- **Verification** – Frontend Playwright/Cypress smoke covering promoter onboarding, contract approval and payout exports plus Storybook axe accessibility tests; backend API integration tests for contract lifecycle, payout calculations, messaging permissions and migration tests for location provisioning.【F:README.md†L78-L113】【F:README.md†L158-L176】
- **Milestones** –
  - **PV-01 Foundations** *(Planned)* – Role-aware dashboard shell, auth integration, promoter onboarding wizard aligned to architecture roadmap.
  - **PV-02 Contracts & payouts** *(Planned)* – Contract lifecycle views, e-signature flows, payout ledger visualisations and associated backend services.
  - **PV-03 Collaboration tooling** *(Planned)* – Messaging threads, meeting scheduler integrations and analytics rollups tied to marketing automation.

## 3. Administrative backoffice
- **Objectives** – Deliver admin tooling for inventory, budgeting, vendor management, CRM inbox, payroll and reporting to orchestrate lounge operations.【F:README.md†L6-L13】【F:README.md†L176-L213】
- **Frontend modules** – Admin portal shell with configurable dashboards, inventory/finance CRUD forms, workflow boards, analytics visualisations, SLA alert panels and export/report builders.【F:README.md†L176-L204】
- **Backend modules** – Inventory service with stock rules, budgeting/accounting modules, vendor registry, SLA-driven support inbox, payroll integrations and reporting warehouse exports backed by scheduled ETL jobs.【F:README.md†L176-L213】
- **Dependencies** – Data warehouse schema, identity and access management alignment, third-party payroll providers, CRM tooling integration and observability hooks for operations dashboards.【F:README.md†L176-L213】
- **Verification** – Frontend regression pack with React Testing Library component tests for CRUD forms/dashboards plus Playwright admin smoke flows; backend domain tests for accounting calculations, payroll compliance, SLA triggers and contract tests against reporting exports.【F:README.md†L176-L213】
- **Milestones** –
  - **AD-01 Portal foundation** *(Planned)* – Configurable dashboards, identity-aware navigation, seed data scaffolding.
  - **AD-02 Operations suites** *(Planned)* – Inventory, budgeting, vendor registry and CRM inbox with associated backend services.
  - **AD-03 Finance & reporting** *(Planned)* – Payroll integrations, forecasting, export pipelines and observability dashboards.


## 4. Marketing and growth automation
- **Objectives** – Operationalise marketing campaigns, promoter collaborations and social/email automations outlined in the product vision.【F:README.md†L8-L13】【F:README.md†L56-L88】
- **Frontend modules** – Campaign builder UI, promoter collaboration workspaces, analytics dashboards with cohort filters, reusable components for content scheduling and experimentation controls.【F:README.md†L56-L88】
- **Backend modules** – Campaign orchestration microservice, integration connectors (email, SMS, social APIs), promoter attribution tracking, analytics storage schema and experiment/AB testing framework with feature flag rollout.【F:README.md†L56-L88】
- **Dependencies** – Marketing data warehouse, consent management, promoter CRM sync, attribution measurement standards and observability dashboards referenced in the architecture roadmap.【F:README.md†L56-L88】
- **Verification** – Frontend smoke for campaign creation/editing, analytics filter snapshots and experimentation toggle tests; backend integration tests for channel connectors, attribution accuracy and experiment guardrails (feature flag rules + rollout metrics).【F:README.md†L56-L88】

- **Milestones** –
  - **MG-01 Campaign planner** *(Planned)* – Campaign brief templates, promoter collaboration notes and scheduling UI.
  - **MG-02 Automation engine** *(Planned)* – Multi-channel orchestration service, analytics dashboards and attribution insights.
  - **MG-03 Experimentation + growth loops** *(Planned)* – Feature flag governance, experimentation guardrails and retention automations.

## 5. Platform automation, observability and ops
- **Objectives** – Embed automated provisioning, CI/CD, monitoring, logging and alerting as first-class deliverables for the lounge’s multi-location operations platform.【F:README.md†L78-L113】【F:README.md†L204-L213】
- **Frontend modules** – Operational dashboards surfacing health metrics, deployment states and location provisioning status with RBAC controls for admins.【F:README.md†L204-L213】
- **Backend modules** – Infrastructure as Code (Terraform/Pulumi) repositories, automated location bootstrap pipelines, observability stack (OpenTelemetry collection, log aggregation, alert routing), SLO management tooling and chaos testing harnesses.【F:README.md†L78-L113】【F:README.md†L204-L213】
- **Dependencies** – Cloud accounts, secrets management, incident response runbooks, cost monitoring hooks and edge/CDN performance budgets highlighted in the architecture roadmap.【F:README.md†L78-L113】【F:README.md†L204-L213】
- **Verification** – Backend pipeline tests (CI dry-runs, terraform validate/plan), chaos and latency synthetic checks, observability smoke tests (logs/metrics/traces arriving in monitoring backends) and frontend Playwright coverage for dashboard RBAC/state accuracy.【F:README.md†L78-L113】【F:README.md†L204-L213】
- **Milestones** –
  - **OPS-01 Foundations** *(Planned)* – IaC repo bootstrapping, environment promotion strategy, service catalogue.
  - **OPS-02 Observability** *(Planned)* – OpenTelemetry pipelines, alert routing, on-call dashboards, SLO definitions.
  - **OPS-03 Resilience drills** *(Planned)* – Chaos engineering, load/perf testing automation, incident response runbooks.


## 6. AI personalisation and guest engagement
- **Objectives** – Implement AI-driven recommendations, concierge chatbots and personalised outreach once core flows stabilise.【F:README.md†L226-L231】
- **Frontend modules** – Personalised carousel components, chat assistant widget, feedback capture modals tied to analytics, explainability UI and user controls for AI decisions.【F:README.md†L226-L231】
- **Backend modules** – Recommendation engine leveraging behavioural data, prompt/orchestration service for AI concierge, data privacy guardrails, model performance monitoring and feature store alignment with the data lifecycle roadmap.【F:README.md†L226-L231】
- **Dependencies** – Data governance approvals, experimentation gates, third-party AI providers (if used), red-team review process and alignment with retention policies in the data lifecycle plan.【F:README.md†L106-L113】【F:README.md†L226-L231】
- **Verification** – Frontend experimentation harness (Playwright + Lighthouse CI) validating personalised surfaces and accessibility; backend evaluation suite with offline model tests, drift detection, fairness/guardrail checks and red-team prompts before release.【F:README.md†L226-L231】
- **Milestones** –
  - **AI-01 Foundations** *(Planned)* – Data inventory, consent management, experimentation guardrails.
  - **AI-02 Concierge** *(Planned)* – Chat concierge, recommendation engine integration, explainability tooling.
  - **AI-03 Optimisation** *(Planned)* – Feedback loops, drift monitoring, cross-channel personalisation.

## 7. Data lifecycle, compliance and resilience
- **Objectives** – Satisfy retention, backup, migration and recovery expectations while safeguarding guest, promoter and location data.【F:README.md†L106-L113】

- **Frontend modules** – Admin consoles for data export requests, retention policy configuration, audit logs visualisation and compliance status reporting.【F:README.md†L106-L113】
- **Backend modules** – Automated backups, point-in-time recovery pipelines, migration tooling, archival storage tiers, privacy request automation and compliance reporting feeds.【F:README.md†L106-L113】
- **Dependencies** – Cloud storage policies, legal/compliance review cycles, data cataloguing, encryption key management and disaster recovery runbooks referenced in the architecture roadmap.【F:README.md†L106-L113】
- **Verification** – Frontend regression around export/download flows and audit log filtering; backend disaster recovery drills (restore tests), migration canary runs, automated compliance report validation and chaos scenarios covering regional failover.【F:README.md†L106-L113】
- **Milestones** –
  - **DL-01 Data inventory** *(Planned)* – Retention policy mapping, classification matrix, legal review alignment.
  - **DL-02 Automation** *(Planned)* – Backup orchestration, privacy request automation, compliance dashboard MVP.
  - **DL-03 Resilience** *(Planned)* – Regional failover rehearsal, migration tooling hardening, audit-ready reporting.
---

Review and update this plan in tandem with changes to `README.md` (product objectives) and `architecture_roadmap.md` (system design). Documenting feature-level impacts separately lets us track misalignment quickly and keeps delivery accountability transparent.
