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

## 4. Admin Platform Foundations ✅ **COMPLETED**

1. ✅ Branded login page matching the nightlife palette (email/password, validation, error messaging).
2. ✅ Primary dashboard shell showing placeholders for KPIs (next featured event, pending reservations, content status).
3. ✅ Global navigation layout with responsive collapse, user menu, and logout stub.

**Status**: Login, dashboard, and navigation fully implemented and working.

## 5. Customer-Site Configuration Workspace ✅ **COMPLETED**

- ✅ Create a "Site Configuration" area with tabs: Landing Hero, About Modal, Events Overlay, Contact Modal, Footer & Social, Legal Footer.
- ✅ Map each field to the configurable items enumerated in Section 1.
- ✅ Provide preview snippets for hero word carousel and flyer states.
- ✅ Include unsaved-changes prompts and validation messaging.
- ✅ **Added**: Footer & Social media management tab with full CRUD for social links (Instagram, TikTok, Facebook, Twitter).

**Status**: Site Configuration fully functional with all tabs working, including social media link management.

**Implementation Notes**:
- Fixed `useBlocker` router compatibility issue by removing React Router data router dependency
- All content sections editable: Hero, Events, About, Contact, Footer/Social, Legal
- Real-time unsaved changes tracking via browser `beforeunload` event
- Full integration with backend `/api/site-content` endpoint

## 6. Background Media Management

- Allow ordering, activation toggles, focal point adjustments, playback depth controlsbui.
- Support still images and looping MP4/WebM with graceful degradation and `prefers-reduced-motion` handling.
- Preload hero assets and record performance telemetry (LCP, dropped frames) for monitoring.

## 7. Footer & Navigation Obligations

- Expose a compact footer row with operating hours (opens About modal), legal link, contact trigger, and an Admin link pointing to the login page.
- Ensure CTA ribbon buttons trigger horizontal modal transitions without layout jitter.

## 8. Workflow Validation

- Manual walkthrough: update hero copy via admin → publish → verify on customer site.
- Automated checks: `npm run lint`, `npm run build`, component tests for forms, integration tests for login → dashboard → update flow.
- Performance guardrail: run Lighthouse/WebPageTest to confirm smooth background loop across devices, respecting reduced-motion.

## 9. Admin User Management & Role-Based Access Control

**Timing**: Implement after Customer-Site Configuration Workspace (Section 5) but before Reservation & Inventory (Section 11) to establish proper access controls.

**Overview**: Enable the root admin (owner) to create and manage sub-admin accounts with role-based permissions. This ensures operational flexibility while maintaining security boundaries.

**Roles & Permissions**:

1. **Owner (superadmin)** - Root account with full system access

   - Create/edit/delete admin users
   - Access all admin features
   - Change system configuration
   - View audit logs
2. **Manager (admin)** - Operational management role

   - View and manage reservations
   - Create and edit events
   - Access analytics and reports
   - Cannot manage admin users
   - Cannot change system configuration
3. **Staff (staff)** - Limited access for door personnel

   - View reservations (read-only)
   - Scan and validate QR codes
   - Mark guests as checked-in
   - Cannot edit reservations or access configuration

**Implementation Tasks**:

### 9.1. Backend API - Admin User Management

- Create admin user CRUD endpoints under `/api/admin/users`:
  - `GET /admin/users` - List all admin users (owner only)
  - `POST /admin/users` - Create new admin user (owner only)
  - `GET /admin/users/:id` - Get admin user details
  - `PATCH /admin/users/:id` - Update admin user (owner only, or self for profile updates)
  - `DELETE /admin/users/:id` - Soft delete admin user (owner only, cannot delete self)
  - `POST /admin/users/:id/reset-password` - Trigger password reset email
- Add role validation middleware:
  - `requireRole(['superadmin'])` - Owner-only routes
  - `requireRole(['superadmin', 'admin'])` - Manager+ routes
  - `requireRole(['superadmin', 'admin', 'staff'])` - All authenticated routes
- Implement password requirements validation (minimum length, complexity)
- Add email uniqueness checks and validation
- Create audit logging for admin user actions (create, update, delete, password reset)

### 9.2. Database Schema Updates

