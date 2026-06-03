# African Social Club Platform Roadmap Plan

Status: Draft v1
Owner: Emmanuel Akinwale / JOATLabs
Related documents:

- `docs/social-club-platform-architecture.md`
- `docs/social-club-branding-design-spec.md`

## 1. Roadmap purpose

This roadmap converts the current OjaPlus/Rhythm+Root nightclub platform into an invitation-based African community social club platform with:

- A retained premium web homepage.
- A public request-invite/application flow.
- A protected admin curation console.
- A React Native mobile app for iOS and Android members.
- A phased vendor and partner workflow.
- A long-term foundation for OKC, Tulsa, and future underserved cities.

The roadmap is intended to be implementation-ready. Each phase has a goal, scope, technical work, acceptance criteria, and major risks.

## 2. Current repo realities to respect

The current repo is not a blank slate. It already includes:

- Root monorepo scripts for backend/frontend development, build, lint, and seed.
- Express + TypeScript backend.
- PostgreSQL with Drizzle ORM.
- Vite + React + TypeScript frontend.
- Public landing page with cinematic hero and dynamic event content.
- Admin dashboard and protected routes.
- Site configuration workspace.
- Events, reservations, tickets, media, admin users, sessions, and audit schema foundations.
- Media management with R2/S3 direction.
- QR/ticketing dependencies.
- Role-based admin work already started.

The roadmap should build on this instead of replacing everything.

## 3. Delivery principles

1. Keep the current homepage visual direction.
2. Convert the product language before expanding too many features.
3. Build the application and approval flow before the mobile app.
4. Build member trust before launching member-to-member messaging.
5. Launch with manual curation before algorithmic recommendations.
6. Keep the backend API shared across web and mobile.
7. Do not introduce multi-tenant SaaS complexity during MVP.
8. Every admin action affecting members, applications, events, vendors, and payments must be auditable.

## 4. Phase overview

| Phase | Name | Outcome |
|---|---|---|
| 0 | Repo audit and conversion planning | Clear map of what to keep, refactor, retire, and build |
| 1 | Brand/content conversion | Public site becomes invitation-based social club portal |
| 2 | Application and admin review MVP | Visitors can apply; admins can approve/waitlist/reject |
| 3 | Member data model and onboarding | Approved users become active members |
| 4 | Event RSVP platform | Members can RSVP to curated events |
| 5 | React Native member app MVP | iOS/Android members can browse, RSVP, and show QR pass |
| 6 | Community circles and feedback | Members join groups and feedback improves curation |
| 7 | Vendor and partner workflow | Vendors/venues can be managed and assigned to events |
| 8 | Payments and membership tiers | Stripe-backed membership and paid event flows |
| 9 | Hardening, analytics, and launch | Production-ready release for OKC beta |
| 10 | Tulsa expansion and recommendation engine | Multi-city growth with smarter curation |

## 5. Phase 0 — Repo audit and conversion planning

### Goal

Confirm current implementation reality and create a migration checklist before changing domain behavior.

### Scope

- Audit backend routes.
- Audit frontend routes and CTAs.
- Audit schema and migrations.
- Audit current auth/session status.
- Audit admin role enforcement.
- Audit build/test reliability.
- Identify what becomes social-club functionality.

### Technical tasks

Backend:

- Review `backend/src/app.ts` route registration.
- Review all route files under `backend/src/routes`.
- Confirm whether JWT auth and refresh tokens are fully implemented.
- Confirm role middleware is applied to admin write routes.
- Confirm audit logs are actually written when admin actions occur.
- Confirm rate limiting and CORS coverage.
- Confirm Stripe, ticket, and QR implementation status.

Frontend:

- Review `frontend/src/App.tsx` routes.
- Review `LandingPage.tsx` CTAs and overlays.
- Review `ReserveTablePage` and decide whether to convert to application flow.
- Review admin pages for reuse.
- Review `SiteConfiguration` extensibility.

Data:

- Map old `customers` to future `users` or `member_profiles`.
- Map old `reservations` to future RSVP concepts where appropriate.
- Map old `tickets` to future RSVP/guest QR pass.
- Preserve `events` and extend it.

