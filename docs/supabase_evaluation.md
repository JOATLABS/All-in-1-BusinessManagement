# Supabase Deployment Evaluation

## Overview
Supabase provides a hosted Postgres database with auto-scaling infrastructure, a suite of open-source edge and serverless runtimes, and developer tooling for authentication, storage, realtime subscriptions, and row-level security policies. This section summarizes how Supabase aligns with the Afrobeat lounge platform goals captured in the architecture roadmap.

## Potential advantages
- **Managed Postgres with familiar SQL tooling.** Supabase exposes a vanilla PostgreSQL instance with extensions, allowing the team to keep the relational data model described in the roadmap while offloading maintenance tasks such as automated backups, PITR, and replicas.
- **Integrated auth and storage primitives.** Built-in Auth (GoTrue), object storage, edge functions, and realtime listeners can accelerate customer and admin experiences without wiring separate services for every capability.
- **Branching and local development parity.** Supabase Studio supports database branching and seed management, which pairs well with the need for safe contract template experimentation before promoting updates to production.
- **Scalable API generation.** PostgREST auto-generates REST APIs from database schemas, letting the team expose read-heavy public endpoints (event listings, content) quickly while preserving RLS for admin-only data.
- **Operational visibility.** The dashboard surfaces query insights, log streaming, and usage metrics, which can complement the observability requirements captured in the best-practices audit.

## Key trade-offs and constraints
- **Managed networking limitations.** Supabase currently requires all traffic to route through its managed gateways, so self-hosted middleware on Fly.io or Cloudflare Tunnel must interact over the public internet, complicating the zero-trust network plan in the roadmap.
- **Function and auth limits.** Edge Functions and GoTrue are designed for stateless workloads; long-running webhook handlers, Redis-backed workers, and bespoke session storage may still need to live on the existing Express infrastructure.
- **Regional availability and compliance.** Supabase’s region catalog is expanding but still smaller than hyperscale clouds. Verifying SOC2, PCI, and data residency requirements is essential before storing signed contracts and payment metadata there.
- **Cost for high-concurrency automations.** Realtime, storage egress, and function invocations scale with usage. The automation roadmap (webhooks, reminders, QR sync) must account for these costs to avoid overruns during event spikes.
- **Vendor lock-in for platform features.** Deep integration with Supabase Auth, Storage, and Functions increases switching costs if the team later needs custom IAM or object lifecycle policies beyond the managed feature set.

## Recommended posture
Supabase can host the production Postgres tier while the team keeps custom APIs, Redis queues, and integrations on Fly.io/Cloudflare as planned. Adopt Supabase when the roadmap’s need for managed Postgres plus developer tooling outweighs the networking and compliance constraints, but maintain abstraction layers (e.g., Prisma/Drizzle) so the application remains portable to Neon or self-managed Postgres if requirements change.

## Next steps
1. Prototype database branching and PITR workflows in Supabase Studio for contract template QA.
2. Evaluate GoTrue session hardening and MFA support against the audit’s authentication requirements.
3. Validate latency from Fly.io regions to Supabase’s closest region to ensure admin dashboards stay responsive during peak traffic.
4. Map webhook and background job workloads to determine which pieces stay on the current Express + Redis stack versus Supabase Edge Functions.
5. Review compliance documentation with stakeholders to confirm Supabase meets contractual obligations for contract and payment data retention.