- Verify `admin_users` table schema supports required fields:
  ```sql
  admin_users(
    id UUID PK,
    email CITEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('superadmin', 'admin', 'staff')),
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    created_by UUID FK(admin_users.id)
  )
  ```
- Add `admin_user_sessions` table for session management:
  ```sql
  admin_user_sessions(
    id UUID PK,
    admin_user_id UUID FK NOT NULL,
    token_hash TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
  )
  ```
- Create indexes: `admin_users(email)`, `admin_user_sessions(token_hash)`, `admin_user_sessions(admin_user_id, expires_at)`

### 9.3. Frontend - Admin User Management UI

- Create "Team Management" page in admin dashboard (`/admin/team`)
- Add navigation link in admin sidebar (visible to owners only)
- Build admin user list table:
  - Display: name, email, role, last login, status (active/inactive)
  - Actions: edit, reset password, deactivate/activate
  - Sort by: name, role, last login, created date
  - Filter by: role, status
- Create "Add Admin User" modal/form:
  - Fields: first name, last name, email, role (dropdown)
  - Auto-generate temporary password or send invitation email
  - Validation: email format, role selection required
- Create "Edit Admin User" modal/form:
  - Allow updating: name, email, role, active status
  - Restrict role changes: owners cannot demote themselves
  - Show last login timestamp and created date
- Add password reset flow:
  - Admin-initiated: Send reset email to user
  - User-initiated: "Forgot password" on login page
- Add confirmation dialogs for destructive actions (deactivate, delete)

### 9.4. Role-Based UI Components

- Create permission helper utilities:
  - `hasPermission(user, permission)` - Check if user has specific permission
  - `canAccess(user, route)` - Check if user can access route
  - `<ProtectedRoute roles={['superadmin', 'admin']} />` - Route guard component
  - `<IfRole roles={['superadmin']}>...</IfRole>` - Conditional rendering component
- Apply role-based visibility:
  - Hide "Team Management" navigation for non-owners
  - Hide "Site Configuration" for staff role
  - Show read-only views for staff in reservations
  - Disable edit/delete buttons based on permissions
- Add role badges in UI (Owner, Manager, Staff) with color coding
- Display current user role in header/profile dropdown

### 9.5. Authentication & Session Management

- Extend JWT payload to include:
  - `userId`, `email`, `role`, `permissions`, `sessionId`
- Implement session tracking:
  - Record active sessions in database
  - Allow users to view active sessions
  - Implement "logout all other sessions" feature
- Add session expiration handling:
  - Short-lived access tokens (15 minutes)
  - Long-lived refresh tokens (7 days)
  - Automatic token refresh on activity
- Implement "remember me" option on login (30-day refresh token)

### 9.6. Security & Audit

- Log all admin user management actions:
  - Who created/modified/deleted which user
  - Role changes with before/after values
  - Failed login attempts (track by email and IP)
  - Password reset requests and completions
- Implement rate limiting:
  - Login attempts: 5 attempts per 15 minutes per IP
  - Password reset: 3 requests per hour per email
  - Admin user creation: 10 per hour per owner
- Add admin user activity dashboard:
  - Recent login history
  - Active sessions count
  - Role distribution chart
  - Recent admin actions timeline
- Email notifications:
  - New admin user created → send welcome email with login instructions
  - Password reset requested → send reset link
  - Role changed → notify user of permission changes
  - Account deactivated → send notification

### 9.7. Testing & Validation

- Unit tests:
  - Role validation middleware
  - Permission checking utilities
  - Password hashing and validation
- Integration tests:
  - Full CRUD operations for admin users
  - Role-based access control enforcement
  - Session management workflows
- E2E tests:
  - Owner creates manager account → manager logs in → verify limited access
  - Staff user attempts to access restricted route → verify redirect/403
  - Owner changes user role → verify permission updates take effect
- Manual testing checklist:
  - Create admin users with different roles
  - Verify role-based UI visibility
  - Test password reset flow
  - Verify audit log entries
  - Test session timeout and refresh

**Single-Tenant Benefits**:

- No organization context needed in permissions—all admins manage the same lounge
- Simplified role hierarchy: just three roles without complex permission trees
- No tenant-scoping in admin user queries
- Single set of authentication credentials and session storage

**Dependencies**:

- Requires completed Customer-Site Configuration (Section 5) for navigation foundation
- Should be implemented before Reservation & Inventory (Section 11) to establish proper access controls
- Can be developed in parallel with Background Media Management (Section 6)

