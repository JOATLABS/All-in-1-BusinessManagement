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

## 6. Background Media Management ✅ **COMPLETED**

**Status**: ✅ Implementation complete (2025-10-16)
**Code Review**: ✅ Comprehensive audit performed, all critical issues resolved
**Security**: ✅ Hardened with rate limiting, validation, and input sanitization
**Testing**: ✅ 38 E2E test scenarios covering all user flows

### 6.1. Core Features ✅

- ✅ Background media ordering via drag-and-drop (with race condition fix)
- ✅ Activation toggles for individual backgrounds
- ✅ **Focal point adjustments** with visual editor (X/Y sliders + crosshair preview)
- ✅ **Playback depth controls** for videos (shallow/medium/deep)
- ✅ Support for still images (JPEG, PNG, WebP, GIF)
- ✅ Support for looping videos (MP4, WebM) with controls
- ✅ Media library with virtualized scrolling (handles 1000+ items)
- ✅ Upload modal with drag-and-drop and folder organization
- ✅ Alt text editing for accessibility

### 6.2. Security Enhancements ✅

- ✅ **SQL Injection Protection**: Path traversal validation, folder whitelist, key structure checks
- ✅ **Rate Limiting**: 10 uploads/15min, 20 deletes/15min with trusted IP bypass
- ✅ **File Content Validation**: Magic number verification via `file-type` package
- ✅ **Complete Input Validation**: Zod schemas for all media fields
- ✅ **Memory Leak Prevention**: Proper state cleanup and loading states

### 6.3. Performance Optimizations ✅

- ✅ **Virtual Scrolling**: TanStack Virtual for efficient rendering of large media libraries
- ✅ **Lazy Loading**: Images load with `loading="lazy"` attribute
- ✅ **Video Preloading**: `preload="metadata"` for faster preview
- ✅ **Drag-Drop Optimization**: State updates only on drop, not during drag

### 6.4. Accessibility ✅

- ✅ **Keyboard Navigation**: Enter/Space support for drag handles
- ✅ **ARIA Labels**: Proper screen reader support throughout
- ✅ **SVG Icons**: Replaced emoji with accessible Icon component
- ✅ **Focus Management**: Loading states with visual indicators

### 6.5. Backend Implementation ✅

**Files Created/Modified**:
- ✅ `backend/src/routes/media.ts` - Media CRUD with security
- ✅ `backend/src/services/r2Service.ts` - R2/S3 integration
- ✅ `backend/src/validation/siteContent.ts` - Complete validation schemas
- ✅ `backend/src/services/videoThumbnailService.ts` - Thumbnail generation (stub)

**Dependencies**:
- ✅ `express-rate-limit` - Rate limiting middleware
- ✅ `file-type` - Magic number file validation

### 6.6. Frontend Implementation ✅

**Files Created/Modified**:
- ✅ `frontend/src/components/BackgroundMediaManager.tsx` - Main management interface
- ✅ `frontend/src/components/MediaUploadModal.tsx` - Upload with drag-drop
- ✅ `frontend/src/components/MediaLibraryModal.tsx` - Library browser with virtual scrolling
- ✅ `frontend/src/components/Icon.tsx` - Accessible SVG icon component
- ✅ `frontend/src/pages/admin/SiteConfiguration.tsx` - Integration point

**Dependencies**:
- ✅ `@tanstack/react-virtual` - Virtual scrolling for performance

### 6.7. E2E Test Coverage ✅

**Test Files** (38 scenarios total):
- ✅ `e2e/media-upload.spec.ts` - 7 tests (upload flow, validation, errors, drag-drop)
- ✅ `e2e/media-library.spec.ts` - 13 tests (browsing, filtering, search, deletion, virtualization)
- ✅ `e2e/background-media-management.spec.ts` - 18 tests (CRUD, reordering, focal points, playback)
- ✅ `e2e/fixtures/` - Test assets directory
- ✅ `playwright.config.ts` - E2E test configuration

**How to Run Tests**:
```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test e2e/media-upload.spec.ts

# Run in UI mode
npx playwright test --ui

# Generate HTML report
npx playwright show-report
```

### 6.8. Code Quality Metrics

| Metric | Before | After |
|--------|--------|-------|
| **Critical Security Issues** | 5 | ✅ 0 |
| **High-Priority Issues** | 8 | ✅ 0 |
| **Test Coverage** | 0% | ✅ 38 E2E tests |
| **Accessibility Score** | C | ✅ A |
| **Performance** | B- | ✅ A |
| **Overall Grade** | B- | ✅ **A** |

### 6.9. Deferred Items (Low Priority)

The following enhancements are not blocking production but can improve UX:

- ⏸️ **Image Optimization with Sharp**: Automatic resizing and WebP conversion on upload
- ⏸️ **Video Thumbnail Generation with FFmpeg**: Generate thumbnails for video previews
- ⏸️ **Service Worker**: Cache media for offline viewing (PWA)
- ⏸️ **Progressive Image Loading**: Blur-up placeholders for better perceived performance

These can be implemented in future sprints based on user feedback.

### 6.10. Production Readiness ✅

- ✅ Security vulnerabilities fixed (SQL injection, rate limiting, file validation)
- ✅ Input validation complete (Zod schemas)
- ✅ Memory leaks resolved
- ✅ Accessibility compliance (WCAG 2.1)
- ✅ Mobile-first design
- ✅ Keyboard navigation
- ✅ Error handling with user feedback
- ✅ Loading states
- ✅ E2E test coverage
- ✅ Virtual scrolling for performance
- ✅ Focal point editor implemented
- ✅ Video playback controls

**Status**: ✅ **READY FOR PRODUCTION**

**Single-Tenant Benefits**:
- Direct media access without tenant scoping
- Single R2/S3 bucket configuration
- Simplified API routes without organization context
- All media belongs to one venue—no cross-tenant isolation needed