### Acceptance criteria

- Audit notes added to `docs/FEATURE_DECISION_LOG.md` or a new `docs/social-club-repo-audit.md`.
- Build/lint status documented.
- Migration issue list created.
- No domain migration starts until the audit identifies blockers.

### Risks

- Current auth may be partially scaffolded and not production-ready.
- Existing reservation language may be deeply embedded in frontend copy.
- Current schema may require careful migrations rather than table replacement.

## 6. Phase 1 — Brand/content conversion

### Goal

Convert the public-facing platform from nightclub reservation language into invitation-based social club language while preserving the existing homepage design.

### Scope

- Rebrand homepage content.
- Change navigation labels.
- Change CTAs.
- Add membership/about/experience content blocks.
- Add partner/vendor inquiry CTA.
- Preserve media manager and hero design.

### Technical tasks

- Extend `site_content` with `brand`, `membership`, `experiences`, and `application` sections.
- Update seed content.
- Replace `Reserve` nav label with `Request Invite`.
- Replace CTA row:
  - `Upcoming Event` -> `Upcoming Experiences`
  - `Table Reservation` -> `Request Invite`
  - `Ticket Pre-Sale` -> `Membership`
  - `Contact Us` -> `Partner With Us`
- Add `/apply` route placeholder.
- Add `/partner` route placeholder.
- Update overlay copy in Site Configuration.
- Add legal/community standards link.

### Acceptance criteria

- Homepage no longer reads as a nightclub-only site.
- Public user can understand membership and request an invite.
- Existing hero media, animation, and footer still work.
- Admin can still edit core homepage content.
- Mobile responsive layout passes smoke test.

### Risks

- Copy change without data model change can create misleading UX. Keep clear MVP status.
- Design may remain too nightlife-heavy if imagery is not updated.

## 7. Phase 2 — Application and admin review MVP

### Goal

Visitors can request an invite and admins can review applications.

### Scope

- Application form.
- Application status page.
- Admin application review page.
- Email notifications for submitted and decision states.

### Data model

Add:

- `users` or applicant identity model.
- `member_applications`.
- `interests`.
- `cities`.
- Optional `application_notes` if notes should not live in JSONB.

### API routes

```text
POST /api/v1/applications
GET  /api/v1/me/application
PATCH /api/v1/me/application
POST /api/v1/me/application/submit
GET  /api/v1/admin/applications
GET  /api/v1/admin/applications/:id
PATCH /api/v1/admin/applications/:id/status
POST /api/v1/admin/applications/:id/notes
```

### Web routes

```text
/apply
/application/status
/admin/applications
```

### Admin workflow

Statuses:

- submitted
- under_review
- needs_more_info
- waitlisted
- invited
- approved
- rejected
- withdrawn

Admin actions:

- Open application.
- Add internal notes.
- Add tags.
- Assign reviewer.
- Request more info.
- Waitlist.
- Invite.
- Reject.

### Acceptance criteria

- Visitor can submit application.
- Admin can see applications in dashboard.
- Admin can update status.
- Applicant sees correct status copy.
- Audit log records status changes.
- Email notification is queued or sent for submitted, waitlisted, invited, rejected, and needs-more-info states.

### Risks

- Sensitive application data requires privacy policy updates.
- If auth is not stable, applicant status page may need temporary email-token access.

## 8. Phase 3 — Member data model and onboarding

### Goal

Approved applicants become members with profiles, interests, city association, and membership status.

### Scope

- Member profile creation.
- Interest selection.
- Community guidelines acceptance.
- Membership status.
- Admin member list.

### Data model

Add:

- `member_profiles`
- `memberships`
- `member_tags`
- `member_notes`
- `community_agreements`

### API routes

```text
GET   /api/v1/me/profile
PATCH /api/v1/me/profile
GET   /api/v1/me/membership
GET   /api/v1/admin/members
GET   /api/v1/admin/members/:id
PATCH /api/v1/admin/members/:id/status
POST  /api/v1/admin/members/:id/notes
```

### Acceptance criteria

