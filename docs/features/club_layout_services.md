# Club Layout & Services — Interactive Floor Plan Feature

**Status**: DEFERRED (Pending Business Validation)
**Decision Date**: 2025-10-14
**Target Implementation**: Q1 2026 (After core operations stabilize)

---

## Executive Summary

Visual floor plan management system enabling admin staff to configure club geometry, map reservable sections to existing reservation tiers, and assign services (bottle service, VIP packages) to floor zones. Provides guests with visual section selection during reservation flow and staff with operational layout views.

**Business Value**:
- Increase reservation conversion rates through visual trust-building
- Reduce staff prep time via exact guest location mapping
- Drive service upsells through in-context offering presentation
- Professional presentation matching high-end venue expectations

**Technical Feasibility**: VALIDATED — Architecture review confirms clean integration with existing single-tenant reservation system

**Investment Required**: 40-60 hours (full CAD editor) | 15-20 hours (MVP "Layout Lite")

---

## Current State Analysis

### Strengths (What We Have)
1. **Mature Reservation System**
   - `reservation.tableTiers[]` with `id`, `total`, `reserved` inventory tracking
   - Proven availability calculations in `reservationService.ts:84-118`
   - Working public booking flow at `/reserve`

2. **Strong Admin CMS Foundation**
   - Tab-based configuration workspace (`SiteConfiguration.tsx`)
   - Draft/save/publish workflow with optimistic locking
   - Unsaved changes protection via `useUnsavedChangesPrompt`

3. **Single-Tenant Architecture Benefits**
   - No `club_id` foreign keys or tenant filtering complexity
   - Direct data access patterns established
   - Simplified deployment and credential management

### Gaps (What We Need First)
1. **Section 9**: Admin User Management UI incomplete (role-based access needed for multi-staff operations)
2. **Section 10**: Security hardening not started (JWT refresh, CORS, rate limiting critical)
3. **Section 11**: Stripe payment integration not implemented
4. **Section 12**: Inventory tooling (block tables, adjust minimums) not started
5. **Section 14**: Google Analytics baseline not yet established

---

## Deferral Decision Rationale

### Why Not Now?

#### 1. **Premature Feature Investment**
- Current tier system works without visual layouts
- No customer feedback indicating floor plans are conversion blockers
- No staff feedback confirming operational need
- **Risk**: Building unvalidated feature delays core operations launch

#### 2. **Foundation Priorities**
| Priority | Item | Status | Impact if Skipped |
|----------|------|--------|-------------------|
| P0 | Security Hardening (JWT, CORS) | Not Started | Cannot launch publicly |
| P0 | Stripe Payment Integration | Not Started | No revenue collection |
| P1 | Admin User Management UI | Partial | Single-user bottleneck |
| P1 | Inventory Tooling | Not Started | Manual table management |
| P2 | Floor Plans | Deferred | Reservations work without it |

#### 3. **Validation-First Approach**
- Launch reservations **without** floor plans
- Measure baseline conversion rates for 4-8 weeks
- Gather staff operational feedback
- Analyze competitor offerings
- **Then** decide if investment is justified

---

## Validation Checklist (Before Implementation)

### Business Validation
- [ ] **Reservations Live**: System stable for 4+ weeks without major issues
- [ ] **Volume Baseline**: At least 50 confirmed reservations processed
- [ ] **Analytics Setup**: Google Analytics tracking active, conversion funnel defined
- [ ] **Staff Feedback**: Interviewed 3+ staff members on layout needs
- [ ] **Competitor Analysis**: Reviewed 5+ competitor venues for floor plan adoption
- [ ] **Conversion Hypothesis**: Clear hypothesis that floor plans will improve metrics

### Technical Readiness
- [ ] **Section 10 Complete**: Security hardening (JWT, CORS, rate limiting) deployed
- [ ] **Section 11 Complete**: Stripe integration working, email confirmations sent
- [ ] **Section 12 Complete**: Basic inventory tooling operational
- [ ] **Database Performance**: Reservation queries performing well under load
- [ ] **Admin Access Control**: Role-based permissions fully implemented

