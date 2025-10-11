# Project Tasks Roadmap (Single-Tenant Build)

This roadmap follows the staged approach agreed upon in the vision and architecture documents for a **single-tenant nightclub management system**. The simplified architecture eliminates multi-tenant complexity (no tenant_id columns, no tenant resolution middleware, no organization-level isolation) to accelerate development and reduce operational overhead.

**Single-Tenant Implementation Benefits:**
- Database schema without tenant_id columns across all tables
- API routes that operate directly on the single lounge's data without context switching
- Authentication logic focused on admin vs. public access (not multi-tenant isolation)
- Simplified deployment with one application instance, one database, and one credential set

Each section corresponds to a delivery stream the business platform must support.

## 1. Surface Every Configurable Item (Customer-Facing Site)
- Hero identity: club name, marquee words, tagline, hero CTA labels, countdown copy toggle, flyer toggle label.
- Background gallery: asset URLs, alt text, depth intensity, sequencing, reduced-motion fallback.
- Event spotlight: event name, flyer asset, description, schedule window, ticket requirement flag, ticket URL, table hotline.
- Overlay content: reserve/ticket/contact/about/legal body copy, contact form labels & options, legal tabs.
- Footer: operating hours link label, legal label, contact label, social destinations, admin link target.
- Global theming: palette tokens, typography scale, animation cadence overrides.

## 2. Data Model Draft (Single-Tenant SQL Schema)
**Key Change: All club_id foreign keys removed—every table contains data for the single lounge.**

```sql
-- Single-tenant: No clubs table needed, configuration stored in site_content
site_content(id TEXT PK, hero JSONB, event JSONB, footer JSONB, reservation JSONB, overlays JSONB, updated_at TIMESTAMP)

-- Pages and sections without tenant scoping
pages(id UUID PK, slug TEXT UNIQUE, display_name TEXT, layout_config JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)
page_sections(id UUID PK, page_id UUID FK, key TEXT, content JSONB, position INT, created_at TIMESTAMP, updated_at TIMESTAMP)

-- Media assets without club_id
media_assets(id UUID PK, purpose TEXT, url TEXT, alt_text TEXT, focal_point JSONB, order_index INT, playback_hints JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)

-- Events without club_id
events(id UUID PK, title TEXT, slug TEXT, description TEXT, starts_at TIMESTAMP, ends_at TIMESTAMP, requires_ticket BOOLEAN, ticket_url TEXT, table_hotline TEXT, is_featured BOOLEAN, created_at TIMESTAMP, updated_at TIMESTAMP)
event_headliners(id UUID PK, event_id UUID FK, name TEXT, role TEXT)

-- Social links without club_id
social_links(id UUID PK, label TEXT, icon TEXT, url TEXT, is_active BOOLEAN, created_at TIMESTAMP, updated_at TIMESTAMP)

-- Admin users without club_id (single admin account)
admin_users(id UUID PK, email CITEXT UNIQUE, password_hash TEXT, role TEXT, last_login_at TIMESTAMP, created_at TIMESTAMP, updated_at TIMESTAMP)

-- Audit logs without club_id
audit_logs(id UUID PK, admin_user_id UUID FK, action TEXT, entity_type TEXT, entity_id UUID, changes JSONB, created_at TIMESTAMP)

-- Reservations without club_id
reservations(id UUID PK, event_id UUID FK, table_id UUID FK, guest_name TEXT, guest_email CITEXT, party_size INT, status TEXT, deposit_amount NUMERIC, payment_intent_id TEXT, confirmation_code TEXT, created_at TIMESTAMP, updated_at TIMESTAMP)

-- Tables without club_id
tables(id UUID PK, label TEXT, capacity INT, minimum_spend NUMERIC, status TEXT, created_at TIMESTAMP, updated_at TIMESTAMP)
```

**Query Simplification Examples:**
- Multi-tenant: `SELECT * FROM events WHERE club_id = ? AND is_featured = true`
- Single-tenant: `SELECT * FROM events WHERE is_featured = true`

- Multi-tenant: `SELECT * FROM reservations WHERE club_id = ? AND status = 'confirmed'`
- Single-tenant: `SELECT * FROM reservations WHERE status = 'confirmed'`

