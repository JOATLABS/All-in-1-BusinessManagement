# African Social Club Platform Architecture Source of Truth

Status: Draft v1
Owner: Emmanuel Akinwale / JOATLabs
Target product: Invitation-based African community social club platform for Oklahoma City, Tulsa, and future cities

## 1. Purpose

This document is the implementation architecture source of truth for converting the existing OjaPlus/Rhythm+Root nightclub platform into an invitation-based social club platform inspired by the Parlor Social operating model, but designed specifically for African and African-diaspora communities in Oklahoma.

The platform should no longer be treated as only a nightclub or reservation product. The target system is a membership community and curated events operating system. It must support public marketing, applications, approval, member onboarding, personalized event discovery, RSVP, check-in, post-event feedback, member connection, vendor participation, and admin curation.

The existing web homepage design should be preserved as the public marketing entry point. The product functionality, data model, routes, content language, admin workflows, and mobile experience should be expanded and rebranded around a private social club.

## 2. Product thesis

Members join because they want intentional African-centered social, cultural, and professional rooms in Oklahoma. They stay because the platform consistently places them around people, events, and opportunities they would not have found on their own.

The platform promise:

> An invitation-based African and diaspora community for curated professional, cultural, and social experiences in Oklahoma City, Tulsa, and future underserved cities.

The business should copy the operating model of a modern private social club, not its protected assets. Do not copy Parlor Social’s name, copywriting, visual identity, screenshots, or interface one-for-one. Use the pattern: apply, get approved, join, see curated events, RSVP, attend, give feedback, connect, and return.

## 3. Current repository baseline

The current repo is a good foundation because it already has a public web experience, admin experience, event primitives, reservation primitives, media management, role-based admin concepts, and a PostgreSQL-backed API.

### 3.1 Existing monorepo structure

Current root package scripts run backend and frontend together:

- `npm run dev` runs backend and frontend concurrently.
- `npm run build` builds backend and frontend.
- `npm run lint` runs both lint targets.
- `npm run db:seed` seeds the backend database.

Current development documentation expects Node 20+, npm 10+, Git, Docker, local PostgreSQL, backend on port `4000`, frontend on port `5173`, and pgAdmin on port `5050`.

### 3.2 Existing backend

The backend is Express + TypeScript with Drizzle ORM and PostgreSQL. It already includes middleware and routes that are useful for the new platform:

- Express app factory in `backend/src/app.ts`.
- Security middleware via Helmet.
- Configurable CORS with localhost support in development.
- JSON and URL-encoded body parsing.
- Correlation ID middleware.
- Request logging.
- `/health` endpoint.
- API router mounted under `/api/v1`.
- Registered domains: auth, site content, reservations, admin reservations, admin users, events, tickets, and media.
- Centralized not-found and error handlers.

Current backend dependencies include Express, Drizzle ORM, PostgreSQL, bcrypt, JSON Web Tokens, QR code generation, multer, R2/S3 AWS SDK clients, Sharp, Winston, Zod, Helmet, CORS, rate limiting, and file-type validation. These are appropriate foundations for membership, event, media, QR check-in, and admin workflows.

### 3.3 Existing frontend

The frontend is currently Vite + React + TypeScript with React Router, Framer Motion, Tailwind, and Three.js.

Existing app routes include:

- `/` public landing page
- `/reserve` reservation page
- `/events` event page
- `/rr` alternate landing route
- `/admin/login`
- protected `/admin`
- `/admin/reservations`
- `/admin/events`
- `/admin/site-configuration`
- `/admin/team`

This routing structure should be preserved and extended rather than discarded.

### 3.4 Existing public homepage

The existing `LandingPage` is already close to the desired premium public-facing aesthetic. It includes:

- Dynamic hero media backgrounds.
- Background rotation.
- Animated marquee words.
- Logo/media support.
- Featured event fetching.
- Featured event flyer card.
- Countdown to next event.
- CTA row.
- Overlay panels for about, events, tickets, and contact.
- Footer links and social icons.