## 10. Security & Reliability Hardening (Single-Tenant Focused)

- Introduce configurable CORS allowlists, request rate limiting, and structured logging before exposing the API publicly
  - **Single-tenant benefit**: Rate limiting configuration is simpler without per-tenant quotas
- Replace in-memory sessions with signed JWT or Redis-backed tokens, add refresh/rotation workflows
  - **Single-tenant benefit**: No tenant context in tokens—just admin/public role distinction
  - Session storage simplified: single Redis namespace, no tenant partitioning
- Validate environment configuration with Zod at startup, fail fast with actionable errors for missing secrets
  - **Single-tenant benefit**: One set of credentials to validate (Stripe, SendGrid, database, etc.)
- Implement centralized error middleware plus correlation IDs; ship logs to observability stack
  - **Single-tenant benefit**: All logs belong to one system—no tenant filtering in log aggregation queries

## 11. Customer ↔ Admin Data Synchronisation (Single-Tenant)

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

## 12. Reservation & Inventory Experience (Single-Tenant)

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

## 13. Advanced Analytics & Optimisation Enablement (Single-Tenant)

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

## 14. Google Analytics Integration (Customer Forecasting)

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

---

## 15. Club Layout & Services (Interactive Floor Plan)

**Status**: DEFERRED — Validate business need after core operations launch
**Priority**: Enhancement (Nice-to-have)
**Decision Date**: 2025-10-14
**Estimated Effort**: Full implementation 40-60 hours | MVP "Layout Lite" 15-20 hours
**Dependencies**:
- Section 5 (Site Configuration) — Complete
- Section 9 (Admin User Management) — Schema complete, UI needed
- Section 10 (Security Hardening) — BLOCKER — Must complete first
- Section 11 (Reservations Backend) — Partially complete, needs Stripe integration
- Section 12 (Inventory Tooling) — Not started

**Deferral Rationale**:
1. **Business validation first**: Launch reservations without floor plans, measure conversion rates via GA4, gather staff feedback on operational needs
2. **Foundation gaps**: Security hardening (JWT, CORS, rate limiting) and complete payment flow are higher priority
3. **Scope management**: 40-60 hours represents significant investment for unvalidated feature
4. **Phased approach available**: Can start with simpler "Layout Lite" MVP (image upload + click-to-tag) before full CAD editor

**Validation Criteria Before Implementation**:
- [ ] Reservations launched and stable for 4+ weeks
- [ ] Conversion rate baseline established via Google Analytics
- [ ] Staff feedback collected: "Do you need visual layouts?"
- [ ] Competitor analysis: Are floor plans industry-standard?
- [ ] At least 50 confirmed reservations to validate tier structure

**Implementation Path (When Validated)**:
1. **Phase 1: Layout Lite MVP** (15-20 hours) — Simple image upload + coordinate tagging
2. **Phase 2: Full CAD Editor** (40-60 hours) — If Phase 1 proves valuable

Detailed Specification: See `docs/features/club_layout_services.md`

### Overview

Extend the platform with an interactive floor plan editor and visual layout management system. This feature provides a CAD-like interface for configuring club geometry, mapping reservable sections to existing reservation tiers, and assigning services/staff to floor zones.

**Business Value:**
- Visual floor plan increases reservation conversion rates
- Operational efficiency for staff (know where guests are seated)
- Service upsells (bottle service, VIP packages) mapped directly to layout
- Professional presentation matching high-end nightclub expectations

**Single-Tenant Benefits:**
- No tenant scoping complexity in layout tables
- Direct linking to existing `tierId` in reservations without cross-org isolation
- Single floor plan for the venue (no multi-location management)
- Simplified audit trail without tenant filtering

---

### 15.1. Domain Model & Storage

#### New Database Tables