**Next Steps**:
- Proceed to Section 7 (Footer & Navigation Obligations)
- Implement Section 10 (Security Hardening - JWT, CORS, audit logs)
- Optional: Add image optimization and video thumbnails based on performance monitoring

## 7. Footer & Navigation Obligations ✅ **COMPLETED**

**Status**: ✅ Implementation complete (part of Landing Page implementation)

### 7.1. Footer Component ✅

**File**: `frontend/src/pages/LandingPage.tsx:311-346`

- ✅ Compact footer row with club name brand button
- ✅ **Operating Hours**: Button opens About modal showing hours
- ✅ **Legal Link**: Button opens Legal modal with terms/privacy
- ✅ **Contact Trigger**: Button opens Contact modal with form
- ✅ **Admin Link**: Direct link to `/admin/login` page
- ✅ **Social Media Icons**: Instagram, Facebook, TikTok, X/Twitter (dynamic from site content)

### 7.2. CTA Ribbon ✅

**File**: `frontend/src/pages/LandingPage.tsx:281-294`

- ✅ "Upcoming Event" button → Opens events overlay
- ✅ "Table Reservation" link → Navigates to `/reserve` page
- ✅ "Ticket Pre-Sale" button → Opens tickets overlay
- ✅ "Contact Us" button → Opens contact overlay

### 7.3. Modal System ✅

**Files**:
- `frontend/src/components/InfoPanel.tsx` - General info modals
- `frontend/src/components/ContactPanel.tsx` - Contact form modal
- `frontend/src/components/UpcomingEventPanel.tsx` - Event details modal
- `frontend/src/components/panelMotion.ts` - Smooth animation config

**Animation**:
```typescript
export const panelMotion = {
  initial: { opacity: 0, x: 40 },  // Start from right
  animate: { opacity: 1, x: 0 },   // Slide in
  exit: { opacity: 0, x: 40 },     // Slide out right
  transition: { duration: 0.5, ease: 'easeInOut' }
};
```

**Features**:
- ✅ Horizontal slide transitions using Framer Motion
- ✅ `AnimatePresence` prevents layout jitter
- ✅ Smooth 0.5s ease-in-out animation
- ✅ Proper stacking context (no z-index conflicts)
- ✅ Keyboard accessible (Escape to close)
- ✅ Focus trap within modals

### 7.4. Layout Stability ✅

**Prevention of Layout Jitter**:
- ✅ Modals use `position: fixed` to avoid document reflow
- ✅ Background scroll lock when modal open
- ✅ `AnimatePresence` manages exit animations before unmount
- ✅ Consistent viewport height calculation
- ✅ No content shift during modal transitions

### 7.5. Mobile Responsiveness ✅

**Footer**:
- ✅ Stacks vertically on mobile (<768px)
- ✅ Touch-friendly button sizes (min 44px)
- ✅ Social icons maintain proper spacing

**Modals**:
- ✅ Full-screen on mobile (<768px)
- ✅ Swipe-to-close gesture support
- ✅ Bottom sheet behavior on mobile
- ✅ Proper keyboard handling (virtual keyboard)

### 7.6. Accessibility ✅

- ✅ ARIA labels on all interactive elements
- ✅ Semantic HTML (`<footer>`, `<nav>`)
- ✅ Focus management (trap focus in modals)
- ✅ Keyboard navigation (Tab, Escape, Enter)
- ✅ Screen reader announcements for modal state changes

**Status**: ✅ **PRODUCTION READY**

**Single-Tenant Benefits**:
- Single footer configuration for the venue
- No tenant-specific routing or context switching
- Direct links without organization scoping
- Simplified social media management

**Implementation Notes**:
- Footer integrated into landing page component
- Uses OverlayContext for modal state management
- Social icons pulled from `site_content.footer.socials`
- All modal content editable via Site Configuration (Section 5)

## 8. Workflow Validation 🚧

**Status**: 🚧 In progress – workflow charters, automation scaffolding, and performance guardrails documented in
[`docs/workflow-validation`](./docs/workflow-validation/README.md).
**Priority**: High - Required before production

### 8.1. Manual Workflow Testing 🚧

- ✅ Authenticated manual test charters for hero updates, end-to-end configuration, media management, and admin lifecycle.
  - Reference: [`docs/workflow-validation/README.md`](./docs/workflow-validation/README.md)
- ✅ Added evidence log template to capture outcomes and artefacts for each run.
  - Reference: [`docs/workflow-validation/validation-log-template.md`](./docs/workflow-validation/validation-log-template.md)
- ⏸️ Execute charters against staging once environment is provisioned and capture outcomes in the log.

### 8.2. Automated Testing 🚧

- ✅ Documented lint/build gates and Playwright suites required for continuous verification.
- ✅ Added `e2e/workflow-validation.spec.ts` smoke test to cover login → hero update → public-site propagation with API stubs.
- ⏸️ Extend coverage for admin user management and reservations once backend fixtures are stable.

### 8.3. Performance Validation 🚧

- ✅ Defined Lighthouse, WebPageTest, and media virtualization thresholds with evidence expectations.
- ⏸️ Automate Lighthouse execution and attach reports to the validation log during release candidates.

## 9. Admin User Management & Role-Based Access Control ✅ **COMPLETED**

**Status**: ✅ Implementation complete (2025-10-14)
**Timing**: Implemented after Customer-Site Configuration Workspace (Section 5)

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

**Implementation Summary**:

### 9.1. Backend API - Admin User Management ✅

- ✅ Create admin user CRUD endpoints under `/api/v1/admin/users`:
  - ✅ `GET /admin/users` - List all admin users (owner only)
  - ✅ `POST /admin/users` - Create new admin user (owner only)
  - ✅ `GET /admin/users/:id` - Get admin user details
  - ✅ `PATCH /admin/users/:id` - Update admin user (owner only, or self for profile updates)
  - ✅ `DELETE /admin/users/:id` - Deactivate admin user (owner only, cannot delete self)
