# Project Tasks Roadmap

## 1. Customer-Facing Content to Externalise
This list captures every text label, image, or behavioural flag that must be configurable from the business management platform instead of being hard-coded in the client. Each item references the current UI surface so it can be mapped to admin forms and content models.

- **Navigation & overlays**: Header buttons (About, Events, Reserve, Contact), hero CTA buttons (Upcoming Event, Table Reservation, Ticket Pre-Sale, Contact Us), overlay titles/subtitles, countdown copy, flyer labels (eyebrow, dismiss CTA), panel copy for reservations, ticketing, about story paragraphs, contact form fields/placeholders, legal tab labels & text, confirmation messages.
- **Hero identity**: Club name, marquee words, tagline, background gallery (URLs, alt text, focal points, loop order), countdown enable/disable, 3D depth intensity, transition cadence, reduced-motion variant.
- **Event experience**: Event name, start/end timestamps, flyer asset, descriptive copy, headliner list, ticketing flags/URLs, table hotline, event-specific CTA copy, calendar deep-link metadata.
- **Footer**: Operating hours link label, legal link label, admin link label, social destinations & icon selection.
- **Contact routing**: Category options (Food & Drink, Private Hire, etc.), form instructions, submission endpoints, escalation email templates.
- **Background performance**: Media asset renditions, preload priority, fallback colour palettes for dark grain overlay, device-specific sequencing.

These artefacts inform both the data model and the admin UI fields.

## 2. Proposed Data Model (Database Schemas)
To support configuration and future analytics, model the following relational schema (can be implemented in PostgreSQL or a comparable SQL store):

- `clubs`
  - `id` (PK, UUID)
  - `name`
  - `tagline`
  - `primary_palette` (JSONB for colours)
  - `created_at`, `updated_at`

- `club_pages`
  - `id` (PK, UUID)
  - `club_id` (FK → clubs)
  - `slug` (e.g., `landing`, `about`, `legal`)
  - `display_name`
  - `layout_config` (JSONB for layout flags, transitions)
  - timestamps

- `page_sections`
  - `id` (PK, UUID)
  - `page_id` (FK → club_pages)
  - `key` (e.g., `hero`, `ctaRibbon`, `footer`)
  - `content` (JSONB storing structured copy/links/cta labels)
  - `position`
  - timestamps

- `events`
  - `id` (PK, UUID)
  - `club_id` (FK → clubs)
  - `title`
  - `slug`
  - `description`
  - `starts_at`, `ends_at`
  - `requires_ticket` (boolean)
  - `ticket_url`
  - `table_hotline`
  - `is_featured` (boolean for hero countdown)
  - timestamps

- `event_headliners`
  - `id` (PK, UUID)
  - `event_id` (FK → events)
  - `name`
  - `role` (DJ, Host, Visual Artist)

- `media_assets`
  - `id` (PK, UUID)
  - `club_id` (FK → clubs)
  - `purpose` (ENUM: hero_background, flyer, gallery)
  - `url`
  - `alt_text`
  - `focal_point` (point / JSONB)
  - `order_index`
  - `playback_hints` (JSONB for loop duration, depth intensity)
  - timestamps

- `social_links`
  - `id` (PK, UUID)
  - `club_id` (FK → clubs)
  - `label`
  - `icon`
  - `url`
  - `is_active`
  - timestamps

- `admin_users`
  - `id` (PK, UUID)
  - `club_id`
  - `email`
  - `password_hash`
  - `role` (owner, content_manager, promoter)
  - `last_login_at`
  - timestamps

- `audit_logs`
  - `id`
  - `club_id`
  - `admin_user_id`
  - `action`
  - `entity_type`
  - `entity_id`
  - `changes` (JSONB)
  - `created_at`

## 3. API Surface
Design RESTful endpoints (versioned under `/api/v1`) to orchestrate the admin platform and the customer experience:

- **Authentication**
  - `POST /auth/login` → email/password → JWT refresh/access pair.
  - `POST /auth/logout` → invalidate refresh token.
  - `POST /auth/refresh` → rotate access token.

- **Club configuration**
  - `GET /clubs/:clubId` → base branding & palette.
  - `PATCH /clubs/:clubId` → update name, tagline, palette.
  - `GET /clubs/:clubId/pages` → list page shells.
  - `GET /clubs/:clubId/pages/:slug` → fetch section content.
  - `PUT /clubs/:clubId/pages/:slug` → replace section content (with optimistic locking via `If-Match`).

- **Events**
  - `GET /clubs/:clubId/events?featured=true` → hero event & countdown.
  - `POST /clubs/:clubId/events` → create.
  - `PATCH /clubs/:clubId/events/:eventId` → update scheduling, copy, ticket flag.
  - `POST /clubs/:clubId/events/:eventId/headliners` / `DELETE` for headliner management.

- **Media library**
  - `GET /clubs/:clubId/media?purpose=hero_background` → paginated assets.
  - `POST /clubs/:clubId/media` → upload metadata from CDN.
  - `PATCH /clubs/:clubId/media/:mediaId` → update ordering, focal point, playback hints.

- **Social links & footer**
  - `GET /clubs/:clubId/social-links`
  - `PATCH /clubs/:clubId/social-links/:id`

- **Audit**
  - `GET /clubs/:clubId/audit-logs` (role-based access, pagination).

All endpoints should enforce role-based access control and emit structured validation errors for admin UI consumption.

## 4. Admin Platform Implementation Plan
1. **Authentication shell**
   - Build a branded login screen with email + password, background overlay, and error handling.
   - Integrate form validation and loading states.
2. **Primary dashboard**
   - Provide KPI tiles (next event, reservations pending, content status) using placeholder data until APIs are wired.
   - Include quick links to edit hero content, manage events, review ticketing.
   - Honour the nightclub colour palette (deep purple/gold accents, dark grain background) for consistency with the public site.
3. **Navigation & layout**
   - Sticky sidebar or top-bar with responsive collapse for mobile.
   - User avatar menu with logout and profile settings placeholders.
4. **Customer-site configuration workspace**
   - Tabbed interface for Landing Hero, About Modal, Events Overlay, Contact Modal, Footer.
   - Each tab surfaces forms bound to the configuration items listed in Section 1.
   - Provide preview snippets (e.g., hero word carousel preview) and validation messaging.
5. **Background media manager**
   - Allow admins to order hero backgrounds, adjust focal points, set depth intensity, toggle media active/inactive.
6. **Audit & publishing**
   - Display change history per section with diff summaries and publish states.

## 5. Customer-Facing Updates Required Now
- Add an `Admin` footer link that routes to `/admin/login` without disrupting the cinematic hero.
- Ensure the hero continues to respect configurable content supplied by the admin platform.
- Keep transitions smooth (prefetch hero backgrounds, maintain 3D layering) to preserve first impression quality.

## 6. Looping Background Delivery Tasks
- Implement asset preloading & GPU-accelerated depth (CSS `translateZ`, perspective) with graceful degradation.
- Support both still images and MP4/WebM loops with autoplay muted/loop attributes and fallback frames.
- Honour `prefers-reduced-motion` by freezing on the first frame and disabling depth shifts.
- Instrument runtime metrics (LCP, frame-drop counts) and bubble them into the admin dashboard.

## 7. Test Strategy
- Automated lint/build for both customer and admin surfaces (`npm run lint`, `npm run build`).
- Component tests for configuration forms (field validation, unsaved-changes prompts).
- Integration tests covering login → dashboard → configuration update flows.
- Performance regression checks on hero background transitions (WebPageTest or Lighthouse CI) before releases.
