# Admin Dashboard & Configuration API

This guide explains how the admin console is wired to the backend so developers can configure the public website and manage VIP reservations with the production-ready endpoints that already exist in the project.

## 1. Running the Admin Experience

1. **Seed the database** – The seed script provisions default site content, reservation tiers, and an administrator account. The credentials can be supplied via environment variables or read from the seed JSON fixtures.
   ```bash
   npm --prefix backend run db:seed
   ```
2. **Start the backend** – Exposes authenticated configuration routes and the reservation service.
   ```bash
   npm --prefix backend run dev
   ```
3. **Start the frontend** – Boots Vite with the admin pages under `/admin` and the public site under `/`.
   ```bash
   VITE_API_BASE_URL=http://127.0.0.1:3001 npm --prefix frontend run dev -- --host 0.0.0.0 --port 4173
   ```
4. **Sign in** – Visit `http://127.0.0.1:4173/admin/login` and authenticate with the seeded credentials. After login you are redirected to the admin dashboard and can open the **Site Configuration** panel to edit live copy, reservation tiers, and modal messaging.

## 2. Configuration API Surface

The backend already exposes the endpoints the admin UI relies on. They are mounted under the `/api/v1` router inside `backend/src/app.ts`.

| Method | Path | Description | Auth |
| ------ | ---- | ----------- | ---- |
| `POST` | `/api/v1/auth/login` | Exchanges admin credentials for a session token used by the frontend. | No |
| `POST` | `/api/v1/auth/logout` | Revokes the active admin session token. | Bearer token |
| `GET` | `/api/v1/site-content` | Returns the full site content payload (hero, overlays, reservation copy, etc.). | No |
| `PUT` | `/api/v1/site-content` | Persists site configuration updates made in the admin dashboard. | Bearer token |
| `GET` | `/api/v1/reservations/availability` | Aggregates live VIP tier availability for the reserve page. | No |
| `POST` | `/api/v1/reservations` | Creates a paid reservation, decrements availability, and returns a confirmation code payload. | No |
| `GET` | `/api/v1/admin/reservations` | Lists recent reservations with tier metadata for the admin console. | Bearer token |
| `PATCH` | `/api/v1/admin/reservations/:id` | Updates a reservation status (e.g., cancel or reinstate) and immediately frees or restores availability. | Bearer token |

All configuration saves are validated against the shared Zod schema in `backend/src/validation/siteContent.ts`, keeping the admin UI, backend, and public bundle in sync.

## 3. Admin Dashboard Structure

The React admin experience already ships with these entry points:

- `/admin` renders `AdminDashboard.tsx`, a high-level operations overview that reads from `useSiteContentContext`.
- `/admin/reservations` renders `Reservations.tsx`, a management table that lists confirmed/pending/cancelled sections, exposes automation-ready selectors, and lets operators release or reinstate bookings.
- `/admin/site-configuration` renders `SiteConfiguration.tsx`, a multi-tab form for editing hero copy, overlays, reservation tiers, carousel labels, modal copy, and automation-friendly attributes.
- `/admin/login` renders `AdminLogin.tsx`, which exchanges credentials for a token via `auth/login` and stores it in the `AuthContext` provider.

`frontend/src/App.tsx` wires these pages behind a `ProtectedRoute` that enforces authentication before exposing the dashboard and configuration routes.

## 4. Saving Configuration Changes

`SiteConfiguration.tsx` keeps local draft state for each tab and calls `updateSiteContent` when the form is submitted. The helper in `frontend/src/services/contentService.ts` issues an authenticated `PUT /api/v1/site-content` request with the normalized payload.

After a successful save the shared `SiteContentProvider` automatically refreshes content so both the public site and the admin UI reflect the latest configuration without a full reload.

## 5. Next Steps for Developers

- Extend the admin dashboard with analytics cards or reservation management tables by building on the authenticated routing that already exists.
- Swap the placeholder payment form in the reservation modal for your payment processor of choice (e.g., Stripe) and wire its webhook to `reservationService` so availability stays authoritative.
- Integrate end-to-end tests using the `data-testid` attributes exposed across the admin and reserve flows to automate regression coverage.

These pieces ensure you can focus on the “important” features—advanced dashboards, reservation insights, and deeper automation—without having to retrofit core configuration plumbing.