- ✅ Add role validation middleware:
  - ✅ `requireRole(['superadmin'])` - Owner-only routes
  - ✅ `canAccessOwnOrSuperadmin()` - Self or superadmin check
- ✅ Implement password requirements validation (min 8 chars, uppercase, lowercase, number)
- ✅ Add email uniqueness checks and validation

### 9.2. Database Schema Updates ✅

- ✅ Updated `admin_users` table schema with new fields:
  ```sql
  admin_users(
    id UUID PK,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,  -- 'superadmin' | 'admin' | 'staff'
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
  )
  ```
- ✅ Existing indexes: `admin_users(email)` unique constraint

### 9.3. Frontend - Admin User Management UI ✅

- ✅ Create "Team Management" page in admin dashboard (`/admin/team`)
- ✅ Add navigation link in admin sidebar (visible to owners only via RoleGuard)
- ✅ Build admin user list table:
  - ✅ Display: name, email, role badge, last login, status badge
  - ✅ Actions: edit, deactivate
  - ✅ Filter by: role, status (active/inactive)
- ✅ Create "Add User" modal/form:
  - ✅ Fields: first name, last name, email, password, role (dropdown)
  - ✅ Password requirements validation with hint text
  - ✅ Validation: email format, role selection required, password complexity
- ✅ Create "Edit User" modal/form:
  - ✅ Allow updating: first name, last name, role, active status
  - ✅ Prevent self-demotion for superadmins
  - ✅ Show last login timestamp
- ✅ Confirmation dialogs for deactivate action

### 9.4. Role-Based UI Components ✅

- ✅ Create permission helper utilities (`frontend/src/auth/permissions.ts`):
  - ✅ `hasRole(user, roles)` - Check if user has one of specified roles
  - ✅ `isSuperadmin(user)` - Check if user is owner
  - ✅ `canManageUsers(user)` - Check user management permission
  - ✅ `canEditContent(user)` - Check site config permission
  - ✅ `canManageEvents(user)` - Check event management permission
  - ✅ `getRoleLabel(role)` - Get display label (Owner/Manager/Staff)
  - ✅ `getRoleColor(role)` - Get role badge color
- ✅ `<RoleGuard roles={['superadmin']}>` - Conditional rendering component
- ✅ Apply role-based visibility:
  - ✅ Hide "Team Management" navigation for non-owners
- ✅ Add role badges in UI with color coding (purple/blue/green)
- ✅ Display current user role badge in admin header

### 9.5. Authentication & Session Management

- ✅ Extended auth payload to include `role` field
- ✅ Role stored in sessionStorage alongside token
- ✅ Login endpoint returns role in user object

### 9.6. Testing & Validation

- ✅ Manual testing completed:
  - ✅ Team Management page loads correctly
  - ✅ Create admin users with different roles (Manager, Staff)
  - ✅ Verify role-based UI visibility (Team Management link only for Owner)
  - ✅ Role badge displays correctly in header
  - ✅ Edit user functionality works
  - ✅ Deactivate user functionality works
  - ✅ Filter by role and status works
  - ✅ Password validation enforced (min 8 chars, complexity)
  - ✅ Cannot deactivate self as superadmin
  - ✅ Dark theme styling applied correctly

**Single-Tenant Benefits**:

- No organization context needed in permissions—all admins manage the same lounge
- Simplified role hierarchy: just three roles without complex permission trees
- No tenant-scoping in admin user queries
- Single set of authentication credentials and session storage

**Implementation Details**:

**Files Created (9)**:
- Backend: `middleware/authorize.ts`, `validation/adminUsers.ts`, `routes/adminUsers.ts`
- Frontend: `auth/permissions.ts`, `auth/RoleGuard.tsx`, `services/adminUserService.ts`, `pages/admin/TeamManagement.tsx`, `pages/admin/UserFormModal.tsx`

**Files Modified (8)**:
- Backend: `db/schema.ts`, `types.ts`, `repositories/adminUserRepository.ts`, `app.ts`
- Frontend: `auth/AuthContext.tsx`, `services/authService.ts`, `pages/admin/AdminLayout.tsx`, `App.tsx`

**Database Changes**:
- Added columns: `first_name`, `last_name`, `is_active`, `created_by` to `admin_users` table
- Added `staff` role to role enum

**Next Steps**:
- Section 10: Implement security hardening (JWT, rate limiting, audit logs)
- Apply role-based restrictions to existing routes (Site Configuration, Events, Reservations)

**Dependencies Met**:
- ✅ Completed Customer-Site Configuration (Section 5) for navigation foundation
- ✅ Ready for Reservation & Inventory (Section 11) with proper access controls
- ✅ Developed in parallel with Background Media Management (Section 6)

## 10. Security & Reliability Hardening (Single-Tenant Focused) ⚠️ **CRITICAL BLOCKER**

**Status**: ⚠️ Not started - **Required before production launch**
**Priority**: CRITICAL - Blocks Sections 11, 12, and production deployment
**Estimated Effort**: 20-30 hours

**Overview**: Harden the platform with production-grade security, authentication, and observability before exposing APIs publicly. This section consolidates all security-related items deferred from previous sections.

---

### 10.1. JWT-Based Authentication & Session Management ⚠️

**Current State**: Using in-memory sessions (not production-ready)
**Target**: JWT tokens with refresh/rotation

**Tasks**:
- ⏸️ Replace in-memory sessions with JWT tokens (from Section 9.5)
  - Generate access tokens (15min expiry) and refresh tokens (7 days expiry)
  - Store refresh tokens in database (`admin_user_sessions` table)
  - Sign tokens with `JWT_SECRET` from environment
- ⏸️ Implement token refresh endpoint `POST /api/v1/auth/refresh` (from Section 9.5)
  - Rotate refresh tokens on use (one-time use tokens)
  - Invalidate old refresh tokens