### Resource Availability
- [ ] **Engineering Capacity**: 1 full-stack developer available for 2-3 weeks
- [ ] **Design Assets**: Floor plan imagery or CAD files available from venue
- [ ] **Stakeholder Buy-In**: Owner/manager approval for feature investment

---

## Implementation Options (When Validated)

### Option A: "Layout Lite" MVP (15-20 hours) — **RECOMMENDED FIRST**

#### Scope
Minimal viable floor plan without complex CAD editor:
- Admin uploads single floor plan image (PNG/SVG)
- Simple click-to-place markers for section coordinates
- Display static floor plan on `/reserve` with highlighted sections
- Basic zone grouping (VIP area, main floor, bar)

#### Schema Changes
```sql
-- Add single JSONB column to existing site_content table
ALTER TABLE site_content ADD COLUMN floor_plan JSONB DEFAULT '{
  "imageUrl": "",
  "zones": [
    {
      "id": "zone-1",
      "name": "VIP Area",
      "colorHex": "#9333ea"
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "zoneId": "zone-1",
      "reservationTierId": "tier-platinum",
      "label": "Table 1",
      "coordinates": {"x": 120, "y": 200},
      "radius": 30
    }
  ]
}'::jsonb;
```

#### Admin UI
- Add 7th tab "Floor Plan" to existing `SiteConfiguration.tsx`
- Image upload component (reuse `MediaUploadModal.tsx` patterns)
- Click-on-image to place section markers
- Simple form: link marker to existing tier, set label
- No Konva.js — just HTML `<map>` or SVG `<circle>` overlays

#### Guest UI
- Display uploaded floor plan on `/reserve`
- Highlight sections matching selected tier (CSS filters/SVG fills)
- Click section → auto-select that tier
- Mobile: collapsible floor plan view

#### Pros
- Reuses existing admin configuration patterns
- No new database tables or migration complexity
- Quick to build and test business value
- Can upgrade to full CAD later if successful
- Minimal maintenance overhead

#### Cons
- Less flexible than CAD editor
- Manual coordinate entry for staff
- Image updates require reuploading entire floor plan

#### Effort Breakdown
| Task | Hours |
|------|-------|
| Schema migration + seed data | 2 |
| Backend API (get/update floor plan) | 3 |
| Admin tab UI (image upload + marker placement) | 6 |
| Guest UI (static floor plan display) | 3 |
| Testing + bug fixes | 3 |
| **Total** | **15-20** |

---

### Option B: Full CAD Editor (40-60 hours) — **IF MVP PROVES VALUABLE**

#### Scope
Professional-grade floor plan management:
- Interactive drag-and-drop geometry editor (Konva.js)
- Polygon zones, resizable sections, snap-to-grid
- Service assignment matrix (bottle service, hookah, photography)
- Staff role mapping per section (VIP host, server)
- Real-time section availability overlay
- Print/export views for staff (PDF, PNG)

#### Schema Changes
New dedicated tables for complex geometry:
```sql
club_layouts (id, name, default_arrival_route, is_active, created_at, updated_at)
layout_zones (id, layout_id, name, zone_type, polygon_coordinates, display_order, color_hex, ...)
layout_sections (id, zone_id, reservation_tier_id, label, coordinates, capacity_override, ...)
section_services (id, section_id, service_name, service_type, default_price, staff_role, ...)
```