This design should be kept, but the copy, CTAs, and navigation should change from nightlife reservations to membership/invitation.

Target public CTAs:

- Primary: `Request Invite`
- Secondary: `Explore Membership`
- Secondary: `Upcoming Experiences`
- Secondary: `Partner With Us`
- Utility: `Member Login`

The current `Reserve` CTA should be removed or converted into `Apply`, `Request Invite`, or `Join Waitlist`. Public event details should be intentionally limited; full RSVP and attendance lists must be member-only.

### 3.5 Existing data model

Current schema includes:

- `site_content`
- `admin_users`
- `reservations`
- `events`
- `tickets`
- `customers`
- `attendance_events`
- `admin_user_sessions`
- `audit_logs`

The current design is single-tenant. For the new platform, keep the single-organization operational model for now, but add city support and community segmentation. Do not introduce SaaS-style tenant complexity until there is real demand for multi-brand licensing.

## 4. Target product architecture

## 4.1 High-level architecture

The target architecture should become a web + mobile platform with a shared backend:

```text
Public Web Portal
  Marketing site
  Request invite form
  Application status
  Membership checkout
  Partner/vendor inquiry
  Admin console

React Native Mobile App
  Approved-member onboarding
  Personalized event calendar
  Event RSVP and guest passes
  QR check-in pass
  Circles and community interests
  Member profile and connections
  Notifications and feedback

Backend API
  Auth and identity
  Application review
  Membership state
  Event curation
  RSVP and check-in
  Vendor participation
  Notifications
  Payments
  Media
  Analytics
  Admin audit trail

PostgreSQL
  Core relational source of truth

Object Storage
  Profile images, event images, brand assets, vendor media

Stripe
  Membership checkout, event payments, vendor invoices if needed

Email / Push / SMS
  Application updates, event reminders, RSVP updates, check-in reminders
```

## 4.2 Recommended repository layout

The repo can stay as a monorepo. The clean target structure should be:

```text
/apps
  /web                 Existing Vite React app or future Next.js web portal
  /mobile              Expo React Native app for iOS and Android
/services
  /api                 Existing Express backend moved or aliased from backend
/packages
  /shared              Shared TypeScript types, Zod schemas, constants
  /design-tokens       Shared colors, spacing, typography, event category tokens
  /api-client          Generated or typed API client for web and mobile
/docs
  social-club-platform-architecture.md
  social-club-branding-design-spec.md
  social-club-roadmap-plan.md
```

Because the current repo already has `frontend` and `backend`, the first implementation pass does not need a disruptive move. Use the current names until membership functionality is stable, then optionally migrate to `apps/web` and `services/api`.

Recommended near-term structure:

```text
/backend               Keep existing Express API
/frontend              Keep existing web portal
/mobile                Add new Expo React Native app
/shared                Add shared types and Zod schemas
/docs                  Architecture, brand, roadmap, decision logs
```

## 4.3 Application surfaces

### Public web portal

Primary responsibilities:

- Brand story and positioning.
- Request invite / application intake.
- Public teaser of event categories.
- Member login redirect.
- Partner/vendor inquiry.
- Legal pages.
- Privacy and community standards.
- Optional membership checkout after approval.

The public portal should not expose full member directory, attendee lists, private event locations, or RSVP functionality.

### Member mobile app

Primary responsibilities:

- Member onboarding after approval.
- Profile completion.
- Interest selection.
- Personalized event calendar.
- Event detail and RSVP.
- Guest pass request.
- QR check-in pass.
- Post-event feedback.
- Circles and community groups.
- Connection requests and optional messaging.
- Push notifications.

The app should be built with Expo + React Native + TypeScript, using Expo Router or React Navigation. Expo is recommended to reduce native build complexity while still supporting iOS and Android through EAS Build.

### Admin console

Primary responsibilities:

- Review applications.
- Approve, reject, waitlist, invite, or request more information.
- Manage members.
- Create and manage events.
- Segment members by city, interests, membership level, engagement, and application data.
- Send targeted invitations.
- Manage RSVPs, waitlists, check-ins, and no-shows.
- Manage vendors and event partners.
- Review feedback and incident reports.
- Manage content and media.
- Review audit logs.
- Manage subscriptions and payments.