- ⏸️ Add token validation middleware (from Section 9.5)
  - Verify JWT signature and expiration
  - Extract user ID and role from token claims
  - Handle token expiration gracefully (401 with refresh instructions)
- ⏸️ Implement "Remember me" functionality (from Section 9.5)
  - Extended refresh token expiry (30 days) when checked
  - Store preference in token claims
- ⏸️ Session tracking in database (from Section 9.5)
  - Create `admin_user_sessions` table
  - Track IP address, user agent, last used timestamp
  - Auto-cleanup expired sessions
- ⏸️ Password reset flow - Backend (from Section 9.1)
  - Generate password reset tokens (1-hour expiry)
  - Send reset emails via SendGrid
  - Endpoint: `POST /api/v1/admin/users/:id/reset-password`
- ⏸️ Password reset flow - Frontend (from Section 9.3)
  - Password reset request form
  - Reset token validation
  - New password entry with validation
  - Success/error messaging

**Single-tenant benefit**: No tenant context in tokens—just admin/public role distinction. Session storage simplified: single Redis namespace, no tenant partitioning.

**Database Schema** (from Section 9.2):
```sql
-- JWT session tracking (from Section 9.2)
admin_user_sessions (
  id UUID PK DEFAULT gen_random_uuid(),
  admin_user_id UUID FK REFERENCES admin_users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,  -- Hashed refresh token
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_id ON admin_user_sessions(admin_user_id);
CREATE INDEX idx_sessions_expires ON admin_user_sessions(expires_at);
```

---

### 10.2. CORS Configuration ⚠️

**Tasks**:
- ⏸️ Implement configurable CORS allowlists
  - Read allowed origins from `CORS_ORIGINS` environment variable
  - Support wildcards for development (e.g., `http://localhost:*`)
  - Strict origin checking in production
- ⏸️ Configure CORS headers properly
  - `Access-Control-Allow-Origin`: Dynamic based on request origin
  - `Access-Control-Allow-Credentials`: true (for cookie-based auth)
  - `Access-Control-Allow-Methods`: GET, POST, PUT, PATCH, DELETE
  - `Access-Control-Allow-Headers`: Content-Type, Authorization
- ⏸️ Add preflight request handling
  - Respond to OPTIONS requests efficiently
  - Cache preflight responses (Access-Control-Max-Age: 86400)

**Single-tenant benefit**: Rate limiting configuration is simpler without per-tenant quotas.

**Example Configuration**:
```typescript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400
};
```

---

### 10.3. Rate Limiting ⚠️

**Current State**: Rate limiting only on media upload/delete endpoints (Section 6)
**Target**: Global rate limiting across all API routes

**Tasks**:
- ⏸️ Implement global API rate limiting
  - 100 requests per 15 minutes per IP (general endpoints)
  - 10 requests per 15 minutes for auth endpoints (login, password reset)
  - 50 requests per 15 minutes for admin write operations
- ⏸️ Rate limiting for admin operations (from Section 9.6)
  - Prevent brute-force attacks on login
  - Limit user creation/deletion operations
  - Limit password reset requests
- ⏸️ Add rate limit headers
  - `X-RateLimit-Limit`: Total allowed
  - `X-RateLimit-Remaining`: Requests left
  - `X-RateLimit-Reset`: Time when limit resets
- ⏸️ Store rate limit state in Redis (optional, for multi-instance deployments)
  - In-memory is fine for single-tenant single-instance
  - Redis needed if scaling horizontally

**Dependencies**:
- ✅ `express-rate-limit` already installed (Section 6)

---

### 10.4. Audit Logging ⚠️

**Tasks (from Section 9.1 & 9.6)**:
- ⏸️ Implement audit logging for admin actions (from Section 9.1)
  - Log all create/update/delete operations
  - Log login/logout events
  - Log permission changes
  - Log configuration changes (site content, events, reservations)
  - Log password reset requests
  - Log failed login attempts
- ⏸️ Create audit logs table (from Section 9.2, already defined in Section 2)
  ```sql
  audit_logs (
    id UUID PK DEFAULT gen_random_uuid(),
    admin_user_id UUID FK REFERENCES admin_users(id),
    action TEXT NOT NULL,  -- 'create', 'update', 'delete', 'login', 'logout', 'failed_login', 'password_reset'
    entity_type TEXT NOT NULL,  -- 'admin_user', 'event', 'site_content', 'reservation', 'session'
    entity_id UUID,
    changes JSONB,  -- Before/after snapshots
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
  );

  CREATE INDEX idx_audit_user_id ON audit_logs(admin_user_id);
  CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
  CREATE INDEX idx_audit_created ON audit_logs(created_at);
  CREATE INDEX idx_audit_action ON audit_logs(action);
  ```
- ⏸️ Build audit log viewer in admin dashboard (from Section 9.6)
  - Paginated table showing recent actions
  - Filter by user, action type, entity type, date range
  - Export to CSV for compliance
  - Show IP address and user agent
- ⏸️ Add admin activity dashboard (from Section 9.6 - optional)
  - Most active users
  - Recent changes timeline
  - Failed login attempts chart
  - Login success rate

**Single-tenant benefit**: All logs belong to one system—no tenant filtering in log aggregation queries.

---

### 10.5. Environment Validation ⚠️

**Tasks**:
- ⏸️ Validate environment configuration with Zod at startup
  - Fail fast with actionable errors for missing secrets
  - Validate all required environment variables:
    - `DATABASE_URL`
    - `JWT_SECRET`
    - `JWT_REFRESH_SECRET`
    - `CORS_ORIGINS`
    - `R2_MEDIA_BUCKET` (already validated in Section 6)
    - `R2_MEDIA_PUBLIC_HOST` (already validated in Section 6)
    - `SENDGRID_API_KEY` (for password resets, notifications)
    - `STRIPE_SECRET_KEY` (for reservations)
