# Project Tasks Roadmap

This roadmap aligns the nightlife landing experience with the new business platform requirements. It
tracks the remaining work to externalise all customer copy, wire it to data models and APIs, and keep
the looping hero background performant.

## 1. Configuration Inventory (hard-coded → managed)

| Customer surface | Fields now configurable | Outstanding follow-up |
| ---------------- | ----------------------- | --------------------- |
| Landing hero     | Club name, tagline, countdown label, marquee words, nav labels, CTA labels, flyer eyebrow/close copy, looping backgrounds with alt text | Add media type flag (image vs. video), focal-point coordinates, reduced-motion fallbacks |
| Upcoming event   | Event name, description, schedule, flyer asset, calendar URL, ticket URL, headliners, ticket requirement flag, concierge hotline, panel copy (eyebrow, entry messaging, calendar CTA) | Attach pricing tiers, add capacity counters, capture ticket allocation notes |
| Reserve modal    | Eyebrow, title, subtitle, description paragraphs, highlights, concierge email + subject, hotline CTA label | Connect to booking workflow status + track occupancy windows |
| Tickets modal    | Eyebrow, title, subtitle, required/complimentary messaging, CTA label | Expose per-event ticket inventory + close dates |
| Contact modal    | Eyebrow, title, subtitle, success message, all field labels/placeholders, enquiry options, submit label | Persist submitted enquiries, add attachment support |
| About modal      | Eyebrow, title, subtitle, storytelling paragraphs, operating hours rows | Enable media gallery embed + highlight timeline milestones |
| Legal modal      | Eyebrow, title, subtitle, tab ids/labels, policy paragraphs | Version policies with effective dates + regulatory tags |
| Footer           | Footer link labels + destinations (overlay vs. admin route), social icons + URLs | Add press-kit download + dynamic newsletter signup link |

## 2. Data Model & Persistence Tasks

* Define relational schema for configuration entities (`site_pages`, `page_sections`, `media_assets`,
  `cta_links`, `legal_documents`, `social_accounts`). The initial ERD lives in
  [`docs/database_schema.sql`](docs/database_schema.sql).
* Model audit trails (`content_revisions`) with JSONB diffs to track who changed what.
* Store enquiries in `partner_leads` and relate them to events when the form is launched from a
  specific flyer.
* Index frequently queried fields (`event_id`, `page_slug`, `is_active`) for low-latency reads.

## 3. API Surface Checklist

* Customer-facing GET endpoints described in [`docs/api_plan.md`](docs/api_plan.md):
  * `/api/site-content` → delivers the merged configuration payload used by the React app.
  * `/api/events/:id` → detail route supporting ticket widgets and CRM tooling.
  * `/api/hero/backgrounds` → signed URLs + focal metadata for media rotation.
* Admin endpoints:
  * `/api/admin/session` (login/logout + MFA hooks).
  * `/api/admin/site-content` (versioned CRUD with draft/publish flags).
  * `/api/admin/partner-leads` (read/export enquiries and status updates).
* Apply rate limits + JWT-based auth, and emit audit logs for any PUT/PATCH/DELETE operations.

## 4. Business Platform Build Plan

1. **Authentication foundation** — replace the demo credentials with identity provider integration
   (OAuth2 or passwordless magic links). Add role claims (`owner`, `content`, `finance`).
2. **Dashboard enrichment** — surface revenue widgets, inventory heatmaps, and background loop
   health metrics (dropped frames, load time) using observability data.
3. **Site configuration** — connect the form actions to the API, display draft vs. published status,
   and add preview links that open the public site in staged mode.
4. **Workflow automation** — trigger Slack/email alerts when critical copy or imagery is updated,
   especially for events happening within the next 72 hours.

## 5. Looping Background Delivery

* Ship adaptive loading that prefetches the next asset, with `requestIdleCallback` guards for lower
  powered devices.
* Honour `prefers-reduced-motion` by pausing transitions and showing a single hero image.
* Record hero performance metrics (LCP, CLS, frame timing) and surface them in the admin dashboard.
* Add admin previews to test image sequencing, depth-of-field layers, and colour grading against the
  Jimmy-Woo-inspired palette before publishing.

## 6. Quality Gates

* Automated lint/build + future unit tests on hero timing and admin forms.
* Accessibility review (screen reader flows, focus management, motion controls).
* Security review once the authentication service replaces the demo login.
* Content governance: ensure legal/privacy copy has effective dates and archival retention.