### Vendor portal

Primary responsibilities:

- Vendor/venue application.
- Vendor profile.
- Event proposal submission.
- Availability and capacity submission.
- Package/service pricing.
- Agreement and payment status.
- Event logistics checklist.

Vendor portal can be phase two. For MVP, vendor management can live in admin only.

## 5. Roles and permissions

## 5.1 Platform admin roles

### Owner / Superadmin

Full system control.

Capabilities:

- Manage all admin users.
- Manage brand settings.
- Manage application criteria.
- Approve/reject/waitlist members.
- Manage all events.
- Manage vendors.
- Manage payments and Stripe settings.
- View analytics and audit logs.
- Override member status.
- Export data.

### Community Curator / Manager

Operational curation role.

Capabilities:

- Review applications.
- Add notes and tags.
- Recommend approval/waitlist/rejection.
- Create and edit events.
- Build invite segments.
- Manage RSVPs and waitlists.
- Review feedback.
- Manage circles.
- Cannot change billing configuration, delete members permanently, or manage superadmin accounts.

### Event Ops / Staff

Day-of-event execution role.

Capabilities:

- View assigned event roster.
- Check in members and guests.
- Scan QR codes.
- Mark no-shows.
- View basic member notes needed for event operation.
- Cannot see sensitive application answers, payment details, or full member data.

### Support / Moderator

Community safety role.

Capabilities:

- View member reports.
- Moderate profile content.
- Freeze messaging or connection features.
- Escalate incidents.
- Cannot approve membership without curator/owner permission.

## 5.2 Public and member roles

### Visitor

Unauthenticated public user.

Capabilities:

- View marketing site.
- View high-level event examples.
- Request invite.
- Submit partner/vendor inquiry.
- Read legal/community standards.

### Applicant

Submitted an application but not yet approved.

Capabilities:

- Log in to view application status.
- Update application while still under review if allowed.
- Receive email status updates.
- Cannot see member-only events or members.

### Invited Applicant

Application has been accepted enough to complete onboarding.

Capabilities:

- Complete profile.
- Choose interests.
- Select membership tier if paid.
- Accept community guidelines.
- Access mobile app after activation.

### Member

Approved and active.

Capabilities:

- Use mobile app.
- View event calendar.
- RSVP to eligible events.
- Request guest pass when event allows.
- Join circles.
- Save events.
- Submit event suggestions.
- Provide feedback.
- Request member connections if enabled.

### Premium / Founding Member

Enhanced member status.

Capabilities:

- Priority RSVP.
- Access to premium dinners or limited-capacity events.
- Expanded guest pass allowance.
- Early event notifications.
- Founding member badge.

### Suspended / Paused Member

Restricted access.

Capabilities:

- View account status.
- Contact support.
- Cannot RSVP, message, invite guests, or join events.

## 5.3 Vendor roles

### Vendor Applicant

Vendor or venue has submitted interest.

Capabilities:

- Submit vendor inquiry.
- Provide business details.
- Upload menus/packages if requested.

### Approved Vendor

Partner available for events.

Capabilities:

- Maintain vendor profile.
- Submit event proposals.
- View assigned event logistics.
- Confirm availability.
- Upload invoices or agreements.

### Event Partner

Vendor attached to a specific event.

Capabilities:

- View relevant event details.
- See headcount and timing needed for service.
- Communicate with admin.
- Confirm completion.

## 6. Core state machines

## 6.1 Application state

```text
draft
submitted
under_review
needs_more_info
waitlisted
invited
approved
rejected
expired
withdrawn
```

Rules:

- Only submitted applications enter admin review.
- `needs_more_info` sends applicant an update request.
- `waitlisted` remains eligible for future approval.
- `invited` means the applicant may complete onboarding.
- `approved` means onboarding and membership activation are complete.
- `rejected` should not expose detailed internal reasons to the applicant.