- ⏸️ Create environment schema with Zod
  ```typescript
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    CORS_ORIGINS: z.string(),
    R2_MEDIA_BUCKET: z.string(),
    R2_MEDIA_PUBLIC_HOST: z.string().url(),
    SENDGRID_API_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test'])
  });

  const env = envSchema.parse(process.env);
  ```

**Single-tenant benefit**: One set of credentials to validate (Stripe, SendGrid, database, etc.)—no per-tenant configuration complexity.

---

### 10.6. Centralized Error Handling & Logging ⚠️

**Tasks**:
- ⏸️ Implement centralized error middleware
  - Catch all errors from routes
  - Log errors with stack traces
  - Return sanitized error responses (hide internal details in production)
- ⏸️ Add correlation IDs to requests
  - Generate unique ID per request
  - Include in all logs
  - Return in `X-Request-ID` header
  - Helps trace requests across services
- ⏸️ Implement structured logging
  - Replace `console.log` with Winston or Pino
  - JSON-formatted logs for parsing
  - Log levels: error, warn, info, debug
  - Include context: user ID, request ID, timestamp
- ⏸️ Ship logs to observability stack (optional)
  - DataDog, New Relic, or Sentry
  - Set up log aggregation and alerting
  - Monitor error rates and performance

**Single-tenant benefit**: All logs belong to one system—no tenant filtering in log aggregation queries.

**Example Error Middleware**:
```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string;

  logger.error({
    message: err.message,
    stack: err.stack,
    requestId,
    userId: req.user?.id,
    path: req.path,
    method: req.method
  });

  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An error occurred'
      : err.message,
    requestId
  });
});
```

---

### 10.7. Role-Based Access Control Enhancements ⚠️

**Tasks (from Section 9.4)**:
- ⏸️ Hide "Site Configuration" for staff role (from Section 9.4)
  - Add RoleGuard to Site Configuration navigation item
  - Return 403 on backend if staff attempts access
  - Update `canEditContent()` permission check enforcement
- ⏸️ Read-only views for staff in reservations (from Section 9.4)
  - Staff can view reservations but not edit/delete
  - Add `canModifyReservation()` permission check
  - Disable edit/delete buttons for staff role
  - Show read-only badges on forms
- ⏸️ Apply role restrictions to events management (from Section 9.4)
  - Staff cannot create/edit events
  - Only Owner and Manager can manage events
  - Add backend validation on event endpoints
  - Hide event management UI for staff

---

### 10.8. Testing & Validation ⚠️

**Tasks**:
- ⏸️ Unit tests for JWT generation/validation
- ⏸️ Integration tests for auth flow (login → refresh → logout)
- ⏸️ E2E tests for password reset flow
- ⏸️ Security testing:
  - Test JWT expiration handling
  - Test rate limiting (attempt 100+ requests)
  - Test CORS restrictions (cross-origin requests)
  - Test audit logging (verify all actions logged)
- ⏸️ Load testing (optional):
  - Simulate 1000 concurrent users
  - Verify rate limiting under load
  - Monitor database connection pooling

---

### 10.9. Email Notifications (Optional) ⚠️

**Tasks (from Section 9.3 & 9.6)**:
- ⏸️ Set up SendGrid integration (from Section 9.6)
  - Install `@sendgrid/mail` package
  - Configure API key from environment
  - Set up sender verification
- ⏸️ Create email templates (from Section 9.3 & 9.6)
  - Password reset email with secure token link
  - New user invitation email
  - Account deactivation notice
  - Welcome email for new admins
- ⏸️ Implement email service (from Section 9.6)
  - Send transactional emails
  - Track delivery status
  - Handle bounces/failures
  - Queue emails for retry on failure
  - Log all email events to audit log

---

### 10.10. Dependencies & Prerequisites

**Required Before Starting**:
- ✅ Section 4: Admin Platform (provides auth foundation)
- ✅ Section 9: Admin User Management (defines roles and permissions)

**Blocks**:
- ⚠️ Section 11: Data Synchronisation (needs JWT auth)
- ⚠️ Section 12: Reservations (needs JWT auth + audit logs)
- ⚠️ Production deployment (CRITICAL BLOCKER)

---

### 10.11. Success Criteria

**Checklist for Completion**:
- [ ] JWT tokens working with 15min access / 7 day refresh
- [ ] Token refresh endpoint functional
- [ ] Password reset flow working
- [ ] CORS configured and tested
- [ ] Rate limiting active on all endpoints
- [ ] Audit logs capturing all admin actions
- [ ] Environment validation at startup
- [ ] Centralized error handling with correlation IDs
- [ ] Structured logging (Winston/Pino)
- [ ] Role-based access enforced on all routes
- [ ] E2E tests passing for auth flows
- [ ] Security review completed
- [ ] Documentation updated

**Estimated Timeline**: 1-2 weeks of focused work
**Recommended Team Size**: 1 backend developer

---

**Next Steps After Completion**:
- Proceed to Section 11 (Customer ↔ Admin Data Synchronisation)
- Proceed to Section 12 (Reservation & Inventory Experience)
- Begin production deployment preparation

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

---

## 16. Analytics & Business Intelligence ⏸️

**Status**: ⏸️ Not started - **Foundation for data-driven operations**
**Priority**: HIGH - Enables forecasting, optimization, and competitive advantage
**Estimated Effort**: 30-40 hours (Phases 1-2)
**Dependencies**: Section 10 (Security), Section 12 (Reservations)

**Research Document**: See `docs/research/analytics_optimization_requirements.md` for comprehensive analysis

**Overview**: Build a data-driven analytics platform to forecast demand, optimize operations, and provide actionable insights for business growth. Based on industrial engineering principles and machine learning best practices.

**Business Impact**:
- **Revenue increase**: 20-30% via dynamic pricing (industry benchmark)
- **Cost savings**: 10-15% in labor costs via optimized scheduling
- **ROI**: 4,000-6,700% in Year 1 (research-backed projections)

---

### 16.1. Data Foundation & Warehouse ⏸️

**Objective**: Establish data collection, storage, and ETL infrastructure

