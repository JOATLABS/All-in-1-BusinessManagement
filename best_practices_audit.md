# Best Practices Audit (Backend & Frontend Platform)

## Backend Platform
### Current safeguards
- **Configuration resolution** – `config.ts` walks up to the backend `package.json`, so seed data and shared assets resolve consistently in both dev (`tsx`) and production (`node dist`) runs without brittle relative paths.【F:backend/src/config.ts†L1-L67】
- **Security middleware** – The Express app boots with Helmet, CORS, and JSON body limits, aligning with OWASP API hardening guidance for early-stage services.【F:backend/src/app.ts†L1-L27】【3fd5cb†L1-L23】
- **Database provisioning** – PostgreSQL tables for admins and site content are created idempotently at startup, then seeded from JSON fixtures so deployments stay repeatable while the long-term schema strategy is designed.【F:backend/src/db/index.ts†L1-L62】【F:backend/src/db/seed.ts†L1-L62】
- **Validation & auth** – Login and content update flows are schema-validated with Zod, bcrypt verifies hashed credentials, and authenticated admin sessions gate content mutations to keep the configuration surface controlled.【F:backend/src/routes/auth.ts†L1-L40】【F:backend/src/routes/siteContent.ts†L1-L24】【F:backend/src/services/authService.ts†L1-L19】【F:backend/src/validation/siteContent.ts†L1-L74】

### New findings (2025-10-04)
- **CORS posture is overly permissive** – when `CORS_ORIGIN` is undefined the server accepts any origin. Lock this down to the customer/admin domains and capture it in infrastructure-as-code before launch.【F:backend/src/app.ts†L11-L17】
- **Rate limiting is absent** – `/api/v1/auth/login` and `/api/v1/site-content` can be brute-forced because no throttling middleware is registered. Introduce rate limits in line with OWASP’s recommendation to minimise abuse of stateless endpoints.【F:backend/src/app.ts†L1-L27】【3fd5cb†L1-L23】
- **Sessions are in-memory** – tokens disappear on restarts and cannot scale horizontally; migrate to signed JWT or Redis-backed sessions with rotation and revocation support.【F:backend/src/services/sessionService.ts†L1-L33】
- **Environment validation is manual** – `config.ts` throws at runtime when env vars are missing instead of validating them through a schema (e.g., Zod) at startup, increasing misconfiguration risk.【F:backend/src/config.ts†L49-L64】
- **No structured logging or centralized error handling** – routes return JSON but rely on thrown exceptions. Add request logging, correlation IDs, and error middleware for observability before production cutover.【F:backend/src/routes/siteContent.ts†L1-L24】【F:backend/src/routes/auth.ts†L1-L40】

## Frontend Platform
### Current safeguards
- **Content sourcing** – Landing and admin surfaces consume a shared content provider so hero, overlay, and footer copy flow from one configurable payload rather than hard-coded strings.【F:frontend/src/content/SiteContentProvider.tsx†L1-L32】
- **Navigation model** – CTA buttons invoke overlay panels through a central context, delivering the horizontal transitions and modal choreography defined in the design blueprint without fragmenting state across components.【F:frontend/src/components/OverlayContext.tsx†L1-L74】【F:frontend/src/pages/LandingPage.tsx†L1-L120】
- **Admin gating** – Protected routes leverage the auth context to block configuration views until an admin login succeeds, preventing accidental exposure of business controls.【F:frontend/src/auth/ProtectedRoute.tsx†L1-L32】【F:frontend/src/pages/admin/AdminLayout.tsx†L1-L96】

### New findings (2025-10-04)
- **Reduced-motion preference not surfaced** – the hero background loop respects focal points but does not disable transitions when `prefers-reduced-motion` is set; add media-query awareness before the accessibility review.【F:frontend/src/pages/LandingPage.tsx†L32-L120】
- **Admin save UX needs optimistic validation coverage** – `parseEventDate` now guards datetime crashes, yet other fields (URLs, hotline, marquee words) rely on backend Zod alone. Expand client-side validation to reduce failed saves.【F:frontend/src/pages/admin/SiteConfiguration.tsx†L240-L326】【F:backend/src/validation/siteContent.ts†L1-L74】
- **Error handling defaults to console logging** – `useSiteContent` logs fetch failures and silently falls back to defaults. Introduce user-facing toasts and observability hooks to detect outages quickly.【F:frontend/src/hooks/useSiteContent.ts†L1-L78】

## Outstanding Risks & Follow-Up
- **Session durability & token hygiene** – Sessions currently live in memory; upgrading to a signed token or Redis-backed store (tracked in `project_tasks.md`) is required before multi-instance deployments.【F:backend/src/services/sessionService.ts†L1-L33】【F:project_tasks.md†L96-L129】
- **Content versioning** – The auto-provisioned schema persists a single `site_content` record. Introducing audit logs and versioning (outlined in `project_tasks.md`) will harden rollback workflows.【F:backend/src/db/schema.ts†L1-L27】【F:project_tasks.md†L36-L71】
- **Media operations** – Background media is seeded from static files; integrating the admin media manager described in the roadmap will complete the configurable pipeline and allow CDN-backed delivery.【F:backend/data/siteContent.json†L1-L105】【F:project_tasks.md†L72-L95】