```sql
-- Global floor plan metadata
club_layouts (
  id UUID PK DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,  -- e.g., "Main Floor", "Rooftop"
  default_arrival_route JSONB,  -- Staff navigation hints
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
)

-- Zones: stage, dance floor, bar, VIP hallway, etc.
layout_zones (
  id UUID PK DEFAULT gen_random_uuid(),
  layout_id UUID FK REFERENCES club_layouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "Main Stage", "VIP Lounge", "Bar Area"
  zone_type TEXT NOT NULL,  -- 'stage', 'dance_floor', 'bar', 'vip', 'entrance'
  polygon_coordinates JSONB NOT NULL,  -- [[x,y], [x,y], ...] for SVG path
  display_order INT NOT NULL DEFAULT 0,
  color_hex TEXT,  -- For visual differentiation
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
)

-- Sections: reservable tables/booths linked to reservation tiers
layout_sections (
  id UUID PK DEFAULT gen_random_uuid(),
  zone_id UUID FK REFERENCES layout_zones(id) ON DELETE CASCADE,
  reservation_tier_id TEXT NOT NULL,  -- Links to existing siteContent.reservation.tiers[].id
  label TEXT NOT NULL,  -- "Table 1", "VIP Booth A"
  coordinates JSONB NOT NULL,  -- {x, y, width, height} or polygon
  capacity_override INT,  -- Override tier default capacity if needed
  minimum_spend_override NUMERIC(10,2),  -- Override tier pricing
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
)

-- Services linked to sections (bottle service, hookah, photography)
section_services (
  id UUID PK DEFAULT gen_random_uuid(),
  section_id UUID FK REFERENCES layout_sections(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,  -- "Premium Bottle Service", "Hookah Setup"
  service_type TEXT,  -- 'beverage', 'amenity', 'photo', 'vip_entrance'
  default_price NUMERIC(10,2),
  staff_role TEXT,  -- 'vip_host', 'server', 'photographer'
  is_default BOOLEAN DEFAULT false,  -- Auto-include with section
  created_at TIMESTAMP NOT NULL DEFAULT now()
)
```

**Indexes:**
- `CREATE INDEX idx_layout_zones_layout_id ON layout_zones(layout_id)`
- `CREATE INDEX idx_layout_sections_zone_id ON layout_sections(zone_id)`
- `CREATE INDEX idx_layout_sections_tier_id ON layout_sections(reservation_tier_id)`
- `CREATE INDEX idx_section_services_section_id ON section_services(section_id)`

#### Shared TypeScript Types

Add to `frontend/src/types/content.ts`:

```typescript
export interface ClubLayout {
  id: string;
  name: string;
  defaultArrivalRoute?: object;
  isActive: boolean;
}

export interface LayoutZone {
  id: string;
  layoutId: string;
  name: string;
  zoneType: 'stage' | 'dance_floor' | 'bar' | 'vip' | 'entrance' | 'other';
  polygonCoordinates: [number, number][];
  displayOrder: number;
  colorHex?: string;
}

export interface LayoutSection {
  id: string;
  zoneId: string;
  reservationTierId: string;
  label: string;
  coordinates: { x: number; y: number; width: number; height: number };
  capacityOverride?: number;
  minimumSpendOverride?: number;
  isAvailable: boolean;
}

export interface SectionService {
  id: string;
  sectionId: string;
  serviceName: string;
  serviceType: 'beverage' | 'amenity' | 'photo' | 'vip_entrance';
  defaultPrice?: number;
  staffRole?: 'vip_host' | 'server' | 'photographer';
  isDefault: boolean;
}
```

---

### 15.2. Backend API

#### Routes

**Public Routes:**
- `GET /api/v1/layout` - Fetch active floor plan for guest reservation flow
- `GET /api/v1/layout/sections/:tierId` - Get sections for a reservation tier

**Admin Routes (require auth):**
- `GET /api/v1/admin/layout` - Full layout with zones, sections, services
- `POST /api/v1/admin/layout` - Create new layout
- `PATCH /api/v1/admin/layout/:id` - Update layout metadata
- `POST /api/v1/admin/layout/:layoutId/zones` - Add zone
- `PATCH /api/v1/admin/layout/zones/:id` - Update zone geometry
- `DELETE /api/v1/admin/layout/zones/:id` - Remove zone
- `POST /api/v1/admin/layout/zones/:zoneId/sections` - Add section
- `PATCH /api/v1/admin/layout/sections/:id` - Update section
- `DELETE /api/v1/admin/layout/sections/:id` - Remove section
- `POST /api/v1/admin/layout/sections/:sectionId/services` - Assign service
- `DELETE /api/v1/admin/layout/services/:id` - Remove service

#### Validation (Zod Schemas)