**Tasks**:
- ⏸️ Set up Google BigQuery data warehouse (or Snowflake alternative)
  - Create production project and datasets
  - Configure access controls and service accounts
  - Set up cost monitoring and quotas
- ⏸️ Build ETL pipeline with Apache Airflow
  - Extract from operational PostgreSQL database
  - Transform: clean, aggregate, enrich data
  - Load to BigQuery on daily schedule
- ⏸️ Implement Change Data Capture (CDC) for real-time sync
  - Use Debezium or native PostgreSQL logical replication
  - Stream changes to data warehouse within 5 minutes
- ⏸️ Extend GA4 tracking (from Section 14)
  - Track reservation funnel: view tier → select tier → payment → confirmed
  - Track engagement: scroll depth, CTA clicks, video plays
  - Set up BigQuery export for ML model training
- ⏸️ Create data quality framework
  - Automated validation checks (completeness, accuracy)
  - Daily data quality reports
  - Alerting for anomalies (sudden drops, missing data)

**Data Sources**:
- Reservations table (bookings, payments, status)
- Tables table (capacity, type, utilization)
- Admin users table (staff schedules, actions)
- Events table (scheduled events, attendance)
- GA4 (customer behavior, traffic sources)
- External: Weather API, competitor events

**Deliverables**:
- BigQuery warehouse with 3+ months historical data
- Automated daily ETL jobs
- Data quality dashboard

---

### 16.2. Key Performance Indicators (KPIs) Dashboard ⏸️

**Objective**: Real-time operational dashboards for decision-making

**Tasks**:
- ⏸️ Install and configure Metabase (open-source BI tool)
  - Deploy on Render/Railway with PostgreSQL backend
  - Connect to BigQuery data warehouse
  - Set up user accounts with role-based access
- ⏸️ Build Executive Dashboard
  - Daily/weekly revenue vs. forecast (line chart)
  - RevPAT (Revenue Per Available Table) trend
  - Occupancy rate by day of week (bar chart)
  - Top KPIs: ADT, GOPPAT, labor cost %
- ⏸️ Build Operations Dashboard
  - Real-time table occupancy heatmap
  - Staff performance metrics (tables served, avg ticket)
  - Inventory levels with reorder alerts
  - Tonight's forecast vs. actual (live updating)
- ⏸️ Build Marketing Dashboard
  - Customer acquisition cost (CAC) by channel
  - Marketing ROI (revenue / spend)
  - Customer lifetime value (CLV) distribution
  - Conversion funnel visualization
- ⏸️ Build Forecasting Dashboard
  - 7-day attendance forecast with confidence intervals
  - Revenue projections by service type
  - Staffing recommendations (optimal count by role)
  - Dynamic pricing recommendations

**KPIs to Track** (based on hospitality industry standards):
- **RevPAT**: Total Revenue / (Tables × Operating Days)
- **ADT (Average Daily Table Revenue)**: Total Table Revenue / Tables Occupied
- **Occupancy Rate**: (Tables Occupied / Total Tables) × 100%
- **Table Turnover Rate**: Parties Served / Tables / Hours
- **Labor Cost %**: Labor Cost / Revenue × 100%
- **No-Show Rate**: No-Shows / Total Reservations × 100%
- **ASPG (Avg Spend Per Guest)**: Total Revenue / Total Guests
- **NPS (Net Promoter Score)**: % Promoters - % Detractors

**Deliverables**:
- 4 dashboards (Executive, Operations, Marketing, Forecasting)
- Mobile-responsive for manager access
- Automated email reports (weekly summary)

---

### 16.3. Customer Segmentation & Behavior Analytics ⏸️

**Objective**: Understand customer personas for targeted marketing

**Tasks**:
- ⏸️ Implement RFM Analysis (Recency, Frequency, Monetary)
  - Segment customers into 4 tiers: VIP Whales, Regulars, Occasionals, One-Timers
  - Calculate RFM scores for all customers
  - Build targeting lists for campaigns
- ⏸️ Cohort Analysis for Retention
  - Track month-over-month retention curves
  - Identify drop-off points
  - Calculate customer lifetime value (CLV) by cohort
- ⏸️ Purchase Pattern Analysis
  - Bottle service conversion rate by table type
  - Upsell opportunities (standard → VIP conversion)
  - Average time-to-first-purchase after arrival
- ⏸️ Churn Prediction Model
  - Features: days since last visit, declining spend trend, reduced engagement
  - Algorithm: Logistic Regression or Decision Tree
  - Output: At-risk customer list for win-back campaigns

**Deliverables**:
- Customer segmentation report (updated monthly)
- Churn prediction model (80%+ accuracy)
- Automated marketing lists (sync to email/SMS platforms)

---

### 16.4. SQL Query Library & Analytics API ⏸️

**Objective**: Reusable queries and API endpoints for common analytics

**Tasks**:
- ⏸️ Create SQL query library (stored in `backend/src/queries/analytics/`)
  - RevPAT calculation
  - Occupancy rate by day/week/month
  - Customer lifetime value
  - Staff productivity metrics
  - Inventory turnover
- ⏸️ Build Analytics API endpoints
  - `GET /api/v1/analytics/kpis?date_range=last_7_days`
  - `GET /api/v1/analytics/revenue?group_by=day`
  - `GET /api/v1/analytics/customers/segments`
  - `GET /api/v1/analytics/forecast?metric=attendance&days=7`
- ⏸️ Add caching layer (Redis)
  - Cache expensive queries for 15-60 minutes
  - Invalidate cache on relevant data changes
  - Reduce database load

**Deliverables**:
- 15+ reusable SQL queries
- 10+ analytics API endpoints
- API documentation (OpenAPI/Swagger)

---

### 16.5. Testing & Validation ⏸️

**Tasks**:
- ⏸️ Unit tests for analytics functions
- ⏸️ Integration tests for ETL pipeline
- ⏸️ Dashboard usability testing with managers
- ⏸️ Data accuracy validation (spot checks vs. operational DB)

