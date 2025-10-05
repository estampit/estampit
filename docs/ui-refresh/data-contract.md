# Data Contract – Marketing & Owner Dashboard Refresh

_Last updated: 2025-10-05_

This document defines how the redesigned UI consumes Supabase data. It covers current tables/functions, gaps, and the new contracts we need before implementation.

## 1. Core Entities

| Entity | Source | Key fields (existing) | Used by | Notes / Actions |
|--------|--------|-----------------------|---------|-----------------|
| `public.businesses` | Table | `id`, `owner_id`, `name`, `logo_url`, `primary_color`, `secondary_color`, `background_color`, `text_color`, `card_title`, `card_description`, aggregated metric columns (`metrics_total_customers`, etc.) | Dashboard header, appearance editor, analytics summary | Confirm metric columns exist; if not, add computed columns or view. Ensure RLS allows owners to read their business.
| `public.loyalty_cards` | Table | `id`, `business_id`, `name`, `stamps_required`, `reward_description`, `card_color`, `is_active` | Dashboard overview, customer cards, wallet pass payload | Need consistent naming (`stamps_required` vs `target_stamps`). Add view joining business for quick access.
| `public.customer_cards` | Table | `id`, `customer_id`, `loyalty_card_id`, `current_stamps`, `total_rewards_earned`, `last_stamp_at` | Customer segments, join funnel metrics | Create index on `(loyalty_card_id, customer_id)` for faster lookups.
| `public.stamps` | Table | `id`, `business_id`, `customer_card_id`, `stamp_method`, `metadata`, `created_at` | Time-series charts, rate calculations | Add materialized view for daily aggregates.
| `public.rewards` | Table | `id`, `business_id`, `customer_card_id`, `reward_type`, `is_redeemed`, `redeemed_at` | Redemption metrics, cohort analysis | Ensure redeemed vs pending breakdown available.
| `public.promotions` | Table | `id`, `business_id`, `name`, `promo_type`, `is_active`, `starts_at`, `ends_at`, `priority`, `config` JSON | Promotions tab, campaign builder | Add `usage_count` view, enforce default ordering by `priority`.
| `public.business_events` | Table | `id`, `business_id`, `event_type`, `payload`, `created_at` | Events feed, notifications | Confirm event taxonomy; consider edge function to summarize for UI.
| `public.testimonials` *(new)* | Table | `id`, `author`, `role`, `avatar_url`, `quote`, `highlight`, `display_order` | Marketing trust carousel | Needs public RLS (read) and CMS editing permissions.
| `public.pricing_plans` *(new)* | Table | `id`, `plan_code`, `name`, `price_monthly`, `price_yearly`, `features` JSONB, `cta_label`, `display_order` | Pricing section + toggle | Add row-level policy to allow anonymous read.

## 2. Supporting Views & Materialized Views

| View | Purpose | Columns | Refresh strategy | Status |
|------|---------|---------|------------------|--------|
| `public.landing_stats` *(new)* | Serve marketing metrics (total businesses, stamps issued, rewards redeemed) | `metric`, `value`, `trend` | Real-time or cached via Supabase Edge Function (update every 15m) | To create |
| `public.mv_customer_segments` *(new materialized view)* | Group customers for dashboard (active, lapsing, churn risk, new) | `business_id`, `segment`, `count`, `avg_stamps`, `avg_spend`, `last_activity_at` | Refresh nightly via Supabase cron | To create |
| `public.mv_daily_activity` *(new materialized view)* | Pre-aggregate stamps/rewards per day | `business_id`, `activity_date`, `stamps_count`, `rewards_count`, `new_customers` | Refresh hourly | To create |

## 3. Existing Remote Procedures

The current dashboard already invokes several RPCs. Capture contracts here to ensure backward compatibility and to decide whether to evolve or replace them.

