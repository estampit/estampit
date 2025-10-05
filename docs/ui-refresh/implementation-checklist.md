# UI Refresh Implementation Checklist

_Last updated: 2025-10-05_

This living checklist turns the roadmap into actionable tickets. It is grouped by scope (marketing vs owner app vs Supabase). Each task references the relevant discovery docs.

## Legend
- `📄` Linked doc (audit, data contract, wireframe)
- `⚙️` Requires Supabase migration / backend work
- `🧪` Requires automated test/QA coverage
- Status: ☐ Not started · ◐ In progress · ✅ Done

---

## A. Marketing Site (`apps/web/app/(marketing)`)

### A1. Foundations
- ☐ Setup `app/(marketing)/layout.tsx` with shared head/meta and analytics hooks.
- ☐ Create design primitives (`Button`, `Badge`, `SectionHeader`, `MetricCard`) under `app/(marketing)/components`.
- ☐ Update Tailwind config with new color tokens + typography. (`📄 component-audit`, `📄 moodboard`)

### A2. Hero & Above-the-fold
- ☐ Build split hero with badge, headline, CTAs, trust bar (`📄 wireframes`).
- ☐ Integrate device mockup carousel (Framer Motion) with auto-rotation and manual controls.
- ☐ Fetch testimonial logos from Supabase (`list_testimonials`). ⚙️

### A3. Use Cases & Features
- ☐ Implement tabbed use-case section (Cafeterías, Restaurantes, etc.) with Supabase-backed content. ⚙️
- ☐ Build feature storytelling sections with screenshot callouts.
- ☐ Create process timeline for onboarding flow (referencing Loyaltify inspiration).

### A4. Social Proof & Pricing
- ☐ Stats band fetching `landing_stats` view. ⚙️
- ☐ Testimonial carousel with avatars/quotes.
- ☐ Pricing table with monthly/annual toggle using `pricing_plans`. ⚙️
- ☐ Optional competitor comparison table.

### A5. Conversions & Footer
- ☐ Interactive ROI calculator (local computations + optional logging). 🧪
- ☐ FAQ accordion with Supabase-managed content (future CMS-ready). ⚙️
- ☐ Final CTA strip and redesigned footer.

### A6. QA
- ☐ Lighthouse script added to CI.
- ☐ Playwright visual snapshots for hero/pricing/CTA sections. 🧪
- ☐ Accessibility audit (axe-core) integrated in tests. 🧪

---

## B. Owner Dashboard (`apps/web/app/dashboard/*`)

### B1. Shell & Navigation
- ☐ Create dashboard layout with sidebar + topbar using new `DashboardShell` component (`📄 wireframes`).
- ☐ Implement command palette + quick actions.
- ☐ Ensure responsive behaviour (mobile bottom nav).

### B2. Overview Tab
- ☐ KPI cards consuming `get_dashboard_kpis`. ⚙️
- ☐ Trends chart backed by `mv_daily_activity` view. ⚙️
- ☐ Customer segment summary cards (Active, En riesgo, Perdidos, Nuevos). ⚙️
- ☐ Real-time activity feed (Supabase channel `business-activity:{id}`).

### B3. Customers Tab
- ☐ TanStack Table with filters/search, infinite scroll.
- ☐ Detail drawer with timeline of visits/rewards.
- ☐ Bulk actions (export CSV, campaign trigger).

### B4. Promotions & Campaigns
- ☐ Promotions list with status filters and metrics (usage counts from RPC).
- ☐ Campaign builder wizard (multi-step) using new Supabase functions. ⚙️
- ☐ Performance analytics charts per promotion.

### B5. Appearance & Wallet
- ☐ Rebuild appearance editor with live wallet pass preview.
- ☐ Integrate color/logo upload and theme persistence.
- ☐ Trigger pass refresh after save (Supabase function).

### B6. Staff & Settings
- ☐ Staff management table + invite modal.
- ☐ Integrations tab summarizing POS/email connections.
- ☐ Billing tab → Stripe portal link.

### B7. Tech Debt & Data Layer
- ☐ Adopt TanStack Query throughout dashboard data fetching.
- ☐ Create `lib/supabase/dashboard.ts` typed wrappers.
- ☐ Replace AuthContext with server-side auth helpers.
- ☐ Write unit tests for hooks/services. 🧪
- ☐ Add Cypress/Playwright flows for key journeys (onboarding, campaign creation, live stamp event). 🧪

---

## C. Supabase Backend

### C1. Schema Changes
- ☐ Create tables `testimonials`, `pricing_plans`, `use_case_content`. ⚙️
- ☐ Create materialized views `mv_customer_segments`, `mv_daily_activity`. ⚙️
- ☐ Add view `landing_stats`. ⚙️
- ☐ Write seeds for staging/demo data.

### C2. Remote Procedures & Functions
- ☐ Implement `get_dashboard_kpis`. ⚙️
- ☐ Update `get_customer_segments` to use materialized view. ⚙️
- ☐ Add `get_customer_segments_timeseries`. ⚙️
- ☐ Add `get_roi_projection`. ⚙️
- ☐ Add public read functions `list_testimonials`, `list_pricing_plans`. ⚙️
- ☐ Event trigger or edge function for `business-activity` channel.

### C3. Access Control & Performance
- ☐ Update RLS policies for new tables/views.
- ☐ Add indexes (customer_cards, stamps).
- ☐ Cron jobs for refreshing materialized views.
- ☐ Supabase tests covering new RPCs.

---

## D. Project Ops

- ☐ Generate Supabase types and expose via `packages/database`.
- ☐ Update `packages/shared/types.ts` with new response schemas.
- ☐ Create storybook stories for new marketing + dashboard components.
- ☐ Ensure CI runs lint, type-check, backend lint (`supabase db lint`), Lighthouse.
- ☐ Prepare release plan + change log once feature flags ready.

This checklist will be updated as tasks are ticketed and completed.