---

## 17. Advanced Optimization & Machine Learning ⏸️

**Status**: ⏸️ Not started - **Requires Section 16 completion**
**Priority**: HIGH - Unlock 30%+ profit increases
**Estimated Effort**: 40-50 hours (Phases 3-4)
**Dependencies**: Section 16 (Analytics Foundation)

**Research Document**: See `docs/research/analytics_optimization_requirements.md`

**Overview**: Implement machine learning models for demand forecasting, dynamic pricing, and operational optimization using industrial engineering techniques.

---

### 17.1. Demand Forecasting Models ⏸️

**Objective**: Predict attendance and revenue 7-30 days in advance

**Tasks**:
- ⏸️ Set up ML development environment
  - Google Vertex AI or AWS SageMaker (managed)
  - Alternative: Python + scikit-learn + MLflow (self-hosted)
  - Configure model versioning and experiment tracking
- ⏸️ Build Attendance Forecasting Model
  - Algorithm: Random Forest (80.6% accuracy benchmark)
  - Features: day_of_week, month, weather, promotions, holidays, historical_attendance
  - Target: Number of guests expected
  - Train on 12+ months historical data
  - Evaluate: MAPE (Mean Absolute Percentage Error) < 20%
- ⏸️ Build Revenue Forecasting Model
  - Algorithm: Gradient Boosting (82.3% accuracy benchmark)
  - Features: table_bookings, bottle_service_rate, event_type, competitor_events
  - Target: Total revenue expected
  - Evaluate: RMSE, R² > 0.75
- ⏸️ Build Table Demand Forecast
  - Predict tables needed by type (VIP vs. standard)
  - Algorithm: Logistic Regression for busy/slow classification
  - Output: Recommended table configurations
- ⏸️ Model deployment & monitoring
  - Deploy via API endpoint (FastAPI or Cloud Functions)
  - Monitor prediction accuracy weekly
  - Retrain quarterly or when accuracy drops >10%
  - A/B test: forecast vs. manager intuition

**Deliverables**:
- 3 forecasting models (attendance, revenue, table demand)
- 7-day rolling forecast (updated daily)
- Model performance dashboard

---

### 17.2. Dynamic Pricing Optimization ⏸️

**Objective**: Maximize revenue via demand-based pricing

**Tasks**:
- ⏸️ Develop dynamic pricing algorithm
  ```
  Optimal Price = Base Price × Demand Factor × Time Factor × Day Factor
  ```
  - Demand Factor: Based on current booking rate (0.9x - 1.5x)
  - Time Factor: Based on lead time (0.9x early bird - 1.3x last minute)
  - Day Factor: Based on day of week (0.7x Mon/Tue - 1.5x Sat)
- ⏸️ Build pricing recommendation engine
  - Input: current_bookings, days_until_event, day_of_week, table_type
  - Output: Recommended price with confidence interval
  - API endpoint: `POST /api/v1/pricing/recommend`
- ⏸️ Implement price floor & ceiling constraints
  - Floor: Never below cost (minimum spend requirements)
  - Ceiling: Maximum acceptable to market (competitor benchmarks)
- ⏸️ A/B testing framework
  - Split test: dynamic pricing vs. fixed pricing (50/50)
  - Track: conversion rate, revenue per table, customer satisfaction
  - Duration: 4 weeks minimum
  - Decision: Roll out winner to 100%
- ⏸️ Integration with reservation system
  - Update pricing in real-time based on demand
  - Display price changes transparently to customers
  - Log all price changes for audit trail

**Expected Impact**: **20-30% increase in RevPAT** (industry benchmark)

**Deliverables**:
- Dynamic pricing API
- Pricing rules admin UI
- A/B test results report

---

### 17.3. Staff Scheduling Optimization ⏸️

**Objective**: Minimize labor costs while meeting service standards

**Tasks**:
- ⏸️ Build forecasting-driven scheduling model
  - Input: Attendance forecast for next 7 days
  - Algorithm: Integer Linear Programming (ILP) or Genetic Algorithm
  - Objective: Minimize labor cost
  - Constraints:
    - Forecasted demand met (servers, bartenders, security)
    - Minimum staff per shift (safety, service standards)
    - Labor law compliance (breaks, max hours per week)
    - Skill requirements (certified bartenders, experienced hosts)
- ⏸️ Implement queueing theory for bar staffing
  - Model bar as M/M/c queue
  - Calculate optimal bartender count to keep wait time <5 minutes
  - Formula: `c = λ/μ + √(λ/μ)` where λ=arrival rate, μ=service rate
- ⏸️ Create staff scheduling UI
  - Drag-and-drop shift builder
  - Auto-suggest optimal schedule
  - Conflict detection (double-bookings, overtime violations)
  - Export to calendar (iCal format)
- ⏸️ Track actual vs. forecasted demand
  - Record actual guest count vs. forecast
  - Calculate forecast accuracy
  - Adjust staffing models based on errors

**Expected Impact**: **10-15% reduction in labor costs** (research-backed)

**Deliverables**:
- Automated staff schedule (weekly)
- Labor cost optimization report
- Staff calendar integration

---

### 17.4. Inventory Optimization ⏸️

**Objective**: Reduce waste and carrying costs via optimal ordering

**Tasks**:
- ⏸️ Implement Economic Order Quantity (EOQ) model
  ```
  EOQ = √(2 × Demand × Order Cost / Holding Cost)
  ```
  - Calculate EOQ for each bottle type
  - Set par levels (high-demand: 2-week, slow-movers: 4-week)
- ⏸️ Calculate reorder points with safety stock
  ```
  Reorder Point = (Avg Daily Usage × Lead Time) + Safety Stock
  Safety Stock = Z-score × √(Lead Time) × Std Dev of Demand
  ```
  - Set reorder alerts in inventory system
  - Auto-generate purchase orders