## 6.2 Membership state

```text
pending_onboarding
active
past_due
paused
cancelled
suspended
banned
```

Rules:

- `pending_onboarding` cannot RSVP yet.
- `active` can use app and RSVP.
- `past_due` may have limited event access based on policy.
- `suspended` blocks RSVP and messaging.
- `banned` blocks login and future application with the same identity.

## 6.3 Event state

```text
draft
internal_review
published_private
published_public_teaser
invite_only
rsvp_open
waitlist_only
closed
completed
cancelled
archived
```

Rules:

- Public site may show teasers without full location.
- Mobile app shows full details only to eligible members.
- Event location can be hidden until RSVP approval.
- Events can target segments by city, circle, interest, membership tier, or manual invite.

## 6.4 RSVP state

```text
interested
requested
confirmed
waitlisted
declined
cancelled
checked_in
no_show
removed
```

Rules:

- Some events allow instant confirmation.
- Curated dinners may require RSVP request approval.
- No-shows must feed into member quality scoring.
- Cancellation windows should be configurable per event.

## 6.5 Guest pass state

```text
not_allowed
requested
approved
rejected
issued
checked_in
expired
cancelled
```

Rules:

- Guest pass rules are configured per event.
- Premium members may have more guest privileges.
- Guest behavior is attributable to the inviting member.

## 7. Target data model

This data model extends the current schema. It should be implemented with Drizzle ORM and Zod validation in shared packages.

## 7.1 Identity and access

### users

General login identity for applicants, members, vendors, and admins.