See [full schema details in project_tasks.md:434-483](../../project_tasks.md#L434-L483)

#### Tech Stack
- **Canvas Rendering**: Konva.js or Fabric.js
- **Geometry Utilities**: Turf.js for polygon validation
- **Node Graphing** (optional): React Flow for service paths
- **Backend**: Drizzle ORM + PostgreSQL JSONB for coordinates

#### Effort Breakdown
| Phase | Hours |
|-------|-------|
| Schema + migrations + seed data | 8-12 |
| API routes + validation (CRUD for zones/sections/services) | 8-12 |
| Shared TypeScript types + providers | 4-6 |
| Admin CAD editor UI (Konva integration) | 16-24 |
| Guest/staff integration (visual maps) | 8-12 |
| Testing + QA (unit, integration, E2E) | 6-10 |
| **Total** | **40-60** |

---

## Technical Architecture (Full Implementation)

### Database Schema

#### Core Tables
```sql
-- Global floor plan metadata
club_layouts (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  default_arrival_route JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Zones: stage, dance floor, bar, VIP hallway
layout_zones (
  id UUID PRIMARY KEY,
  layout_id UUID REFERENCES club_layouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  zone_type TEXT,  -- 'stage' | 'dance_floor' | 'bar' | 'vip' | 'entrance'
  polygon_coordinates JSONB,  -- [[x,y], [x,y], ...]
  display_order INT,
  color_hex TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Sections: reservable tables/booths
layout_sections (
  id UUID PRIMARY KEY,
  zone_id UUID REFERENCES layout_zones(id) ON DELETE CASCADE,
  reservation_tier_id TEXT,  -- Links to siteContent.reservation.tableTiers[].id
  label TEXT NOT NULL,
  coordinates JSONB,  -- {x, y, width, height}
  capacity_override INT,
  minimum_spend_override NUMERIC(10,2),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Services: bottle, hookah, photography
section_services (
  id UUID PRIMARY KEY,
  section_id UUID REFERENCES layout_sections(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_type TEXT,  -- 'beverage' | 'amenity' | 'photo' | 'vip_entrance'
  default_price NUMERIC(10,2),
  staff_role TEXT,  -- 'vip_host' | 'server' | 'photographer'
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP
)
```

**Indexes**:
```sql
CREATE INDEX idx_layout_zones_layout_id ON layout_zones(layout_id);
CREATE INDEX idx_layout_sections_zone_id ON layout_sections(zone_id);
CREATE INDEX idx_layout_sections_tier_id ON layout_sections(reservation_tier_id);
CREATE INDEX idx_section_services_section_id ON section_services(section_id);
```

### API Routes

#### Public Routes
- `GET /api/v1/layout` — Fetch active floor plan for guest reservation flow
- `GET /api/v1/layout/sections/:tierId` — Get sections for a reservation tier

#### Admin Routes (Require Authentication)
- `GET /api/v1/admin/layout` — Full layout with zones, sections, services
- `POST /api/v1/admin/layout` — Create new layout
- `PATCH /api/v1/admin/layout/:id` — Update layout metadata
- `POST /api/v1/admin/layout/:layoutId/zones` — Add zone
- `PATCH /api/v1/admin/layout/zones/:id` — Update zone geometry
- `DELETE /api/v1/admin/layout/zones/:id` — Remove zone
- `POST /api/v1/admin/layout/zones/:zoneId/sections` — Add section
- `PATCH /api/v1/admin/layout/sections/:id` — Update section
- `DELETE /api/v1/admin/layout/sections/:id` — Remove section
- `POST /api/v1/admin/layout/sections/:sectionId/services` — Assign service
- `DELETE /api/v1/admin/layout/services/:id` — Remove service

### Integration Points

#### Reservation Service Enhancement
Enrich reservation responses with layout metadata:
```typescript
async getReservationWithLayout(reservationId: string) {
  const reservation = await getReservation(reservationId);

  // Join sections linked to this reservation's tier
  const sections = await db.select()
    .from(layoutSectionsTable)
    .where(eq(layoutSectionsTable.reservationTierId, reservation.tierId));

  // Join services for operational prep
  const services = await db.select()
    .from(sectionServicesTable)
    .where(inArray(sectionServicesTable.sectionId, sections.map(s => s.id)));

  return { ...reservation, sections, services };
}
```

#### Site Configuration Extension
Add floor plan tab to existing admin workspace:
```tsx
// SiteConfiguration.tsx
const tabs = [
  { id: 'hero', label: 'Landing Hero' },
  { id: 'about', label: 'About Modal' },
  { id: 'tickets', label: 'Tickets Overlay' },
  { id: 'reservations', label: 'Reservations' },
  { id: 'contact', label: 'Contact Modal' },
  { id: 'footer', label: 'Footer & Social' },
  { id: 'legal', label: 'Legal Footer' },
  { id: 'layout', label: 'Floor Plan' }  // NEW
];
```

---

## Risk Assessment & Mitigation

### Technical Risks

#### 1. Geometry Complexity
**Risk**: Polygon validation, collision detection, coordinate transforms can introduce bugs
**Severity**: Medium
**Mitigation**:
- Use battle-tested libraries (Turf.js for geometry, Konva.js for rendering)
- Start with simple rectangles before adding polygon support
- Implement comprehensive unit tests for coordinate math
- Add visual regression tests for canvas rendering

#### 2. Mobile UX for Drag-and-Drop
**Risk**: Touch gestures for section manipulation are finicky on mobile
**Severity**: Low
**Mitigation**:
- Admin editor is **desktop-first** (staff use laptops)
- Guest views get **static SVG** (no drag-and-drop needed)
- Add touch-friendly zoom/pan controls
- Test on tablets (iPad, Android) before phones

#### 3. Canvas Performance with 50+ Sections
**Risk**: Large floor plans may cause rendering lag
**Severity**: Medium
**Mitigation**:
- Konva.js handles large scene graphs well
- Implement layer virtualization (only render visible zones)
- Add zoom levels (hide detail when zoomed out)
- Performance test with synthetic 100-section layout

#### 4. Schema Coupling to JSONB Tier IDs
**Risk**: `layout_sections.reservation_tier_id` links to `siteContent.reservation.tableTiers[].id` (string in JSONB, not foreign key)
**Severity**: High
**Mitigation**:
- Add application-level referential integrity checks before tier deletion
- Implement soft-delete for tiers (mark inactive instead of removing)
- Create database trigger to validate tier ID exists before section insert
- Show orphaned sections in admin UI with repair workflow

#### 5. Data Migration After Reservations Exist
**Risk**: Changing floor plan structure after confirmed reservations creates consistency issues
**Severity**: Medium
**Mitigation**:
- Reservations store `tierId` (stable), not section coordinates
- Layout changes don't invalidate existing reservations
- Maintain layout version history for audit trail
- Implement "archive layout" instead of delete

---

## Success Metrics (Post-Implementation)

### Business KPIs
| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| **Reservation Conversion Rate** | TBD after launch | +10-15% | GA4 funnel: `/reserve` → payment → confirmation |
| **Service Upsell Rate** | TBD | +20% | % of reservations with added services (bottle, hookah) |
| **Staff Prep Time** | TBD | -30% | Time from reservation to guest seating (manual tracking) |
| **Guest Satisfaction** | TBD | +15% | Post-event survey: "Visual floor plan helped me choose" |

### Technical KPIs
| Metric | Target | Tool |
|--------|--------|------|
| Layout editor load time | < 2 seconds | Browser DevTools |
| Canvas interactions (drag/resize) | 60 fps | Chrome Performance profiler |
| Floor plan rendering on `/reserve` | < 500ms | Lighthouse |
| API response time (`GET /layout`) | < 100ms | Application logs |
| Zero reservation flow regressions | 100% pass | E2E test suite |

---

## Future Enhancements (Post-MVP)

### Phase 3: Real-Time Features (Optional)
- **Live Occupancy**: WebSocket updates showing section status (occupied, empty, reserved)
- **Staff Wayfinding**: GPS-like directions from entrance to guest section
- **Guest Notifications**: "Your table is ready" push notifications

### Phase 4: Advanced Analytics (Optional)
- **Heatmaps**: Most popular sections over time
- **Dynamic Pricing**: Surge pricing for high-demand sections
- **Guest Preferences**: Remember favorite sections per guest profile
- **A/B Testing**: Test different floor plan layouts for conversion optimization

### Phase 5: 3D Visualization (Optional)
- **Three.js Integration**: 3D immersive floor plan for guest preview
- **VR Walkthrough**: Virtual tour of venue before reservation
- **AR Wayfinding**: Mobile AR overlay for guest navigation

---

## Dependencies & Prerequisites

### Must Complete Before Starting
1. Section 5: Site Configuration workspace (existing tab structure)
2. Section 10: Security hardening (JWT, CORS, rate limiting)
3. Section 11: Complete reservation backend (Stripe, confirmations)
4. Section 12: Basic inventory tooling operational

### Parallel Development Allowed
- **Section 13**: Advanced analytics (floor plan can feed into warehouse later)
- **Section 14**: Google Analytics (tracking setup independent)

### External Dependencies
- **Design Assets**: Floor plan imagery or CAD files from venue management
- **Stakeholder Time**: 2-3 hours for requirement gathering and UX feedback sessions
- **Infrastructure**: No additional infrastructure needed (PostgreSQL JSONB sufficient)

---

## Decision Log

### 2025-10-14: Initial Assessment & Deferral
**Decision**: Defer implementation until core operations validated
**Rationale**:
- Feature is technically feasible and well-designed
- Business value unvalidated (no customer/staff feedback)
- Foundation gaps (security, payments) are higher priority
- Phased approach available (MVP "Layout Lite" option)

**Next Review**: 2025-12-01 (after 6-8 weeks of live reservations)

**Validation Data Needed**:
- [ ] Baseline conversion rate from GA4
- [ ] At least 50 confirmed reservations processed
- [ ] Staff interviews (3+ team members)
- [ ] Competitor analysis complete

---

## References

### Internal Documentation
- [project_tasks.md](../../project_tasks.md) — Full roadmap and sequencing
- [architecture_roadmap.md](../../architecture_roadmap.md) — System design principles
- [reservation_workflow.md](../reservation_workflow.md) — Current booking flow

### External Resources
- [Konva.js Documentation](https://konvajs.org/docs/) — Canvas rendering library
- [Turf.js](https://turfjs.org/) — Geospatial geometry operations
- [React Flow](https://reactflow.dev/) — Node-based graphing library
- [Fabric.js](http://fabricjs.com/) — Alternative canvas library

### Competitive Analysis (To Be Completed)
- [ ] Tao Group nightclub websites
- [ ] Hakkasan Group digital reservation systems
- [ ] OpenTable visual table selection
- [ ] Resy floor plan features
- [ ] Competitor A, B, C (fill in after research)

---

## Appendix: Example Floor Plan Data Structure

### Layout Lite (JSONB in site_content)
```json
{
  "imageUrl": "https://cdn.example.com/floor-plan.png",
  "zones": [
    {
      "id": "zone-vip",
      "name": "VIP Lounge",
      "colorHex": "#9333ea"
    },
    {
      "id": "zone-main",
      "name": "Main Floor",
      "colorHex": "#3b82f6"
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "zoneId": "zone-vip",
      "reservationTierId": "tier-platinum",
      "label": "Table 1",
      "coordinates": { "x": 120, "y": 200 },
      "radius": 30
    },
    {
      "id": "section-2",
      "zoneId": "zone-vip",
      "reservationTierId": "tier-platinum",
      "label": "Booth A",
      "coordinates": { "x": 250, "y": 180 },
      "radius": 40
    },
    {
      "id": "section-3",
      "zoneId": "zone-main",
      "reservationTierId": "tier-gold",
      "label": "Table 5",
      "coordinates": { "x": 400, "y": 350 },
      "radius": 25
    }
  ]
}
```

### Full Implementation (Normalized Tables)
```sql
-- Layout: Main Floor
INSERT INTO club_layouts (id, name, is_active)
VALUES ('layout-1', 'Main Floor', true);

-- Zone: VIP Lounge
INSERT INTO layout_zones (id, layout_id, name, zone_type, polygon_coordinates, color_hex)
VALUES (
  'zone-vip',
  'layout-1',
  'VIP Lounge',
  'vip',
  '[[100, 150], [300, 150], [300, 350], [100, 350]]'::jsonb,
  '#9333ea'
);

-- Section: Table 1 (linked to tier-platinum)
INSERT INTO layout_sections (id, zone_id, reservation_tier_id, label, coordinates, capacity_override)
VALUES (
  'section-1',
  'zone-vip',
  'tier-platinum',
  'Table 1',
  '{"x": 120, "y": 200, "width": 60, "height": 60}'::jsonb,
  8
);

-- Service: Premium Bottle Service
INSERT INTO section_services (id, section_id, service_name, service_type, default_price, is_default)
VALUES (
  'service-1',
  'section-1',
  'Premium Bottle Service',
  'beverage',
  350.00,
  true
);
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-14
**Owner**: Engineering Team
**Status**: Living Document (Update after validation reviews)
