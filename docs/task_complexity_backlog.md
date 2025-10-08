# Task Complexity Backlog

This backlog is organized by implementation complexity to support incremental delivery for the single-admin nightlife management platform. Each item lists prerequisites and critical integration touchpoints so the team can coordinate follow-up implementation work.

## Low Complexity

### Stripe Payment Link Templates
- **Outcome:** Provide an admin-managed catalog of Stripe-hosted payment links for deposits, table packages, and upsells without requiring custom checkout flows.
- **Dependencies:** Admin dashboard payment settings finalized; product catalog data model available.
- **Integration Touchpoints:** Stripe Payment Links API for link creation and status updates.

## Medium Complexity

### Apple/Google Pay Checkouts for Reservations and DJ Shout-Outs
- **Outcome:** Enable fast checkout experiences on the reservation and DJ shout-out booking flows using Apple Pay and Google Pay via Stripe.
- **Dependencies:** Stripe account with Payment Request Button enabled; reservation and shout-out pricing exposed through the single admin configuration.
- **Integration Touchpoints:** Stripe Elements/Payment Request Button, Apple Pay domain verification, Google Pay merchant ID management.

### Notification Dashboard (Email/SMS)
- **Outcome:** Provide the admin with a consolidated view of outbound email and SMS notifications with delivery status and resend controls.
- **Dependencies:** Messaging provider credentials stored in admin settings; event and booking data accessible for templating.
- **Integration Touchpoints:** Messaging platform APIs (e.g., Twilio SendGrid, Twilio SMS), centralized notification logging datastore.

### QR Ticketing for Free/Paid Events
- **Outcome:** Generate QR codes tied to reservation or ticket records and display check-in status for both complimentary and paid events.
- **Dependencies:** Event roster and guest list schema complete; storage bucket or CDN path available for QR image assets.
- **Integration Touchpoints:** QR code generation library, document storage for QR assets, Stripe payment confirmations for paid entries.

## High Complexity

### Contract and Agreement Generation with Reminder Tracking
- **Outcome:** Allow the admin to generate contract PDFs from templates, send them to clients, and schedule automated reminders for unsigned agreements.
- **Dependencies:** Document template library defined; customer CRM records connected to agreements; reminder schedule configuration in admin settings.
- **Integration Touchpoints:** Document storage (e.g., AWS S3), PDF generation service, messaging provider for reminder delivery.

### External Signature Workflow Page
- **Outcome:** Deliver a secure, branded signing experience for clients and vendors to review agreements, upload attachments, and submit signatures without needing an admin login.
- **Dependencies:** Contract generation service operational; access token or magic link pattern finalized; document versioning policy established.
- **Integration Touchpoints:** Document storage for signed artifacts, audit logging system, messaging provider for signature confirmations.

### Reminder Analytics and Escalation Automation
- **Outcome:** Track reminder engagement, escalate overdue signatures to the admin, and surface actionable insights within the dashboard.
- **Dependencies:** Reminder tracking events emitted from the contract workflow; notification dashboard metrics ingestion pipeline active.
- **Integration Touchpoints:** Messaging analytics endpoints, admin dashboard alerting modules.