```typescript
const layoutZoneSchema = z.object({
  name: z.string().min(1).max(100),
  zoneType: z.enum(['stage', 'dance_floor', 'bar', 'vip', 'entrance', 'other']),
  polygonCoordinates: z.array(z.tuple([z.number(), z.number()])).min(3),
  colorHex: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
});

const layoutSectionSchema = z.object({
  reservationTierId: z.string().min(1),
  label: z.string().min(1).max(50),
  coordinates: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().positive(),
    height: z.number().positive()
  }),
  capacityOverride: z.number().int().positive().optional(),
  minimumSpendOverride: z.number().positive().optional()
});
```

#### Service Integration

**Reservation Enrichment:**
When creating reservations, join layout sections to provide:
- Visual floor position for staff
- Assigned services to prep (bottle, hookah, etc.)
- Staff role assignments (VIP host, server)

Update `reservationRepository.ts` to:
```typescript
async getReservationWithLayout(reservationId: string) {
  const reservation = await getReservation(reservationId);
  const sections = await db.select()
    .from(layoutSectionsTable)
    .where(eq(layoutSectionsTable.reservationTierId, reservation.tierId));
  const services = await db.select()
    .from(sectionServicesTable)
    .where(inArray(sectionServicesTable.sectionId, sections.map(s => s.id)));
  return { ...reservation, sections, services };
}
```

---

### 15.3. Admin UI - Layout Editor

#### New "Layout & Services" Workspace

Add route: `/admin/layout` in admin navigation (after Site Configuration)

