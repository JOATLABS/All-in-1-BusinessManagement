# Task Complexity Backlog (Single-Tenant)

This backlog is organized by implementation complexity to support incremental delivery for the **single-tenant nightlife management platform**. Each item lists prerequisites and critical integration touchpoints so the team can coordinate follow-up implementation work.

**Single-Tenant Architecture Benefits:**
- All tasks operate on a single venue's data—no tenant_id filtering or multi-tenant isolation logic
- API integrations simplified with single credential sets (one Stripe account, one Twilio account, etc.)
- Database queries and admin workflows streamlined without organization-level scoping

## Low Complexity

### Stripe Payment Link Templates
- **Outcome:** Provide an admin-managed catalog of Stripe-hosted payment links for deposits, table packages, and upsells without requiring custom checkout flows.
- **Dependencies:** Admin dashboard payment settings finalized; product catalog data model available.
- **Integration Touchpoints:** Stripe Payment Links API for link creation and status updates.
- **Single-Tenant Implementation:** Single Stripe account configuration; all payment links belong to one venue without organization prefixes.

## Medium Complexity

### Apple/Google Pay Checkouts for Reservations and DJ Shout-Outs
- **Outcome:** Enable fast checkout experiences on the reservation and DJ shout-out booking flows using Apple Pay and Google Pay via Stripe.
- **Dependencies:** Stripe account with Payment Request Button enabled; reservation and shout-out pricing exposed through the single admin configuration.
- **Integration Touchpoints:** Stripe Elements/Payment Request Button, Apple Pay domain verification, Google Pay merchant ID management.
- **Single-Tenant Implementation:** Single domain verification for Apple Pay; one Google Pay merchant ID; simplified Stripe metadata without organization identifiers.

### Notification Dashboard (Email/SMS)
- **Outcome:** Provide the admin with a consolidated view of outbound email and SMS notifications with delivery status and resend controls.
- **Dependencies:** Messaging provider credentials stored in admin settings; event and booking data accessible for templating.
- **Integration Touchpoints:** Messaging platform APIs (e.g., Twilio SendGrid, Twilio SMS), centralized notification logging datastore.
- **Single-Tenant Implementation:** Single SendGrid API key and Twilio account; notification queries without tenant filtering: `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50`.

### QR Ticketing for Free/Paid Events
- **Outcome:** Generate QR codes tied to reservation or ticket records and display check-in status for both complimentary and paid events.
- **Dependencies:** Event roster and guest list schema complete; storage bucket or CDN path available for QR image assets.
- **Integration Touchpoints:** QR code generation library, document storage for QR assets, Stripe payment confirmations for paid entries.
- **Single-Tenant Implementation:** Single S3/CDN bucket for QR images; validation query: `SELECT * FROM tickets WHERE qr_code = ? AND event_id = ?` (no club_id filter).

## High Complexity

### Contract and Agreement Generation with Reminder Tracking
- **Outcome:** Allow the admin to generate contract PDFs from templates, send them to clients, and schedule automated reminders for unsigned agreements.
- **Dependencies:** Document template library defined; customer CRM records connected to agreements; reminder schedule configuration in admin settings.
- **Integration Touchpoints:** Document storage (e.g., AWS S3), PDF generation service, messaging provider for reminder delivery.
- **Single-Tenant Implementation:** Single S3 bucket without tenant prefixes; contracts table: `contracts(id UUID, client_name TEXT, status TEXT, created_at TIMESTAMP)` (no club_id); reminder scheduling without organization context.

### External Signature Workflow Page
- **Outcome:** Deliver a secure, branded signing experience for clients and vendors to review agreements, upload attachments, and submit signatures without needing an admin login.
- **Dependencies:** Contract generation service operational; access token or magic link pattern finalized; document versioning policy established.
- **Integration Touchpoints:** Document storage for signed artifacts, audit logging system, messaging provider for signature confirmations.
- **Single-Tenant Implementation:** Magic link generation without tenant scoping; signature validation: `SELECT * FROM contracts WHERE token = ? AND expires_at > NOW()` (no tenant filter); single email sender identity.

### Reminder Analytics and Escalation Automation
- **Outcome:** Track reminder engagement, escalate overdue signatures to the admin, and surface actionable insights within the dashboard.
- **Dependencies:** Reminder tracking events emitted from the contract workflow; notification dashboard metrics ingestion pipeline active.
- **Integration Touchpoints:** Messaging analytics endpoints, admin dashboard alerting modules.
- **Single-Tenant Implementation:** Analytics queries without tenant grouping: `SELECT status, COUNT(*) FROM contracts WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY status`; single admin notification channel (no multi-org routing).
