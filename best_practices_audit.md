# Best Practices Audit (Backend & Frontend Platform)

## Backend Platform
- **Configuration resolution** – `config.ts` now locates the backend project root by walking up to the `package.json` for `ojaplus-backend`, so seed data and other shared assets remain reachable in both dev (`tsx`) and production (`node dist`) runs without fragile relative paths.【F:backend/src/config.ts†L1-L67】
- **Security middleware** – The Express app boots with Helmet, CORS, and JSON body limits to align with OWASP API hardening guidelines for early-stage services.【F:backend/src/app.ts†L1-L27】
- **Database provisioning** – PostgreSQL tables for admins and site content are created idempotently at startup, then seeded from JSON fixtures so deployments stay repeatable while we design the long-term schema strategy.【F:backend/src/db/index.ts†L1-L62】【F:backend/src/db/seed.ts†L1-L62】
- **Validation & auth** – Login and content update flows are schema-validated with Zod, hashed credentials are compared with bcrypt, and authenticated admin sessions gate content mutations to keep the configuration surface controlled.【F:backend/src/routes/auth.ts†L1-L40】【F:backend/src/routes/siteContent.ts†L1-L24】【F:backend/src/services/authService.ts†L1-L19】【F:backend/src/validation/siteContent.ts†L1-L74】

## Frontend Platform
- **Content sourcing** – The landing and admin surfaces consume a shared content provider so all hero, overlay, and footer copy flows from the same configurable payload rather than hard-coded strings.【F:frontend/src/content/SiteContentProvider.tsx†L1-L58】
- **Navigation model** – CTA buttons invoke overlay panels through a central context, delivering the horizontal transitions and modal choreography defined in the design blueprint without fragmenting state across components.【F:frontend/src/components/OverlayContext.tsx†L1-L74】【F:frontend/src/pages/LandingPage.tsx†L1-L120】
- **Admin gating** – Protected routes leverage the auth context to block configuration views until an admin login succeeds, preventing accidental exposure of business controls.【F:frontend/src/auth/ProtectedRoute.tsx†L1-L32】【F:frontend/src/pages/admin/AdminLayout.tsx†L1-L96】

## Outstanding Risks & Follow-Up
- **Session durability** – Sessions currently live in memory; upgrading to a signed token or Redis-backed store is required before multi-instance deployments.【F:backend/src/services/sessionService.ts†L1-L33】
- **Content versioning** – The auto-provisioned schema persists a single `site_content` record. Introducing audit logs and versioning (outlined in `project_tasks.md`) will harden rollback workflows.【F:backend/src/db/schema.ts†L1-L27】【F:project_tasks.md†L1-L63】
- **Media operations** – Background media is seeded from static files; integrating the admin media manager described in the roadmap will complete the configurable pipeline.【F:backend/data/siteContent.json†L1-L105】【F:project_tasks.md†L64-L95】