| Function | Inputs | Output (shape) | Current usage | Action |
|----------|--------|----------------|---------------|--------|
| `get_promotion_usage(p_business_id uuid)` | `p_business_id` | Array `{ promotion_id uuid, usage_count int }` | Promotions tab chart | Keep; extend to include `last_used_at` for tooltips.
| `get_stamps_stats(p_business_id uuid, p_range text)` | `p_range ∈ {'today','7d','30d'}` | `{ count int }` | Header KPIs | Replace with `get_dashboard_kpis` for richer data.
| `get_redemptions_stats(p_business_id uuid, p_range text)` | Same signature | `{ count int }` | Header KPIs | Merge into new KPI function.
| `get_stamps_timeseries(p_business_id uuid, p_days int)` | `p_days` default 14 | Array `{ day date, stamps_count int, redemptions_count int }` | Trend chart | Keep but back by `mv_daily_activity` to improve perf.
| `get_customer_analytics(p_business_id uuid, p_days int)` | `p_days` default 30 | JSON summary (avg spend, CLV, retention) | Customer analytics cards | Review internals to ensure indexes; expose typed contract in `packages/shared`.
| `get_customer_segments(p_business_id uuid, p_days int)` | | Array of segments with counts & deltas | Segments list | Update to read from `mv_customer_segments` and include `delta_vs_prev`.

## 4. New Remote Procedures Required

| Function | Inputs | Returns | Use case |
|----------|--------|---------|----------|
| `get_dashboard_kpis(p_business_id uuid, p_range text)` | `p_range ∈ {'today','7d','30d'}` | `{ stamps int, redemptions int, new_customers int, revenue numeric, delta jsonb }` | Dashboard overview KPI cards (with comparisons vs previous period).
| `get_customer_segments_timeseries(p_business_id uuid, p_days int)` | Days window | Array `{ day date, segment text, count int }` | Segment trend stacked area chart.
| `get_roi_projection(p_business_id uuid, p_plan text)` | Business id, plan code | `{ break_even_days numeric, projected_ltv numeric }` | Landing ROI calculator + upsell prompts.
| `list_testimonials()` | none | Array of testimonials (public) | Marketing trust carousel (server component).
| `list_pricing_plans()` | none | Array of pricing plans with features | Pricing table (public).

## 5. Realtime & Eventing

- **Promotions Channel**: Currently subscribed via `supabase.channel('owner-promotions')`. Extend to `business_id` scoped channels to handle multi-business owners.
- **New Channels**: `business-activity:{business_id}` broadcasting stamp/reward events for live KPI updates.
- **Edge Functions**: consider a `log_dashboard_seen` function to capture owner visits for analytics.

## 6. Access Control

| Actor | Access Requirements | Implementation Notes |
|-------|---------------------|----------------------|
| Anonymous marketing visitor | Read `landing_stats`, `testimonials`, `pricing_plans` | Use RLS `policy for select using (true)` with row filters as needed.
| Authenticated owner (client) | Read/write own `businesses`, `loyalty_cards`, `promotions`, `customer_cards` | Ensure all RPCs check `auth.uid()` or take `p_business_id` validated via security definer functions.
| Service role (server actions) | Full access for SSR/cron tasks | Keep secrets in server-side env, avoid exposing service role in browser.

## 7. Type Definitions & SDK

- Generate Supabase types (`supabase gen types typescript`) and surface under `packages/database` for strict typing.
- Create `apps/web/lib/supabase/dashboard.ts` with wrappers returning typed data from RPCs/views.
- Update `packages/shared/types.ts` to mirror new response schemas (KPI, segments, testimonials).

## 8. Migration Checklist

1. Create tables `testimonials`, `pricing_plans` with seed data for staging.
2. Create views/materialized views (`landing_stats`, `mv_customer_segments`, `mv_daily_activity`).
3. Author new RPCs/functions listed above with security definer wrappers.
4. Update RLS policies to allow appropriate read access.
5. Add Supabase migration scripts & tests (`backend/supabase/tests`).
6. Update CI to run `supabase db lint` after schema changes.

With this contract in place we can iterate on UI knowing the data shapes are stable and performant.
