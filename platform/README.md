# Afrobeat Lounge Platform

A Next.js application that delivers an immersive Afrobeat lounge website for guests and an in-house command center for the business team. The build follows the roadmap documented in the repository root and emphasises dark-mode UX, edge rendering, and automated verification gates for every feature stream.

## Tech stack

- Next.js 15 (App Router) with React 19 and TypeScript
- Tailwind CSS v4 for theming and layout primitives
- Stripe-ready reservation flows with API routes for deposit quoting
- Multi-location ready architecture with edge caching and observability hooks
- Vitest + Testing Library for automated frontend and backend verification

## Getting started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

The app is available at [http://localhost:3000](http://localhost:3000). Turbopack is enabled for faster refresh cycles and low-latency feedback.

## Quality gates

```bash
npm run lint   # Next.js linting with project-aware rules
npm run test   # Vitest unit tests for UI and reservation services
npm run build  # Production build with Turbopack
```

## Key features

- **Hero & journey** – Immersive hero, curated guest flows, playlist showcases, partnership highlights and performance guardrails for low-latency UX.
- **Events** – Edge-revalidated API endpoints and responsive event cards with real-time occupancy indicators.
- **Reservations** – Accessible reservation flow that calculates deposits via `/api/reservations/quote` while enforcing availability caps.
- **Command center** – Operations overview summarising lounge management modules, automation and observability commitments.
- **Compliance** – Status and privacy pages communicate uptime, incident response and data governance expectations.

## Testing strategy

Frontend components are covered with Testing Library to ensure the hero CTA and featured events render for every release. Backend reservation logic is tested with Vitest to validate occupancy calculations, deposit math and critical availability alerts before deployment.
