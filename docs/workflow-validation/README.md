# Workflow Validation Plan

This plan operationalises Section 8 of the project roadmap. It combines manual workflow walkthroughs, automated guardrails, and performance validation so release candidates are always verified end-to-end.

## Research Notes

The plan follows industry testing best practices emphasising:

- **Task-based charters** so each walkthrough has a clear goal, prerequisites, and exit criteria.
- **Traceable evidence** (screenshots, notes, API payloads) captured in a shared log after every run.
- **Arrange → Act → Assert** structure for reproducibility and to make issues easy to triage.
- **Shift-left automation** that turns recurring checks (linting, builds, smoke E2E flows) into scripts, reducing manual effort over time.
- **Regression tracking** through a single source of truth log so previously-found defects are retested before sign-off.

## Manual Workflow Testing (Section 8.1)

Each charter below includes prerequisites, the walkthrough, and expected outcomes. Results should be recorded in the [validation log](./validation-log-template.md).

### Charter A — Hero Copy Update to Customer Site
- **Prerequisites**: Owner-role admin account, staging environment with API + frontend, baseline hero copy recorded.
- **Arrange**: Log in to `/admin/login`, navigate to Site Configuration → Landing Hero tab, note existing values.
- **Act**:
  1. Update hero name, marquee words, and CTA copy.
  2. Save changes and confirm success toast.
  3. Publish or trigger configuration refresh (if required by backend).
  4. Visit public landing page and hard refresh.
- **Assert**:
  - Admin UI reflects saved state without unsaved-change prompts.
  - Public site renders updated copy, carousel loops through new words, CTA buttons show revised labels.
  - No console errors in either admin or public tabs.

### Charter B — Full Site Configuration Regression
- **Prerequisites**: Same as Charter A plus fixture content to reset state if needed.
- **Arrange**: Authenticated as owner or manager, open each tab of Site Configuration.
- **Act**:
  1. Edit About, Tickets, Reservations, Contact, Footer, and Legal sections.
  2. Trigger validation (e.g., required fields) to confirm inline messaging.
  3. Save changes once per tab or via global save, depending on UX.
  4. Refresh page to confirm persisted state.
- **Assert**:
  - Validation messages appear when expected and clear after correction.
  - Reopening Site Configuration shows persisted values.
  - Associated public overlays reflect updated copy or toggles.

### Charter C — Background Media Upload & Management
- **Prerequisites**: Access to representative image/video assets ≤ upload limits, confirmed storage backend availability.
- **Arrange**: Owner or manager logged in, open Site Configuration → Backgrounds panel.
- **Act**:
  1. Upload new media via drag-and-drop.
  2. Add media from library and via URL fallback.
  3. Adjust focal point sliders, alt text, and activation toggle.
  4. Reorder items via drag and drop.
- **Assert**:
  - Upload progress and error states behave as specified.
  - Media order updates persist after refresh.
  - Accessibility metadata (alt text, reduced motion) propagates to public experience.

### Charter D — Admin User Management Lifecycle
- **Prerequisites**: Owner-role account, email inbox for invites (if applicable), baseline list of admins.
- **Arrange**: Log in and navigate to Team Management.
- **Act**:
  1. Create Manager and Staff accounts with valid passwords.
  2. Attempt to create duplicate emails to validate error handling.
  3. Edit Manager role to Staff, then reactivate/deactivate users.
  4. Log in as newly created Staff to confirm restricted navigation.
- **Assert**:
  - Role badges update immediately and survive reload.
  - Permission-guarded routes (Team Management) stay hidden for non-owners.
  - Audit log entry or equivalent backend trail is produced.

## Automated Checks (Section 8.2)

| Layer | Command | Frequency | Notes |
|-------|---------|-----------|-------|
| Static analysis | `npm run lint` | Per commit / CI | Runs backend + frontend ESLint suites. |
| Build verification | `npm run build` | Per commit / CI | Ensures TypeScript types + bundling succeed. |
| Critical workflows | `npx playwright test e2e/workflow-validation.spec.ts` | Nightly / release candidate | Covers login → site update → publish smoke flow (test file to be implemented). |
| Admin role enforcement | `npx playwright test e2e/admin-access.spec.ts` | Nightly / release candidate | Confirms role guard rails. |

> ℹ️  The Playwright suites should stub backend responses until the API gateway is stable. When backend endpoints are reliable, swap stubs for seeded fixtures so the flows exercise the full stack.

## Performance Validation (Section 8.3)

1. **Lighthouse CI** — Run against public landing page (desktop + mobile). Target Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95.
2. **WebPageTest (optional)** — Confirm hero background loop loads within target LCP (< 2.5s) under Fast 3G.
3. **Motion Preference Audit** — Validate `prefers-reduced-motion` disables heavy animations.
4. **Media Virtualisation Stress Test** — Seed ≥ 1,000 background items and scroll through library verifying frame rate ≥ 55fps.

Capture metrics in the validation log with timestamp, environment, commit hash, and screenshots or exported JSON reports.

## Exit Criteria

- All charters executed within the last 7 days for the release candidate.
- Automated checks green on default branch and release tag.
- Performance metrics meet thresholds or have signed waivers with mitigation plans.
- Outstanding defects triaged with owners and due dates before launch.
