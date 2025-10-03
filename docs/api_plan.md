# API Plan

This document outlines the service layer for the OjaPlus business platform. It assumes a PostgreSQL
back-end exposed through a RESTful API with JWT authentication.

## Authentication & Session

| Method | Route | Purpose |
| ------ | ----- | ------- |
| POST | `/api/admin/session` | Issue session tokens (password, OTP, or SSO). Returns JWT + refresh token. |
| DELETE | `/api/admin/session` | Revoke the active session and invalidate refresh tokens. |
| POST | `/api/admin/session/refresh` | Rotate access token using a valid refresh token. |

All admin routes require the `Authorization: Bearer <token>` header. Tokens carry role claims:
`owner`, `content`, `finance`, `guest` (read-only).

## Configuration Content

| Method | Route | Description |
| ------ | ----- | ----------- |
| GET | `/api/site-content` | Public payload consumed by the customer-facing app. Supports `If-None-Match` caching. |
| GET | `/api/site-content/diff` | Returns draft vs. published diff for preview tooling (admin only). |
| PUT | `/api/admin/site-content` | Upsert configuration (accepts full `RawSiteContent`). Creates revision entry. |
| PATCH | `/api/admin/site-content/:section` | Partial update for a specific section (`hero`, `event`, `panels.contact`, etc.). |
| POST | `/api/admin/site-content/publish` | Promote the latest draft to production, stamping actor + timestamp. |

## Events & Programming

| Method | Route | Description |
| ------ | ----- | ----------- |
| GET | `/api/events` | List upcoming events with filters (`after`, `requires_ticket`). |
| GET | `/api/events/:id` | Event detail (headliners, links, status). Supports `include=media` to embed flyer info. |
| POST | `/api/admin/events` | Create new event, assign hero background set, link to ticketing SKU. |
| PATCH | `/api/admin/events/:id` | Update metadata, toggle ticketing requirement, manage headliners. |
| POST | `/api/admin/events/:id/publish` | Locks schedule + triggers marketing notifications. |

## Media Library

| Method | Route | Description |
| ------ | ----- | ----------- |
| GET | `/api/media` | Paginated search of hero/background assets with focal metadata. |
| POST | `/api/media` | Upload asset (presigned URL workflow). Stores metadata in `media_assets`. |
| PATCH | `/api/media/:id` | Update focal point, captions, accessibility notes. |

## Partner Enquiries

| Method | Route | Description |
| ------ | ----- | ----------- |
| POST | `/api/enquiries` | Public endpoint used by the contact modal. Validates captcha + rate limits per IP. |
| GET | `/api/admin/partner-leads` | Admin listing with filters (`status`, `event_id`, `enquiry_type`). |
| PATCH | `/api/admin/partner-leads/:id` | Update status (`new`, `in_review`, `booked`, `archived`) and add internal notes. |

## Background Loop Telemetry

| Method | Route | Description |
| ------ | ----- | ----------- |
| POST | `/api/telemetry/hero-loop` | Client-side metrics: transition durations, dropped frames, media load timing. |
| GET | `/api/admin/telemetry/hero-loop` | Aggregated stats for dashboard charts (rolling 7-day window). |

## Security & Observability Requirements

* Enforce rate limits on public POST endpoints (`/api/enquiries`, `/api/site-content` preview) to
  mitigate abuse.
* Log every admin mutation with `actor_id`, request payload, and originating IP for compliance.
* Emit structured logs + metrics (Prometheus/OpenTelemetry) for response times, cache hits, and error
  rates.