- Invited applicant can complete onboarding.
- Member profile is created.
- Interests persist.
- Community agreement acceptance is recorded.
- Admin can view member list and member detail.
- Member status can be changed by authorized admin.

### Risks

- Too many onboarding questions can reduce activation.
- Optional cultural/demographic fields must be clearly explained.

## 9. Phase 4 — Event RSVP platform

### Goal

Convert the event system from public nightlife event listings into member-centered curated event management.

### Scope

- Extend event model.
- Event targeting.
- RSVP request/confirmation.
- Guest pass request.
- QR pass generation.
- Event roster and check-in.

### Data model

Extend/add:

- Extend `events` with city, type, RSVP policy, location visibility, guest rules, membership tiers allowed, interest targeting.
- Add `rsvps`.
- Add `guest_passes`.
- Add `check_ins`.
- Add `event_segments`.

### API routes

```text
GET   /api/v1/events
GET   /api/v1/events/:id
POST  /api/v1/events/:id/rsvp
PATCH /api/v1/rsvps/:id
POST  /api/v1/rsvps/:id/guest-passes
GET   /api/v1/me/rsvps
GET   /api/v1/admin/events/:id/roster
POST  /api/v1/admin/events/:id/check-in
PATCH /api/v1/admin/rsvps/:id/status
```

### Acceptance criteria

- Admin can create member-only events.
- Event can be targeted by city, interest, membership tier, or manual invite.
- Member can RSVP if eligible.
- RSVP can be confirmed, waitlisted, cancelled, checked in, or marked no-show.
- QR pass is generated for confirmed RSVP.
- Admin can check in member from roster.

### Risks

- Location privacy must be correct before real events are listed.
- Guest pass logic can become complex; keep MVP simple.

## 10. Phase 5 — React Native member app MVP

### Goal

Launch a mobile member app for iOS and Android that supports member login, onboarding, event discovery, RSVP, and QR passes.

### Stack

- Expo React Native.
- TypeScript.
- Expo Router or React Navigation.
- TanStack Query.
- React Hook Form + Zod.
- Expo SecureStore.
- Expo Notifications.
- EAS Build.

### Repo tasks

- Create `/mobile` Expo app.
- Add root scripts:
  - `mobile:dev`
  - `mobile:ios`
  - `mobile:android`
  - `mobile:lint`
  - `mobile:typecheck`
- Add shared API client package or `/shared` folder.
- Configure environment variables for API base URL.
- Add app icon/splash placeholder.

### Mobile screens

MVP:

- Login.
- Application status or invite acceptance.
- Onboarding/profile setup.
- Home.
- Events list.
- Event detail.
- RSVP confirmation.
- QR pass.
- Profile/settings.

### Acceptance criteria

- Member can log in securely.
- Access token and refresh token are stored securely.
- Member can view eligible events.
- Member can RSVP.
- Member can view QR pass offline after confirmation.
- Member can edit basic profile/interests.
- App builds through EAS for iOS and Android dev profiles.

### Risks

- Auth refresh behavior must be mobile-safe.
- Push notifications require Apple/Google setup.
- Payment flows must be reviewed for App Store and Play Store policy.

## 11. Phase 6 — Community circles and feedback

### Goal

Add deeper community loops without launching a noisy social feed.

### Scope

- Circles.
- Event feedback.
- Connection requests after shared event.
- Member suggestions.

### Data model

Add:

- `circles`
- `circle_members`
- `event_feedback`
- `member_connections`

### Acceptance criteria

- Admin can create circles.
- Members can request to join circles.
- Members can submit post-event feedback.
- Admin can view event feedback summary.
- Members can request connection only with eligible context, such as shared event attendance.

### Risks

- Messaging/moderation can become heavy. Avoid full chat in this phase.
- Member directory privacy must be respected.

## 12. Phase 7 — Vendor and partner workflow

### Goal

Support restaurants, venues, DJs, photographers, caterers, sponsors, and other partners.

### Scope

- Public partner inquiry.
- Admin vendor CRM.
- Vendor offerings.
- Assign vendor to event.
- Basic event logistics checklist.

### Data model

Add:

- `vendors`
- `venues`
- `vendor_offerings`
- `event_vendors`

### Web routes

```text
/partner
/admin/vendors
/admin/vendors/:id
```

### Acceptance criteria

- Vendor can submit inquiry.
- Admin can approve vendor.
- Admin can create offerings.
- Admin can assign vendor to event.
- Event detail shows internal vendor logistics to admin.

### Risks

- Vendor portal should not be built before internal vendor workflow is validated.
- Agreements/invoices can be manual at first.

## 13. Phase 8 — Payments and membership tiers

### Goal

Add monetization through membership and event payments.

### Scope

- Founding member tier.
- Standard member tier.
- Premium member tier.
- Stripe Checkout web flow.
- Paid event/guest pass support.
- Stripe webhooks.

### Payment rules

Recommended MVP:

- Application is free.
- Approval happens before checkout.
- Membership payment happens on web.
- Mobile app reads membership status.
- Paid event checkout can start on web until mobile policy is reviewed.

### Acceptance criteria

- Stripe customer created for member.
- Membership checkout activates membership after webhook success.
- Failed/past-due membership status is reflected in backend.
- Admin can comp or override membership.
- Event payment status is linked to RSVP.

### Risks

- App Store/Play Store rules for payments must be reviewed before mobile checkout.
- Webhooks must be idempotent and signed.

## 14. Phase 9 — Hardening, analytics, and OKC beta launch

### Goal

Prepare for real beta users and real events.

### Scope

- Security hardening.
- Audit logs.
- Rate limits.
- Observability.
- Analytics dashboard.
- E2E test coverage.
- Operational runbooks.

### Required launch checklist

Security:

- JWT access + refresh token rotation complete.
- Role checks on all admin routes.
- Rate limits on auth/application/RSVP.
- Audit logs for admin actions.
- Environment validation at startup.
- Centralized error logging.
- CORS allowlist configured.

Product:

- Application flow tested.
- Admin review tested.
- Member onboarding tested.
- Event RSVP tested.
- QR check-in tested.
- Feedback tested.
- Privacy/legal pages published.

Operations:

- Admin runbook.
- Event check-in runbook.
- Incident/reporting process.
- Refund/cancellation policy.
- Guest pass policy.
- Community guidelines.

### Acceptance criteria

- 25–50 founding members onboarded.
- One test event created and RSVPed internally.
- One live pilot event run with check-in and feedback.
- No critical security gaps open.
- Admin can operate without developer intervention.

## 15. Phase 10 — Tulsa expansion and recommendation engine

### Goal

Expand beyond OKC with multi-city curation and lightweight recommendation scoring.

### Scope

- Tulsa city launch page/waitlist.
- City-specific event feeds.
- City-specific admins/curators if needed.
- Recommendation score for events.
- Member quality/attendance scoring.
- Partner expansion.

### Acceptance criteria

- Members can choose city.
- Admin can filter by city.
- Events can target city.
- Waitlist can be measured by city.
- Recommendation score is visible internally to curators.

### Risks

- Multi-city complexity can mimic multi-tenancy. Keep one organization with city chapters.
- Recommendation scoring must remain explainable and overrideable.

## 16. Technical epics and issue breakdown

## Epic A — Repo audit

Issues:

- Audit backend route/auth/security state.
- Audit frontend route/CTA/content state.
- Audit schema and migration readiness.
- Audit tests and build status.
- Write repo conversion decision log.

## Epic B — Brand conversion

Issues:

- Add social club site content model.
- Update seed content.
- Refactor homepage CTAs.
- Add `/apply` placeholder.
- Add `/partner` placeholder.
- Update footer/legal/community links.

## Epic C — Applications

Issues:

- Add `member_applications` schema.
- Add `cities` and `interests` schema.
- Build public application API.
- Build application form UI.
- Build applicant status UI.
- Build admin applications list.
- Build admin application detail/review.
- Add application notification templates.

## Epic D — Members

Issues:

- Add `member_profiles` schema.
- Add `memberships` schema.
- Build onboarding API.
- Build member profile API.
- Build admin members page.
- Build member status actions.

