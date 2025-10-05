# UI Refresh & Insights Roadmap

## Objectives
- Elevate the marketing site so it competes visually with top loyalty SaaS competitors while keeping sub-2s LCP and WCAG AA compliance.
- Give store owners an analytics-rich dashboard with live loyalty metrics that drive daily usage and upsell opportunities.
- Keep Supabase as the single source of truth by exposing new RPCs/materialized views instead of mock data.
- Ship incrementally behind feature flags and validate impact through analytics.

## Current State Snapshot
- **Landing page** relies on static hero + feature sections with minimal interaction, no real testimonials, and generic CTAs.
- **Owner dashboard** already queries Supabase but replicates data manually in multiple components, lacks modern layout, and mixes UI concerns with data fetching in a single giant component.
- **Design system**: Tailwind-based, but tokens and gradients are ad-hoc; component variants vary between landing and dashboard.
- **Analytics plumbing**: RPCs available (`get_promotion_usage`, `get_stamps_stats`, `get_customer_analytics`, etc.), but no materialized views or cron tasks for heavier aggregations yet. Real-time channels exist for promotions only.

## Phase 1 — Discovery (current)
1. Inventory existing components (landing + dashboard) and capture reusable patterns.
2. Map Supabase schema needed for analytics: `businesses`, `loyalty_cards`, `customer_cards`, `stamps`, `rewards`, `promotions`, `business_events`.
3. Benchmark 3 competitors (e.g., Loyalzoo, FiveStars, Smile.io) for layout inspiration, hero content, data storytelling, and interactive demos.
4. Define core metrics & UX KPIs.

### Deliverables
- Component matrix (reusable vs. rewrite) — `/docs/ui-refresh/component-audit.md` *(next)*.
- Supabase data contract doc — `/docs/ui-refresh/data-contract.md` *(next)*.
- Visual moodboard references — `/docs/ui-refresh/moodboard.md` *(external links allowed)*.

## Phase 2 — Landing Page Upgrade
1. **Visual Design & Copy** *(in progress)*
   - Translate wireframes into low-fi mocks focusing on Loyaltify-inspired hero/use-case tabs.
   - Finalize palette, typography, and illustration direction (Clash Display + Inter, gradient tokens).
   - Source testimonial/pricing content structure aligned with Supabase tables.
2. **Content & Conversion**
   - Build use-case tab section with vertical-specific CTAs.
   - Implement trust bar, testimonial carousel, and ROI calculator tied to Supabase data contract.
   - Pricing table with toggle (monthly/annual) fed from `public.pricing_plans`.
3. **Engineering**
   - Split landing into server components for faster TTFB, use `generateMetadata` for SEO.
   - Create `apps/web/app/(marketing)` route group with dedicated layout and component library.
   - Implement Framer Motion interactions for hero + section reveals.
4. **Validation**
   - Lighthouse automation via CI (add to root `package.json` and pipeline).
   - Visual regression snapshots via Playwright for key breakpoints.

## Phase 3 — Owner Dashboard Enhancements
1. **Structure & Navigation** *(designing)*
   - Implement dashboard shell with sidebar/topbar following wireframe.
   - Break tabs into route segments (`dashboard/(overview)`, `(customers)`, etc.).
2. **Analytics Modules**
   - Overview KPIs powered by new `get_dashboard_kpis` RPC.
   - Trends and segments charts using materialized views (`mv_daily_activity`, `mv_customer_segments`).
3. **Engagement Tools**
   - Campaign builder wizard with Supabase functions for scheduling and notifications.
   - Real-time alerts via channel `business-activity:{id}` feeding notifications panel.
4. **Appearance Editor**
   - Live wallet pass preview tied to Supabase appearance fields and shared components.
5. **Tech Debt**
   - Migrate to TanStack Query for data fetching and centralize Supabase wrappers in `apps/web/lib/supabase/dashboard.ts`.

## Phase 4 — Shared Foundations
- Extend Tailwind config with design tokens (spacing, typography, colors, shadows) under `theme.extend`.
- Launch Storybook in `packages/ui` with new components and connect to Chromatic for visual diffing.
- Add ESLint plugins: `eslint-plugin-jsx-a11y`, `eslint-plugin-tailwindcss`.
- Author Supabase migrations for new tables/views/functions, plus seeds for demo data under `backend/supabase/migrations`.

## Supabase Integration Checklist
- [ ] Define new RPCs/views (`get_dashboard_kpis`, `get_customer_segments_timeseries`, `get_roi_projection`).
- [ ] Update Row Level Security to allow owner access (service role SSR, client w/ policies).
- [ ] Add background job (Supabase cron) to refresh materialized views.
- [ ] Seed demo data for staging preview.

## Success Metrics
- Landing: +20% CTA click-through, Lighthouse Perf > 90, Accessibility > 95.
- Dashboard: daily active owners +30%, average time-on-dashboard > 4 min, <2s data refresh after stamp event.
- Engineering: component reuse up 40%, bundle reduction >15% via code splitting.

## Next Steps
1. Produce component audit (`docs/ui-refresh/component-audit.md`) with reuse/replace decisions. ✅
2. Derive data contracts and identify missing Supabase functions (`docs/ui-refresh/data-contract.md`). ✅
3. Assemble moodboard & visual references (`docs/ui-refresh/moodboard.md`). ✅
4. Draft wireframes (Figma link to be embedded once ready).
5. Begin implementing Phase 2 hero & layout behind feature flag (`NEXT_PUBLIC_ENABLE_NEW_LANDING`).
