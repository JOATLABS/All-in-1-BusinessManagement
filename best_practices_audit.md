# Best Practices Audit (Single-Tenant Platform)

**Architecture Note**: This system is designed as a **single-tenant application** for one nightclub. All database tables, API routes, and security controls are optimized for a single organization without multi-tenant isolation complexity.

## Backend Platform
### Current safeguards (Single-Tenant)
- **Configuration resolution** – `config.ts` walks up to the backend `package.json`, so seed data and shared assets resolve consistently in both dev (`tsx`) and production (`node dist`) runs without brittle relative paths.
  - **Single-tenant benefit**: One configuration set, no tenant-specific path resolution needed
- **Security middleware** – The Express app boots with Helmet, CORS, and JSON body limits, aligning with OWASP API hardening guidance for early-stage services.
  - **Single-tenant benefit**: CORS configuration for single domain set, no tenant-level allowlist management
- **Database provisioning** – PostgreSQL tables for admins and site content are created idempotently at startup, seeded from JSON fixtures.
  - **Single-tenant benefit**: Schema without tenant_id columns; simpler migrations and seeding
- **Validation & auth** – Login and content update flows are schema-validated with Zod, bcrypt verifies hashed credentials.
  - **Single-tenant benefit**: Authentication checks admin vs. public only—no tenant context validation

### New findings (2025-10-04) - Single-Tenant Context
- **CORS posture is overly permissive** – when `CORS_ORIGIN` is undefined the server accepts any origin. Lock this down to the customer/admin domains.
  - **Single-tenant fix**: Set single `CORS_ORIGIN` value (e.g., `https://rhythmplusroot.com`)—no tenant-specific origin lists needed
- **Rate limiting is absent** – `/api/v1/auth/login` and `/api/v1/site-content` can be brute-forced. Introduce rate limits per OWASP recommendations.
  - **Single-tenant fix**: Simple IP-based rate limiting without per-tenant quota management
  - Example: `express-rate-limit` with single configuration for all endpoints
- **Sessions are in-memory** – tokens disappear on restarts; migrate to signed JWT or Redis-backed sessions.
  - **Single-tenant fix**: Single Redis namespace for all sessions—no tenant partitioning logic needed
  - JWT structure simplified: `{ userId, role, iat, exp }` (no tenantId field)
- **Environment validation is manual** – `config.ts` throws at runtime when env vars are missing instead of validating with Zod at startup.
  - **Single-tenant fix**: Validate single credential set (one Stripe key, one SendGrid key, one database URL)
- **No structured logging or centralized error handling** – routes rely on thrown exceptions. Add request logging, correlation IDs, and error middleware.
  - **Single-tenant fix**: All logs belong to one system—no tenant filtering in log queries or observability dashboards

## Frontend Platform
### Current safeguards
- **Content sourcing** – Landing and admin surfaces consume a shared content provider so hero, overlay, and footer copy flow from one configurable payload rather than hard-coded strings.【F:frontend/src/content/SiteContentProvider.tsx†L1-L32】
- **Navigation model** – CTA buttons invoke overlay panels through a central context, delivering the horizontal transitions and modal choreography defined in the design blueprint without fragmenting state across components.【F:frontend/src/components/OverlayContext.tsx†L1-L74】【F:frontend/src/pages/LandingPage.tsx†L1-L120】
- **Admin gating** – Protected routes leverage the auth context to block configuration views until an admin login succeeds, preventing accidental exposure of business controls.【F:frontend/src/auth/ProtectedRoute.tsx†L1-L32】【F:frontend/src/pages/admin/AdminLayout.tsx†L1-L96】

### New findings (2025-10-04)
- **Reduced-motion preference not surfaced** – the hero background loop respects focal points but does not disable transitions when `prefers-reduced-motion` is set; add media-query awareness before the accessibility review.【F:frontend/src/pages/LandingPage.tsx†L32-L120】
- **Admin save UX needs optimistic validation coverage** – `parseEventDate` now guards datetime crashes, yet other fields (URLs, hotline, marquee words) rely on backend Zod alone. Expand client-side validation to reduce failed saves.【F:frontend/src/pages/admin/SiteConfiguration.tsx†L240-L326】【F:backend/src/validation/siteContent.ts†L1-L74】
- **Error handling defaults to console logging** – `useSiteContent` logs fetch failures and silently falls back to defaults. Introduce user-facing toasts and observability hooks to detect outages quickly.【F:frontend/src/hooks/useSiteContent.ts†L1-L78】

## Outstanding Risks & Follow-Up (Single-Tenant Priorities)
- **Session durability & token hygiene** – Sessions currently live in memory; upgrading to signed JWT or Redis-backed store required before deployment.
  - **Single-tenant implementation**: Simple Redis session store without tenant namespace partitioning
  - JWT payload: `{ userId: UUID, role: 'admin' | 'public', iat, exp }` (no tenant fields)
  - Tracked in [project_tasks.md](project_tasks.md) Section 9
- **Content versioning** – The schema persists a single `site_content` record. Introducing audit logs and versioning will harden rollback workflows.
  - **Single-tenant implementation**: Version table without club_id: `site_content_versions(id, content JSONB, published_at, published_by UUID FK)`
  - Rollback query: `SELECT content FROM site_content_versions WHERE published_at < ? ORDER BY published_at DESC LIMIT 1`
  - Tracked in [project_tasks.md](project_tasks.md) Section 10
- **Media operations** – Background media is seeded from static files; integrating admin media manager will complete configurable pipeline.
  - **Single-tenant implementation**: Single S3/Cloudinary bucket without tenant prefixes
  - Media table without club_id: `media_assets(id UUID, url TEXT, purpose TEXT, created_at TIMESTAMP)`
  - Tracked in [project_tasks.md](project_tasks.md) Section 6
- **Google Analytics for forecasting** – ✅ **Completed**: GA tracking added to customer pages for building sales forecasting models.
  - **Single-tenant benefit**: Single GA property captures all customer data without tenant segmentation
  - Next steps in [project_tasks.md](project_tasks.md) Section 13