## Epic E — Events and RSVPs

Issues:

- Extend events schema.
- Add RSVP schema.
- Add guest pass schema.
- Add check-in schema.
- Build member event API.
- Build admin roster/check-in UI.
- Generate QR RSVP passes.

## Epic F — Mobile app

Issues:

- Create Expo app.
- Add shared API client.
- Add auth/token storage.
- Build onboarding screens.
- Build events list/detail.
- Build RSVP flow.
- Build QR pass screen.
- Build profile/settings.
- Configure EAS builds.

## Epic G — Community

Issues:

- Add circles schema.
- Build circles API.
- Build circles mobile screen.
- Add feedback schema.
- Build feedback prompt and admin summary.
- Add connection request MVP.

## Epic H — Vendors

Issues:

- Add vendors schema.
- Add partner inquiry form.
- Add admin vendor CRM.
- Add vendor offerings.
- Add event-vendor assignment.

## Epic I — Payments

Issues:

- Add Stripe customer mapping.
- Build membership checkout.
- Build webhook idempotency.
- Add membership status sync.
- Add paid event checkout.

## Epic J — Launch hardening

Issues:

- Complete auth refresh and session hardening.
- Confirm audit log coverage.
- Add global rate limiting.
- Add production CORS.
- Add E2E tests.
- Add observability.
- Write runbooks.

## 17. Suggested MVP cut line

The smallest viable product for a real pilot is:

- Public homepage rebranded.
- Request invite application.
- Admin application review.
- Member onboarding.
- Admin event creation.
- Member event list.
- RSVP.
- QR pass.
- Admin check-in.
- Feedback.

Everything else can wait.

Do not block first pilot on:

- Vendor portal.
- Messaging.
- Recommendation engine.
- Full mobile polish.
- Paid memberships.
- Multi-city automation.

## 18. Pilot plan

### Pilot 1 — Private founding member test

Audience:

- 15–25 trusted friends/professionals.

Goal:

- Validate application, approval, onboarding, RSVP, check-in, and feedback.

Success criteria:

- 80% complete onboarding.
- 60% RSVP to first event.
- 80% of RSVPs check in.
- Average event rating 4/5 or higher.
- At least 10 actionable feedback items.

### Pilot 2 — OKC founding member launch

Audience:

- 50–100 applicants.

Goal:

- Validate broader demand and membership positioning.

Success criteria:

- 100+ invite requests.
- 50 approved founding members.
- 30 RSVPs for first curated event.
- Under 15% no-show rate.
- 70% of attendees say they would attend again.

### Pilot 3 — Tulsa waitlist

Audience:

- Tulsa-based African/diaspora professionals and creatives.

Goal:

- Test city expansion without operational overbuild.

Success criteria:

- 50 Tulsa waitlist applicants.
- 3 partner venue/vendor leads.
- One Tulsa pilot event proposal.

## 19. Team operating rhythm

Weekly cadence:

- Monday: roadmap review and issue grooming.
- Tuesday–Thursday: implementation.
- Friday: demo, test evidence, decision log update.
- After each pilot event: feedback review and backlog update.

Decision log required for:

- Brand name.
- Membership pricing.
- Application criteria.
- App Store payment approach.
- Messaging launch.
- Vendor portal launch.
- Tulsa expansion.

## 20. Definition of production readiness

The platform is production-ready for OKC beta when:

- Public homepage is rebranded.
- Application system works end-to-end.
- Admin review is usable.
- Member onboarding works.
- Event RSVP/check-in works.
- Email notifications work or are intentionally manual with documented process.
- Security baseline is complete.
- Privacy/community/legal pages are published.
- Admin can run a live event without developer database edits.
- Build and lint pass.
- Critical E2E paths pass.

## 21. Recommended next engineering action

Start with Phase 0 and create a PR named:

```text
chore/social-club-conversion-audit
```

The PR should not implement product features yet. It should:

1. Add these source-of-truth docs.
2. Add a repo audit checklist.
3. Add issue templates for each epic.
4. Add a migration decision log.
5. Confirm the first implementation sprint: public site rebrand + request invite application.