**Tech Stack:**
- **Canvas Rendering**: [Konva.js](https://konvajs.org/) or [Fabric.js](http://fabricjs.com/) for performant shape rendering, transformations, and drag-and-drop
- **Node/Edge Graphing** (optional): [React Flow](https://reactflow.dev/) for service paths and staff routes
- **Geometry Tools**: Polygon drawing, resize handles, snap-to-grid, collision detection

#### Editor Features

1. **Floor Grid Canvas**
   - SVG or Canvas grid with zoom/pan controls
   - Drag-and-drop zone creation (rectangles, polygons)
   - Visual layer management (zones → sections → services)

2. **Zone Management Panel**
   - List of zones with color-coded chips
   - "Add Zone" button → polygon drawing tool
   - Edit modal: name, type, color, polygon coordinates
   - Delete with confirmation dialog

3. **Section Assignment**
   - Click zone → add section
   - Form: select reservation tier (dropdown from existing tiers), label, capacity override
   - Visual representation of section on canvas with tier color
   - Drag to reposition, resize handles

4. **Service Assignment Matrix**
   - Table view: sections (rows) × services (columns)
   - Toggle checkboxes for default services
   - Staff role dropdowns per section
   - Price overrides

5. **Publishing Workflow**
   - "Save Draft" → saves to DB without activating
   - "Publish" → sets `is_active = true` and deactivates old layout
   - Unsaved changes prompt (reuse `useUnsavedChangesPrompt`)
   - Validation before publish (ensure all sections link to valid tiers)

#### Example Component Structure

```tsx
<LayoutEditor>
  <LayoutCanvas onZoneClick={handleZoneSelect}>
    {zones.map(zone => (
      <Zone key={zone.id} {...zone}>
        {sections.filter(s => s.zoneId === zone.id).map(section => (
          <Section key={section.id} {...section} />
        ))}
      </Zone>
    ))}
  </LayoutCanvas>
  
  <LayoutSidebar>
    <ZoneList zones={zones} onAddZone={handleAddZone} />
    <SectionList sections={selectedZoneSections} onAddSection={handleAddSection} />
    <ServiceMatrix sections={sections} services={allServices} />
  </LayoutSidebar>
</LayoutEditor>
```

---

### 15.4. Guest & Staff Surfaces

#### Public Reservation Flow

**Integration Point:** `/reserve` page

Add floor plan visualization next to tier carousel:
- Render active layout with highlighted sections for selected tier
- Show service icons overlaid on sections
- Click section → auto-select that tier + show services
- Mobile: collapsible floor plan view

**Technical Approach:**
- Fetch layout via `GET /api/v1/layout`
- Filter sections by `reservationTierId === selectedTier.id`
- Render static SVG (non-interactive for guests)
- Use existing availability logic (no changes to reservation math)

#### Operational Dashboard

**Integration Point:** `/admin/reservations` page

Enhance reservation list with:
- Column: "Section" showing layout section label
- Filter by zone: "Show VIP area only"
- Map view: visual floor plan with reservation status overlays
  - Green: confirmed
  - Yellow: pending
  - Red: cancelled
  - Gray: empty

**Staff Prep View:**
- Print-friendly PDF export of tonight's floor plan
- Service checklist per section (bottle service, hookah setup)
- Low-connectivity fallback (cached PNG)

---

### 15.5. Implementation Sequencing

**Phase 1: Schema & Data Layer** (8-12 hours)
1. Create migration: `backend/src/db/migrations/015_club_layout.sql`
2. Add Drizzle models to `schema.ts`
3. Seed baseline layout: one zone, three sections mapped to existing tiers
4. Create layout repository (`backend/src/repositories/layoutRepository.ts`)

**Phase 2: API & Validation** (8-12 hours)
1. Add routes: `/api/v1/layout` (public) and `/api/v1/admin/layout/*` (admin)
2. Implement Zod schemas for validation
3. Write integration tests for CRUD operations
4. Update reservation service to join section data

**Phase 3: Shared Types & Providers** (4-6 hours)
1. Add TypeScript types to `frontend/src/types/layout.ts`
2. Create `useLayout()` hook similar to `useSiteContentContext`
3. Extend `apiClient.ts` with layout fetch functions

**Phase 4: Admin Editor UI** (16-24 hours)
1. Install Konva/Fabric.js: `npm install konva react-konva`
2. Build `LayoutCanvas` component with drag-and-drop
3. Implement zone/section CRUD modals
4. Add service assignment matrix
5. Integrate save/publish workflow with validation
6. Test on desktop and tablet

**Phase 5: Guest & Staff Integration** (8-12 hours)
1. Add static floor plan SVG to `/reserve` page
2. Highlight sections when tier is selected
3. Extend admin reservations table with section column
4. Build print/export view (PDF or PNG)
5. Add mobile-responsive floor plan view

**Phase 6: Testing & QA** (6-10 hours)
1. Unit tests: layout validation, coordinate math
2. E2E tests: create zone → add section → assign to reservation
3. Visual regression tests for canvas rendering
4. Manual testing: drag-and-drop UX, mobile gestures
5. Performance testing: large layouts (50+ sections)

---

### 15.6. Technical Risks & Mitigations

**Risk**: Complex geometry management (polygon intersections, collision detection)  
**Mitigation**: Use proven libraries (Turf.js for geometry), start with simple rectangles before polygons

**Risk**: Mobile UX for drag-and-drop editor  
**Mitigation**: Admin editor is desktop-first (staff use laptops); guests get static SVG view

**Risk**: Canvas performance with 50+ sections  
**Mitigation**: Konva handles this well; use virtualization for large layouts; implement zoom levels

**Risk**: Breaking existing reservations if tiers change  
**Mitigation**: Soft delete old sections, maintain backward compatibility via `tierId` references

---

### 15.7. Success Metrics

**Business Impact:**
- 📈 Reservation conversion rate increase (visual floor plan = higher trust)
- ⏱️ Staff prep time reduction (know exact guest locations)
- 💰 Service upsell rate (in-context service offerings)

**Technical Metrics:**
- Layout editor load time < 2 seconds
- Canvas interactions at 60fps
- Floor plan rendering on `/reserve` < 500ms
- Zero reservation flow regressions

---

### 15.8. Future Enhancements (Post-MVP)

- **Real-time Occupancy**: WebSocket updates showing live section status
- **3D Floor Plans**: Three.js for immersive guest preview
- **Heatmaps**: Analyze popular sections over time
- **Dynamic Pricing**: Surge pricing for high-demand sections
- **Guest Preferences**: Remember favorite sections per guest profile

---

**Dependencies Before Starting:**
- ✅ Section 9: Admin User Management (multiple staff need access)
- ✅ Section 11: Complete reservation flow (tier system finalized)
- ✅ Section 8: Testing infrastructure (E2E coverage critical)

**Estimated Total Effort:** 40-60 hours  
**Recommended Team Size:** 1 full-stack developer  
**Timeline:** 2-3 weeks of focused work

