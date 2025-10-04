# Project Tasks Roadmap (Version 2 Alignment)

This roadmap follows the staged approach agreed upon in the vision and architecture documents so that
no hard-coded copy or brittle shortcuts are introduced. Each section corresponds to a delivery stream the
business platform must support.

## 1. Surface Every Configurable Item (Customer-Facing Site)
- Hero identity: club name, marquee words, tagline, hero CTA labels, countdown copy toggle, flyer toggle label.
- Background gallery: asset URLs, alt text, depth intensity, sequencing, reduced-motion fallback.
- Event spotlight: event name, flyer asset, description, schedule window, ticket requirement flag, ticket URL, table hotline.
- Overlay content: reserve/ticket/contact/about/legal body copy, contact form labels & options, legal tabs.
- Footer: operating hours link label, legal label, contact label, social destinations, admin link target.
- Global theming: palette tokens, typography scale, animation cadence overrides.

## 2. Data Model Draft (SQL-Oriented)
```sql
clubs(id UUID PK, name TEXT, tagline TEXT, palette JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)
club_pages(id UUID PK, club_id UUID FK, slug TEXT UNIQUE, display_name TEXT, layout_config JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)
page_sections(id UUID PK, page_id UUID FK, key TEXT, content JSONB, position INT, created_at TIMESTAMP, updated_at TIMESTAMP)
media_assets(id UUID PK, club_id UUID FK, purpose TEXT, url TEXT, alt_text TEXT, focal_point JSONB, order_index INT, playback_hints JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)
events(id UUID PK, club_id UUID FK, title TEXT, slug TEXT, description TEXT, starts_at TIMESTAMP, ends_at TIMESTAMP, requires_ticket BOOLEAN, ticket_url TEXT, table_hotline TEXT, is_featured BOOLEAN, created_at TIMESTAMP, updated_at TIMESTAMP)
event_headliners(id UUID PK, event_id UUID FK, name TEXT, role TEXT)
social_links(id UUID PK, club_id UUID FK, label TEXT, icon TEXT, url TEXT, is_active BOOLEAN, created_at TIMESTAMP, updated_at TIMESTAMP)
admin_users(id UUID PK, club_id UUID FK, email CITEXT UNIQUE, password_hash TEXT, role TEXT, last_login_at TIMESTAMP, created_at TIMESTAMP, updated_at TIMESTAMP)
audit_logs(id UUID PK, club_id UUID FK, admin_user_id UUID FK, action TEXT, entity_type TEXT, entity_id UUID, changes JSONB, created_at TIMESTAMP)
reservations(id UUID PK, club_id UUID FK, event_id UUID FK, table_id UUID FK, guest_name TEXT, guest_email CITEXT, party_size INT, status TEXT, deposit_amount NUMERIC, created_at TIMESTAMP, updated_at TIMESTAMP)
tables(id UUID PK, club_id UUID FK, label TEXT, capacity INT, minimum_spend NUMERIC, status TEXT, created_at TIMESTAMP, updated_at TIMESTAMP)
```

## 3. API Surface (Versioned under `/api/v1`)
- Auth: `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`.
- Club branding: `GET/PATCH /clubs/:clubId`.
- Pages: `GET /clubs/:clubId/pages`, `GET /clubs/:clubId/pages/:slug`, `PUT /clubs/:clubId/pages/:slug` (optimistic locking headers).
- Events: `GET /clubs/:clubId/events?featured=true`, CRUD endpoints for events/headliners, availability summaries for featured event countdowns.
- Media: `GET /clubs/:clubId/media`, `POST /clubs/:clubId/media`, `PATCH /clubs/:clubId/media/:mediaId`.
- Social/footer: `GET /clubs/:clubId/social-links`, `PATCH /clubs/:clubId/social-links/:id`.
- Reservations: `POST /clubs/:clubId/reservations`, `GET /clubs/:clubId/reservations/:reservationId`, `PATCH /clubs/:clubId/reservations/:reservationId` (status transitions, deposit reconciliation).
- Tables & inventory: `GET /clubs/:clubId/tables`, `PATCH /clubs/:clubId/tables/:tableId` (availability, minimum spend), occupancy summaries for the dashboard.
- Audit: `GET /clubs/:clubId/audit-logs` (role-gated, paginated).

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

## 9. Security & Reliability Hardening
- Introduce configurable CORS allowlists, request rate limiting, and structured logging before exposing the API publicly.【F:backend/src/app.ts†L1-L27】
- Replace in-memory sessions with signed JWT or Redis-backed tokens, add refresh/rotation workflows, and persist session metadata for audits.【F:backend/src/services/sessionService.ts†L1-L33】
- Validate environment configuration with Zod (or similar) at startup, and fail fast with actionable errors for missing secrets.【F:backend/src/config.ts†L49-L64】
- Implement centralized error middleware plus correlation IDs; ship logs to the observability stack defined in the architecture roadmap.

## 10. Customer ↔ Admin Data Synchronisation
- Replace the static site-content fetch with API-backed responses authenticated via service tokens when the admin publishes updates.【F:frontend/src/hooks/useSiteContent.ts†L55-L78】
- Persist configuration revisions and expose publish history so admins can roll back to a prior hero/event state.【F:backend/src/db/schema.ts†L1-L27】
- Connect hero CTA panels to reservation/ticket APIs so availability, deposit requirements, and partner contact routing stay accurate in real time.
- Surface reservation and table inventory summaries on the admin dashboard; clicking through should open the reservation management workspace with inline status transitions.

## 11. Reservation & Inventory Experience
- Build reservation intake forms that validate party size against table capacity, support deposits, and capture contract requirements for VIP bookings.
- Provide admin tooling to block tables (maintenance/holds), adjust minimum spends, and manage promoter allocations without editing raw data.
- Generate customer confirmations and promoter notifications (email/SMS) using the communication providers identified in the architecture roadmap.
- Add analytics tiles for conversion, show-up rates, and bottle sales to guide operational decisions once live data flows in.
