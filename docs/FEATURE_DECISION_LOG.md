# Feature Decision Log

This document tracks major feature decisions, including approvals, deferrals, and rejections. It provides a historical record of why features were or were not implemented at specific points in the project lifecycle.

---

## Decision Template

```markdown
### Feature Name
**Decision**: APPROVED | DEFERRED | REJECTED
**Date**: YYYY-MM-DD
**Effort Estimate**: X-Y hours
**Rationale**: Why this decision was made
**Next Review**: YYYY-MM-DD (if deferred)
**Status**: Current implementation status
```

---

## Active Decisions

### Club Layout & Services (Interactive Floor Plan)
**Decision**: DEFERRED
**Date**: 2025-10-14
**Effort Estimate**: 15-20 hours (MVP "Layout Lite") | 40-60 hours (Full CAD Editor)

**Rationale**:
This feature is technically feasible and well-architected, but deferred for business and priority reasons:

1. **Foundation Priorities**: Core security (JWT, CORS, rate limiting), payment integration (Stripe), and inventory tooling must be completed before enhancement features
2. **Business Validation Needed**: No evidence yet that visual floor plans will improve conversion rates or operational efficiency
3. **Existing System Adequate**: Current tier-based reservation system works without visual layouts
4. **Phased Approach Available**: Can start with simple image upload MVP before investing in full CAD editor

**Validation Criteria Before Implementation**:
- [ ] Reservations live and stable for 4+ weeks
- [ ] 50+ confirmed bookings processed successfully
- [ ] Google Analytics conversion baseline established
- [ ] Staff feedback collected (3+ interviews)
- [ ] Competitor analysis completed (5+ venues)

**Next Review**: 2025-12-01 (after 6-8 weeks of live operations)

**Current Status**: Specification documented in `docs/features/club_layout_services.md`, implementation paused

**Technical Notes**:
- Architecture review confirmed clean integration with existing single-tenant reservation system
- `tierId` linking pattern validated against current `reservationService.ts` implementation
- Admin UI patterns (tab workspace, draft/save/publish) already established in `SiteConfiguration.tsx`
- Risk assessment identifies schema coupling to JSONB tier IDs as primary technical concern

**Business Impact (Projected)**:
- Potential +10-15% reservation conversion rate
- Potential +20% service upsell rate (bottle service, hookah)
- Potential -30% staff prep time reduction

**Dependencies**:
- **Blockers**: Section 10 (Security), Section 11 (Payments), Section 12 (Inventory)
- **Prerequisites**: Section 9 (Admin User Management UI)

---

## Historical Decisions

### Admin User Management & RBAC
**Decision**: APPROVED (In Progress)
**Date**: 2024-10 (from project_tasks.md)
**Effort Estimate**: 40-60 hours
**Rationale**: Multi-staff operations require role-based access control (Owner, Manager, Staff)
**Status**: Schema complete, UI implementation pending

### Google Analytics Integration
**Decision**: APPROVED (Complete)
**Date**: 2024-10 (from project_tasks.md)
**Effort Estimate**: 4-8 hours
**Rationale**: Customer behavior data essential for forecasting and optimization
**Status**: IMPLEMENTED — Tracking active on landing and reservation pages

### Site Configuration Workspace
**Decision**: APPROVED (Complete)
**Date**: 2024-09 (from project_tasks.md)
**Effort Estimate**: 80-120 hours
**Rationale**: Core content management for customer-facing site
**Status**: IMPLEMENTED — All tabs functional (Hero, About, Tickets, Reservations, Contact, Footer, Legal)

---

## Deferred Features (Watchlist)

### Real-Time Reservation Updates (WebSockets)
**Status**: FUTURE CONSIDERATION
**Rationale**: Current REST API adequate for v1, real-time updates nice-to-have for high-traffic events
**Effort**: 20-30 hours
**Review Trigger**: When processing 100+ simultaneous reservations

### 3D Floor Plan Visualization (Three.js)
**Status**: FUTURE CONSIDERATION
**Rationale**: Requires 2D floor plan foundation first, significant complexity premium over static images
**Effort**: 60-80 hours
**Review Trigger**: If 2D floor plans prove high-value and 3D becomes industry standard

### Dynamic Pricing Engine
**Status**: FUTURE CONSIDERATION
**Rationale**: Requires historical demand data and surge pricing algorithms
**Effort**: 80-120 hours
**Review Trigger**: After 6+ months of operations with sufficient data for ML models

### Mobile Staff App (Native iOS/Android)
**Status**: FUTURE CONSIDERATION
**Rationale**: Progressive Web App (PWA) sufficient for v1, native app requires dedicated mobile engineering
**Effort**: 200-300 hours
**Review Trigger**: If staff report PWA limitations in production

---

## Rejected Features

_No features formally rejected to date. Candidates for rejection will be documented here with rationale._

---

## Decision-Making Framework

### Evaluation Criteria

When evaluating new features, assess against:

1. **Business Value**
   - Does it solve a validated customer or operational pain point?
   - What is the projected ROI (revenue increase, cost reduction, time savings)?
   - Is it a competitive differentiator or table stakes?

2. **Technical Feasibility**
   - Does it align with current architecture patterns?
   - What is the complexity risk (schema changes, external dependencies)?
   - Can it be implemented in phases?

3. **Resource Availability**
   - Do we have engineering capacity?
   - Are required design assets or stakeholder time available?
   - What is the opportunity cost (what else won't get built)?

4. **Dependencies & Timing**
   - What must be completed first?
   - Does this block or enable other features?
   - Is there a time-sensitive business trigger?

5. **Maintenance Burden**
   - What is the ongoing support cost?
   - Does it introduce new failure modes?
   - Can it be deprecated cleanly if it fails?

### Approval Thresholds

| Feature Scope | Decision Authority | Documentation Required |
|---------------|-------------------|------------------------|
| < 10 hours | Tech Lead | GitHub Issue |
| 10-40 hours | Product Owner + Tech Lead | Feature Spec (lite) |
| 40-80 hours | Stakeholder Approval | Full Feature Spec + ROI Analysis |
| > 80 hours | Executive Approval | Business Case + Risk Assessment |

### Deferral vs Rejection

**Defer** when:
- Feature is valuable but prerequisites not met
- Business case unvalidated (needs data)
- Resources unavailable but timeline flexible

**Reject** when:
- Feature conflicts with strategic direction
- Cost/complexity outweighs projected benefit
- Alternative solution better addresses need
- Technical constraints make it infeasible

---

## Review Cadence

This log is reviewed:
- **Monthly**: During sprint planning to revisit deferred features
- **Quarterly**: Comprehensive review of all decisions with stakeholders
- **Milestone-Triggered**: After major launches (e.g., public reservations go-live)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-14 | Created decision log, documented Club Layout deferral | Engineering Team |

---

**Document Owner**: Product & Engineering Leadership
**Last Updated**: 2025-10-14
**Next Review**: 2025-11-14