```sql
users (
  id UUID PK,
  email CITEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT,
  auth_provider TEXT DEFAULT 'email',
  role TEXT NOT NULL, -- 'visitor_user' | 'member' | 'vendor' | 'admin'
  status TEXT NOT NULL DEFAULT 'active',
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

Current `admin_users` can remain initially. Long term, unify admin and member identity under `users` while preserving admin role permissions.

### user_sessions

Refresh token/session tracking for web and mobile.

```sql
user_sessions (
  id UUID PK,
  user_id UUID FK,
  refresh_token_hash TEXT NOT NULL,
  device_type TEXT, -- web | ios | android
  device_name TEXT,
  push_token TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

## 7.2 Applications and membership

### member_applications

```sql
member_applications (
  id UUID PK,
  user_id UUID FK,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  preferred_name TEXT,
  city_id UUID FK,
  profession TEXT,
  industry TEXT,
  company TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  referral_code TEXT,
  referred_by_member_id UUID,
  application_answers JSONB NOT NULL,
  interest_ids UUID[] NOT NULL DEFAULT '{}',
  social_goals TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted',
  admin_score INT,
  review_notes JSONB,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### member_profiles

```sql
member_profiles (
  id UUID PK,
  user_id UUID UNIQUE FK,
  display_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  city_id UUID FK,
  home_city TEXT,
  bio TEXT,
  profession TEXT,
  industry TEXT,
  company TEXT,
  profile_photo_url TEXT,
  cover_photo_url TEXT,
  heritage_tags TEXT[], -- optional and user-controlled
  interests UUID[] NOT NULL DEFAULT '{}',
  social_goals TEXT[] NOT NULL DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'members_only',
  connection_mode TEXT NOT NULL DEFAULT 'request_required',
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### memberships

```sql
memberships (
  id UUID PK,
  member_profile_id UUID FK,
  tier TEXT NOT NULL, -- founding | standard | premium | comp
  status TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### interests

```sql
interests (
  id UUID PK,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL, -- culture | business | wellness | nightlife | food | faith | family | creative
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0
)
```

## 7.3 Cities and geographic expansion

### cities

```sql
cities (
  id UUID PK,
  slug TEXT UNIQUE NOT NULL, -- okc | tulsa | dallas_future
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  launch_status TEXT NOT NULL DEFAULT 'active', -- active | waitlist | planned | paused
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

The platform remains single-organization but supports multiple city chapters.

## 7.4 Events and attendance

The existing `events`, `tickets`, `customers`, and `attendance_events` tables can evolve into this model.

### events

```sql
events (
  id UUID PK,
  city_id UUID FK,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL, -- dinner | mixer | professional | cultural | party | wellness | faith | couples | singles_social
  short_description TEXT,
  description TEXT,
  venue_id UUID FK,
  location_visibility TEXT NOT NULL DEFAULT 'confirmed_rsvps_only',
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  capacity INT,
  member_price NUMERIC(10,2) DEFAULT 0,
  guest_price NUMERIC(10,2) DEFAULT 0,
  allows_guests BOOLEAN NOT NULL DEFAULT false,
  max_guests_per_member INT NOT NULL DEFAULT 0,
  rsvp_policy TEXT NOT NULL DEFAULT 'instant', -- instant | request_approval | invite_only
  membership_tiers_allowed TEXT[] DEFAULT '{}',
  interest_targeting UUID[] DEFAULT '{}',
  image_url TEXT,
  flyer_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### event_segments

Stores event targeting rules and manual invite groups.

```sql
event_segments (
  id UUID PK,
  event_id UUID FK,
  segment_type TEXT NOT NULL, -- city | interest | tier | circle | manual | profession | industry
  criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### rsvps

```sql
rsvps (
  id UUID PK,
  event_id UUID FK,
  member_profile_id UUID FK,
  status TEXT NOT NULL DEFAULT 'requested',
  source TEXT NOT NULL DEFAULT 'mobile_app',
  party_size INT NOT NULL DEFAULT 1,
  checked_in_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  no_show_marked_at TIMESTAMPTZ,
  payment_intent_id TEXT,
  amount_paid NUMERIC(10,2) DEFAULT 0,
  qr_code TEXT UNIQUE,
  qr_code_image_url TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, member_profile_id)
)
```

### guest_passes

```sql
guest_passes (
  id UUID PK,
  rsvp_id UUID FK,
  event_id UUID FK,
  invited_by_member_id UUID FK,
  guest_name TEXT NOT NULL,
  guest_email CITEXT,
  guest_phone TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  qr_code TEXT UNIQUE,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### check_ins

```sql
check_ins (
  id UUID PK,
  event_id UUID FK,
  rsvp_id UUID,
  guest_pass_id UUID,
  checked_in_by UUID,
  scan_source TEXT NOT NULL, -- admin_web | staff_mobile | manual
  scan_result TEXT NOT NULL, -- accepted | duplicate | invalid | blocked
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB
)
```

### event_feedback

```sql
event_feedback (
  id UUID PK,
  event_id UUID FK,
  member_profile_id UUID FK,
  rating INT,
  vibe_rating INT,
  venue_rating INT,
  crowd_fit_rating INT,
  would_attend_again BOOLEAN,
  comments TEXT,
  tags TEXT[],
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

## 7.5 Community features

### circles

```sql
circles (
  id UUID PK,
  city_id UUID FK,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'members_only',
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### circle_members

```sql
circle_members (
  id UUID PK,
  circle_id UUID FK,
  member_profile_id UUID FK,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(circle_id, member_profile_id)
)
```

### member_connections

```sql
member_connections (
  id UUID PK,
  requester_member_id UUID FK,
  recipient_member_id UUID FK,
  status TEXT NOT NULL DEFAULT 'pending',
  context_event_id UUID,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at TIMESTAMPTZ,
  UNIQUE(requester_member_id, recipient_member_id)
)
```

Messaging can be deferred. Connections can launch before full chat.

## 7.6 Vendors and venues

### vendors

```sql
vendors (
  id UUID PK,
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email CITEXT,
  phone TEXT,
  category TEXT NOT NULL, -- venue | restaurant | dj | photographer | caterer | decorator | sponsor | speaker
  website_url TEXT,
  instagram_url TEXT,
  status TEXT NOT NULL DEFAULT 'prospect',
  notes JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### venues

```sql
venues (
  id UUID PK,
  vendor_id UUID FK,
  name TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  capacity INT,
  parking_notes TEXT,
  accessibility_notes TEXT,
  location_visibility_default TEXT DEFAULT 'confirmed_rsvps_only',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### vendor_offerings

```sql
vendor_offerings (
  id UUID PK,
  vendor_id UUID FK,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2),
  unit TEXT, -- event | hour | person | package
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

### event_vendors

```sql
event_vendors (
  id UUID PK,
  event_id UUID FK,
  vendor_id UUID FK,
  offering_id UUID,
  role TEXT,
  agreed_price NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'proposed',
  logistics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

## 7.7 Notifications and messaging

### notifications

```sql
notifications (
  id UUID PK,
  user_id UUID FK,
  channel TEXT NOT NULL, -- email | push | sms | in_app
  template_key TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  payload JSONB,
  status TEXT NOT NULL DEFAULT 'queued',
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
```

Notification event examples:

- Application submitted.
- Application needs more info.
- Application approved.
- Membership activated.
- RSVP confirmed.
- RSVP waitlisted.
- Event reminder.
- Guest pass approved.
- Post-event feedback request.
- Vendor inquiry received.

## 8. API surface

All routes should remain under `/api/v1`.

## 8.1 Public routes

```text
GET  /public/site-content
GET  /public/events/teasers
POST /applications
POST /vendor-inquiries
GET  /legal/:slug
```

## 8.2 Auth routes

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email
```

## 8.3 Application routes

```text
GET   /me/application
PATCH /me/application
POST  /me/application/submit
GET   /admin/applications
GET   /admin/applications/:id
PATCH /admin/applications/:id/status
POST  /admin/applications/:id/notes
POST  /admin/applications/:id/request-more-info
```

## 8.4 Member routes

```text
GET   /me/profile
PATCH /me/profile
GET   /me/membership
GET   /members/:id
POST  /members/:id/connect
GET   /me/connections
```

## 8.5 Event and RSVP routes

```text
GET  /events
GET  /events/:id
POST /events/:id/rsvp
PATCH /rsvps/:id
POST /rsvps/:id/guest-passes
GET  /me/rsvps
POST /events/:id/feedback
```

## 8.6 Admin event routes

```text
GET    /admin/events
POST   /admin/events
GET    /admin/events/:id
PATCH  /admin/events/:id
DELETE /admin/events/:id
GET    /admin/events/:id/roster
POST   /admin/events/:id/invite-segment
POST   /admin/events/:id/check-in
PATCH  /admin/rsvps/:id/status
```

## 8.7 Circle routes

```text
GET  /circles
GET  /circles/:id
POST /circles/:id/join
GET  /admin/circles
POST /admin/circles
PATCH /admin/circles/:id
```

## 8.8 Vendor routes

```text
POST /vendor-inquiries
GET  /admin/vendors
POST /admin/vendors
PATCH /admin/vendors/:id
POST /admin/events/:id/vendors
PATCH /admin/event-vendors/:id
```

## 8.9 Webhooks

```text
POST /webhooks/stripe
POST /webhooks/sendgrid
```

All webhook handlers must validate signatures, use idempotency, and record audit events.

## 9. Web portal conversion requirements

## 9.1 Keep existing homepage design

Keep:

- Cinematic hero.
- Background media manager.
- Animated hero words.
- Event teaser capability.
- Overlay panels.
- Footer/social editing.
- Admin site configuration.

Change:

- `Reserve` route and CTA should become `Request Invite` or `Apply`.
- `Ticket Pre-Sale` should become `Membership` or `Upcoming Experiences`.
- `Upcoming Event` should become `Upcoming Experiences`.
- Contact modal should become general contact plus partnership inquiry.
- Public events should show limited teasers, not member-only details.

Add routes:

```text
/apply
/application/status
/membership
/partner
/legal/community-guidelines
/member/login
```

Keep `/admin` and expand it.

## 9.2 Admin conversion requirements

Add admin navigation:

- Applications
- Members
- Events
- RSVPs / Attendance
- Circles
- Vendors
- Campaigns / Notifications
- Feedback
- Analytics
- Content
- Team
- Audit Logs

## 9.3 Existing pages to refactor

| Current page | Target social club function |
|---|---|
| `LandingPage` | Public marketing and invite funnel |
| `ReserveTablePage` | Request invite / application flow, or retire |
| `EventsPage` | Public event teaser page |
| `AdminEventsPage` | Curated event management |
| `Reservations` | RSVP and attendance management |
| `SiteConfiguration` | Brand/content/site configuration |
| `TeamManagement` | Admin user management |
| `RRLanding` | Remove, archive, or repurpose only if tied to new brand |

## 10. Mobile app architecture

## 10.1 Recommended stack

- Expo React Native.
- TypeScript.
- Expo Router or React Navigation.
- TanStack Query for server state.
- Zustand or Redux Toolkit for small local state.
- React Hook Form + Zod for forms.
- Expo SecureStore for tokens.
- Expo Notifications for push.
- Expo Image for optimized images.
- EAS Build for iOS and Android.
- Shared API client from `/shared` or `/packages/api-client`.

## 10.2 Mobile navigation

Recommended tabs:

```text
Home
Events
Circles
Inbox
Profile
```

MVP tabs:

```text
Home
Events
Community
Profile
```

## 10.3 Mobile screens

### Authentication and onboarding

- Welcome.
- Login.
- Application status.
- Approved invite acceptance.
- Profile setup.
- Interest selection.
- Community guidelines acceptance.
- Notification permission prompt.

### Member home

- Personalized greeting.
- Next RSVP.
- Recommended upcoming event.
- New circles.
- Member announcements.
- Feedback request from last event.

### Events

- Event list.
- Calendar view.
- Event detail.
- RSVP confirmation.
- Guest pass request.
- QR pass.
- Waitlist state.
- Post-event feedback.

### Community

- Circles list.
- Circle detail.
- Suggested members.
- Connection requests.
- Member profile.

### Profile

- Personal profile.
- Membership status.
- Interests.
- RSVP history.
- Settings.
- Privacy.

## 11. Security, privacy, and trust

Trust is a product feature. The system should protect member data and keep the community safe.

Requirements:

- JWT access tokens and rotating refresh tokens.
- Secure mobile token storage.
- CORS allowlist for web only; mobile apps pass no browser origin.
- Rate limits for auth, applications, RSVP, and feedback.
- Zod validation on every request body.
- Audit logs for all admin actions.
- No public exposure of member profiles.
- Optional demographic/cultural data must be user-controlled and clearly explained.
- Event location visibility must be configurable.
- Guest behavior must be tied to inviting member.
- Incident reporting must be available before messaging launches.
- Deletion/export policy must be defined before public launch.

## 12. Payments architecture

Payment types:

- Membership subscription.
- One-time founding member fee.
- Paid event ticket.
- Guest pass fee.
- Vendor invoice or sponsorship payment.

Recommended MVP payment flow:

- Application is free.
- Approval happens before checkout.
- Checkout is completed on the web portal with Stripe Checkout.
- Mobile app reads membership status from backend.
- Avoid putting unreviewed external payment flows in mobile until App Store/Play Store policy is reviewed.

Stripe objects:

- Customer per user.
- Subscription per membership if recurring.
- Checkout Session for membership activation.
- PaymentIntent for event/guest payment if one-time.
- Webhook events persisted with idempotency key.

## 13. Analytics and curation intelligence

MVP analytics:

- Application conversion.
- Approval rate.
- Waitlist count by city.
- RSVP conversion by event category.
- Attendance rate.
- No-show rate.
- Event rating.
- Guest pass usage.
- Member retention.
- Most requested event categories.

Future recommendation scoring:

```text
member_event_score =
  city_match
  + interest_match
  + attendance_history
  + membership_tier_priority
  + circle_match
  + curator_boost
  - no_show_penalty
```

Do not automate curation too early. First launch with manual curation and admin notes, then add recommendation scoring once enough attendance/feedback data exists.

## 14. Current repo review requirements before implementation

Before coding the conversion, run a repo audit and create an issue checklist for these areas.

### Backend audit

- Confirm all current routes under `/api/v1`.
- Confirm whether JWT auth is fully implemented or only partially scaffolded.
- Confirm session persistence and refresh-token rotation.
- Confirm admin authorization middleware is applied to every admin write route.
- Confirm CORS behavior for future web and mobile clients.
- Confirm rate limiting coverage beyond media routes.
- Confirm audit logs are actually written, not only schema-defined.
- Confirm Stripe integration status.
- Confirm QR generation/validation status.
- Confirm media upload/R2 behavior in staging.

### Frontend audit

- Confirm all public CTAs and overlay copy sources.
- Confirm the `SiteConfiguration` schema can support new brand fields.
- Confirm event admin page can support new event fields: city, type, RSVP policy, capacity, location visibility, guest rules.
- Confirm reservation page can be retired or converted into application flow.
- Confirm current protected route behavior and token persistence.
- Confirm responsive behavior and accessibility after CTA changes.

### Data audit

- Map current `customers` to future `users` or `member_profiles`.
- Map current `reservations` to future `rsvps` only where semantically valid.
- Map current `tickets` to future `rsvps`/`guest_passes` QR passes.
- Keep `events` but extend fields rather than replacing if possible.
- Keep `site_content` but revise JSON structure to support social club copy.

### Test audit

- Run root `npm run lint`.
- Run root `npm run build`.
- Run backend tests if present.
- Run Playwright E2E tests.
- Add new tests for application submission, admin review, member onboarding, RSVP, and check-in.

## 15. Migration plan from nightclub to social club

## 15.1 Naming migration

Replace domain language:

| Old language | New language |
|---|---|
| Lounge | Social Club / Community |
| Guest | Visitor / Applicant / Member |
| Reservation | RSVP / Guest Pass |
| Ticket | Pass / RSVP Pass / Event Ticket |
| VIP Section | Premium Experience / Curated Dinner / Private Table only when event-specific |
| Table Reservation | Request Invite / RSVP |
| Night | Experience / Gathering / Event |
| Staff | Event Ops |

## 15.2 Backend migration sequence

1. Add new tables without removing old tables.
2. Add `/applications` and `/admin/applications` routes.
3. Add `member_profiles`, `memberships`, `interests`, and `cities`.
4. Extend `events` with social-club fields.
5. Add `rsvps` and `guest_passes`.
6. Add admin review UI.
7. Convert web CTAs.
8. Launch mobile app against new APIs.
9. Retire or archive old reservations once no longer needed.

## 15.3 Frontend migration sequence

1. Update content seed and site configuration labels.
2. Change homepage CTAs to invitation-based flow.
3. Build `/apply` flow.
4. Build `/application/status`.
5. Add admin applications page.
6. Refactor reservations admin into RSVP admin.
7. Add members admin page.
8. Add vendors admin page.

## 15.4 Mobile implementation sequence

1. Create `/mobile` Expo app.
2. Add shared API client.
3. Build auth and token storage.
4. Build member onboarding.
5. Build event list and event detail.
6. Build RSVP and QR pass.
7. Build profile and interests.
8. Add push notifications.
9. Add circles and connections.

## 16. Definition of done

A feature is complete only when:

- Data model is defined in Drizzle.
- Zod schemas exist for request validation.
- Backend route is implemented.
- Authorization is enforced.
- Audit logging exists for admin changes.
- Frontend and/or mobile UI handles loading, empty, success, and error states.
- Accessibility requirements are met.
- Tests exist for happy path and key failure states.
- Documentation is updated.

## 17. Non-goals for MVP

Do not build these first:

- Full social feed.
- Open public member directory.
- Full real-time chat.
- AI matchmaking.
- Multi-tenant SaaS mode.
- Complex vendor self-service portal.
- Public ticket marketplace.
- Advanced recommendation engine.

MVP success depends on application quality, curated events, RSVP reliability, and operational admin control.