## 3. API Surface (Single-Tenant Routes under `/api/v1`)
**Key Change: All :clubId path parameters removed—routes operate on the single lounge's data.**

- **Auth**: `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
  - No organization context needed in tokens

- **Site Content**: `GET /site-content`, `PUT /site-content` (admin-only)
  - Direct access to the single configuration record

- **Pages**: `GET /pages`, `GET /pages/:slug`, `PUT /pages/:slug` (optimistic locking headers)
  - No club_id filtering in queries

- **Events**: `GET /events?featured=true`, `POST /events`, `GET /events/:id`, `PATCH /events/:id`, `DELETE /events/:id`
  - Headliners: `POST /events/:eventId/headliners`, `PATCH /headliners/:id`, `DELETE /headliners/:id`
  - Simplified queries: all events belong to the one venue

- **Media**: `GET /media`, `POST /media`, `PATCH /media/:id`, `DELETE /media/:id`
  - Single bucket/CDN configuration

- **Social Links**: `GET /social-links`, `POST /social-links`, `PATCH /social-links/:id`, `DELETE /social-links/:id`
  - All links belong to the one organization

- **Reservations**: `POST /reservations`, `GET /reservations/:id`, `PATCH /reservations/:id`
  - Availability: `GET /reservations/availability`
  - Admin list: `GET /admin/reservations` (returns all reservations)
  - Status transitions without tenant checks

- **Tables & Inventory**: `GET /tables`, `POST /tables`, `PATCH /tables/:id`, `DELETE /tables/:id`
  - Occupancy summaries: `GET /tables/occupancy`
  - Direct updates without tenant scoping

- **Audit Logs**: `GET /audit-logs` (admin-only, paginated)
  - All audit events for the single system

**Route Simplification Example:**
- ❌ Multi-tenant: `PATCH /api/v1/clubs/:clubId/reservations/:reservationId`
- ✅ Single-tenant: `PATCH /api/v1/reservations/:id`

## 4. Admin Platform Foundations
1. Branded login page matching the nightlife palette (email/password, validation, error messaging).
2. Primary dashboard shell showing placeholders for KPIs (next featured event, pending reservations, content status).
3. Global navigation layout with responsive collapse, user menu, and logout stub.

## 5. Customer-Site Configuration Workspace
- Create a “Site Configuration” area with tabs: Landing Hero, About Modal, Events Overlay, Contact Modal, Legal Footer.
- Map each field to the configurable items enumerated in Section 1.
- Provide preview snippets for hero word carousel and flyer states.
- Include unsaved-changes prompts and validation messaging.

## 6. Background Media Management
- Allow ordering, activation toggles, focal point adjustments, playback depth controls.
- Support still images and looping MP4/WebM with graceful degradation and `prefers-reduced-motion` handling.
- Preload hero assets and record performance telemetry (LCP, dropped frames) for monitoring.

## 7. Footer & Navigation Obligations
- Expose a compact footer row with operating hours (opens About modal), legal link, contact trigger, and an Admin link pointing to the login page.
- Ensure CTA ribbon buttons trigger horizontal modal transitions without layout jitter.

## 8. Workflow Validation
- Manual walkthrough: update hero copy via admin → publish → verify on customer site.
- Automated checks: `npm run lint`, `npm run build`, component tests for forms, integration tests for login → dashboard → update flow.
- Performance guardrail: run Lighthouse/WebPageTest to confirm smooth background loop across devices, respecting reduced-motion.

## 9. Security & Reliability Hardening (Single-Tenant Focused)
- Introduce configurable CORS allowlists, request rate limiting, and structured logging before exposing the API publicly
  - **Single-tenant benefit**: Rate limiting configuration is simpler without per-tenant quotas
- Replace in-memory sessions with signed JWT or Redis-backed tokens, add refresh/rotation workflows
  - **Single-tenant benefit**: No tenant context in tokens—just admin/public role distinction
  - Session storage simplified: single Redis namespace, no tenant partitioning
- Validate environment configuration with Zod at startup, fail fast with actionable errors for missing secrets
  - **Single-tenant benefit**: One set of credentials to validate (Stripe, SendGrid, database, etc.)
- Implement centralized error middleware plus correlation IDs; ship logs to observability stack
  - **Single-tenant benefit**: All logs belong to one system—no tenant filtering in log aggregation queries

## 10. Customer ↔ Admin Data Synchronisation (Single-Tenant)
- Replace static site-content fetch with API-backed responses
  - **Single-tenant benefit**: Direct `SELECT * FROM site_content WHERE id = 'default'`—no tenant filtering
  - No need for service-to-service authentication between tenant contexts
- Persist configuration revisions and expose publish history for rollback capability
  - **Single-tenant benefit**: Version history table without club_id: `site_content_versions(id, content JSONB, published_at TIMESTAMP)`
- Connect hero CTA panels to reservation/ticket APIs for real-time availability
  - **Single-tenant benefit**: Simpler query: `SELECT SUM(capacity - reserved) FROM tables WHERE status = 'active'`
- Surface reservation and table inventory summaries on admin dashboard
  - **Single-tenant benefit**: Dashboard queries without tenant joins or filters
  - Example: `SELECT COUNT(*), status FROM reservations GROUP BY status`

## 11. Reservation & Inventory Experience (Single-Tenant)
- Build reservation intake forms validating party size against table capacity, deposits, VIP contract requirements
  - **Single-tenant benefit**: Form validation logic without tenant-specific rules or configurations
  - Direct table lookup: `SELECT * FROM tables WHERE capacity >= ? AND status = 'active'`
- Provide admin tooling to block tables, adjust minimum spends, manage promoter allocations
  - **Single-tenant benefit**: Direct updates without tenant authorization checks
  - Example: `UPDATE tables SET status = 'blocked', blocked_reason = ? WHERE id = ?`
- Generate customer confirmations and promoter notifications via SendGrid/Twilio
  - **Single-tenant benefit**: Single sender configuration, no tenant-specific email templates or SMS sender IDs
- Add analytics tiles for conversion, show-up rates, bottle sales
  - **Single-tenant benefit**: Aggregate queries without GROUP BY club_id
  - Example: `SELECT DATE(created_at), COUNT(*), AVG(deposit_amount) FROM reservations WHERE status = 'confirmed' GROUP BY DATE(created_at)`

## 12. Advanced Analytics & Optimisation Enablement (Single-Tenant)
- Stand up event-stream pipeline emitting reservations, table state changes, POS orders, staffing updates
  - **Single-tenant benefit**: No tenant routing in event streams—all events flow to single analytics warehouse
  - Simplified Kafka/Redpanda topics: `reservations`, `tables`, `pos_orders` (no club_id partitioning)
- Deliver prescriptive dashboards visualizing demand forecasts, labor utilization, table turn targets
  - **Single-tenant benefit**: Dashboards query single data set without tenant filtering or access controls
  - Direct drill-through: Click metric → filter transactional table without tenant context
- Integrate optimization solvers (Gurobi, OR-Tools) for scenario testing on seating, staffing, promotions
  - **Single-tenant benefit**: Optimization models trained on single venue's data—no cross-tenant data isolation
  - Recommendations apply directly to the one system without organization targeting
- Implement variance analysis comparing theoretical vs. actual inventory and revenue
  - **Single-tenant benefit**: Single source of truth for all metrics—no tenant reconciliation
  - Query: `SELECT expected_revenue - actual_revenue FROM daily_summary WHERE date >= ?`
- Establish governance gates for AI/optimization outputs with review queues and rollback capability
  - **Single-tenant benefit**: Single approval workflow—no per-tenant governance policies or controls

## 13. Google Analytics Integration (Customer Forecasting)
- ✅ **Completed**: Google Analytics tracking script added to customer-facing pages
  - Configured via `VITE_GA_MEASUREMENT_ID` environment variable
  - Tracks landing page (`/`) and reservation page (`/reserve`)
  - Helper functions available for custom event tracking: `trackEvent()`, `trackPageView()`
  - **Single-tenant benefit**: Single GA property tracking all customer interactions—no tenant-level analytics partitioning
- **Next Steps for Forecasting**:
  - Track reservation funnel events: view tier, select tier, start payment, complete reservation
  - Track engagement metrics: time on page, scroll depth, CTA clicks
  - Export GA4 data to BigQuery for ML model training
  - Build prediction models for: nightly reservation demand, tier preferences, conversion rates
  - **Single-tenant benefit**: All historical data belongs to one venue—simpler feature engineering and model training