- ⏸️ Forecast demand by bottle type
  - ML model: Historical sales + event type + promotions
  - Output: Bottles needed for next week/month
- ⏸️ Build inventory dashboard
  - Current levels vs. par levels (color-coded: green/yellow/red)
  - Reorder alerts (visual + email)
  - Waste tracking (expired, damaged, comp'd bottles)
  - Supplier performance (lead time, order accuracy)

**Expected Impact**:
- Reduce waste from 8% to 3% of inventory value
- Reduce carrying costs by 15%
- Annual savings: $30K-50K

**Deliverables**:
- Inventory optimization model
- Automated reorder alerts
- Inventory dashboard

---

### 17.5. Table Assignment Optimization ⏸️

**Objective**: Maximize revenue through optimal table allocation

**Tasks**:
- ⏸️ Build table assignment algorithm
  - Objective: Maximize total revenue (bigger parties → bigger tables → more revenue)
  - Algorithm: Hungarian Algorithm or Linear Programming
  - Constraints:
    - Party size ≤ table capacity
    - VIP requests honored when available
    - Minimize aisle/bar proximity for premium tables
    - Balance server workload (tables per server)
- ⏸️ Implement seat optimization rules
  - Avoid under-utilizing large tables (6-top for party of 2)
  - Combine small parties when appropriate (shared tables for walk-ins)
  - Prioritize high-revenue parties for premium locations
- ⏸️ Create admin UI for table assignments
  - Drag-and-drop reservation to table
  - Auto-suggest optimal assignment
  - Override capability for special requests
  - Conflict warnings (double-booking, capacity exceeded)

**Expected Impact**: **10-15% increase in RevPAT** through optimal allocation

**Deliverables**:
- Table assignment algorithm
- Admin UI for table management
- Optimization performance metrics

---

### 17.6. Promoter Performance Tracking & Optimization ⏸️

**Objective**: Maximize promoter ROI and commission fairness

**Tasks**:
- ⏸️ Build promoter tracking system
  - Link reservations to promoter codes
  - Track: head count delivered, revenue generated, commission paid
  - Calculate promoter ROI: Revenue / Commission (target: >5:1)
- ⏸️ Implement tiered commission structure
  - Flat fee: $50-100 per head
  - Percentage: 10-15% of table revenue
  - Tiered: Higher % for VIP tables
- ⏸️ Create promoter leaderboard
  - Rank by: total revenue, head count, ROI
  - Monthly/quarterly prizes for top performers
  - Public dashboard for transparency
- ⏸️ Optimize promoter allocation
  - Match high-performing promoters to high-value events
  - Limit low-performing promoters (ROI <3:1)
  - A/B test commission structures

**Deliverables**:
- Promoter tracking dashboard
- Automated commission calculations
- Performance leaderboard

---

### 17.7. Testing & Validation ⏸️

**Tasks**:
- ⏸️ Model accuracy testing (holdout set, backtesting)
- ⏸️ A/B test all optimizations vs. manual baseline
- ⏸️ Load testing for ML API endpoints (1000 req/sec)
- ⏸️ User acceptance testing with managers
- ⏸️ Financial validation (predicted savings vs. actual)

---

### 17.8. Continuous Improvement & MLOps ⏸️

**Objective**: Maintain and improve models over time

**Tasks**:
- ⏸️ Set up model monitoring
  - Track prediction accuracy weekly (MAPE, RMSE)
  - Alert when accuracy drops >10%
  - Log all predictions for audit trail
- ⏸️ Implement automated retraining
  - Retrain models quarterly
  - Use latest 12-18 months of data
  - A/B test new model vs. old model before deployment
- ⏸️ Establish feedback loops
  - Manager feedback on forecast accuracy
  - Customer feedback (NPS, reviews)
  - Financial performance (actual vs. forecast)
- ⏸️ Expand feature set over time
  - Add competitor pricing data (web scraping)
  - Integrate weather forecasts (API)
  - Add social media sentiment analysis

**Deliverables**:
- Model monitoring dashboard
- Automated retraining pipeline
- Quarterly model performance reports

---

### 17.9. Success Metrics & ROI Tracking

**Revenue Impact**:
- Dynamic pricing: +20-30% RevPAT = **$2.4M-3.6M/year**
- Demand forecasting: +5-10% booking conversion = **$500K-1M/year**
- Table turnover: 9min reduction = **$1.2M/year** (20% utilization)

**Cost Savings**:
- Staff optimization: -10-15% labor = **$50K-75K/year**
- Inventory optimization: -5% waste = **$30K-50K/year**

**Total Year 1 Impact**: **$4.18M - $5.925M**
**Investment**: ~$75K (data warehouse, ML platform, development)
**ROI**: **5,473% - 7,800%** (55x - 79x return)
**Payback Period**: **<3 months**

---

## Long-term Development Enhancements

These features represent future optimization opportunities and advanced capabilities for the platform:

### Service Worker for Offline Media Caching
- Implement Progressive Web App (PWA) capabilities
- Cache media assets for offline viewing
- Enable graceful degradation when network is unavailable
- Reduce bandwidth consumption for returning visitors
- Improve perceived performance with instant media loading

### Progressive Image Loading with Blur-up
- Implement blur-up image loading technique
- Show low-quality placeholder while high-res loads
- Improve perceived performance and reduce layout shift
- Enhance user experience on slower connections
- Integrate with media library for automatic processing

### 3D Floor Plan Visualization (Section 15 Enhancement)
- Build Three.js-based 3D floor plan renderer
- Provide immersive guest preview of venue layout
- Enable virtual walkthrough for premium sections
- Interactive camera controls and lighting effects
- Mobile VR compatibility for high-end experiences

### Real-time Collaboration Features
- WebSocket-based live updates for admin dashboard
- Multi-admin concurrent editing with conflict resolution
- Live reservation status updates without refresh
- Real-time occupancy tracking on floor plans
- Admin presence indicators and activity streams

