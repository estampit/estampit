# Component Audit – Landing & Owner Dashboard

_Last updated: 2025-10-05_

This audit catalogs the UI surface currently powering the public marketing site and the store-owner dashboard. Each entry captures the component’s role, known issues, and recommended action for the redesign.

## Legend
- **Keep**: keep as-is, only polish/styling tweaks.
- **Refactor**: restructure or extract logic/styles but keep core behaviour.
- **Rebuild**: replace with a new implementation.

## Marketing / Landing Page (`apps/web/components`, `apps/web/app/HomePageClient.tsx`)

| Component | Location | Purpose | Data source | Notes | Recommendation |
|-----------|----------|---------|-------------|-------|----------------|
| `Navbar` | `apps/web/components/Navbar.tsx` | Static top navigation, CTA buttons. | Local constants | Uses hard-coded anchors, no mobile menu. | **Refactor** – introduce responsive menu, trust badge slot.
| `Hero` | `apps/web/components/Hero.tsx` | Hero headline, CTA buttons. | Static copy | Full-width gradient, no illustration/video, CTA buttons not wired. | **Rebuild** – integrate animation/device mockup, CMS-backed copy, CTA linking to signup flow.
| `Stats` | `apps/web/components/Stats.tsx` | Highlights metrics. | Static numbers | Hard-coded numbers reduce credibility. | **Refactor** – fetch live stats via Supabase view (`public.landing_stats`) or fallback to config.
| `Features` | `apps/web/components/Features.tsx` | Feature grid of loyalty benefits. | Static array | Minimal iconography, no differentiation by persona. | **Rebuild** – convert to responsive cards with illustrations, persona toggles.
| `HowItWorks` | `apps/web/components/HowItWorks.tsx` | Steps explanation. | Static array | No motion, copy verbose. | **Refactor** – add timeline animation, compress text, optionally power from CMS.
| `Pricing` | `apps/web/components/Pricing.tsx` | Displays current plans. | Static tiers | Lacks toggle, missing FAQs, no feature comparison. | **Rebuild** – dynamic tiers from Supabase `pricing_plans`, plan comparison matrix.
| `CTA` | `apps/web/components/CTA.tsx` | Final call-to-action block. | Static copy | Not re-usable elsewhere, minimal trust messaging. | **Refactor** – convert to generic `SectionCTA` with props, include testimonials.
| `Footer` | `apps/web/components/Footer.tsx` | Footer navigation/social. | Static links | No legal links, inconsistent spacing. | **Refactor** – align with new design system, drive links from config.
| `WalletPassQR` | `apps/web/components/WalletPassQR.tsx` | Displays QR pass download instructions on marketing. | Supabase data (optional) | Shares name with dashboard component; duplication risk. | **Refactor** – consolidate into shared component under `app/(shared)` folder.
| `HomePageClient` | `apps/web/app/HomePageClient.tsx` | Composes marketing sections, handles Supabase hash redirect. | Router + `window.location` | Entire page is a client component → poor TTFB, script heavy. | **Rebuild** – split into server/edge layout, extract auth hash handler into dedicated hook.

## Owner Dashboard (`apps/web/app/components` & `app/dashboard/*`)

| Component | Location | Purpose | Data source | Notes | Recommendation |
|-----------|----------|---------|-------------|-------|----------------|
| `OwnerDashboardWrapper` | `app/dashboard/owner/OwnerDashboardWrapper.tsx` | Guards dashboard behind auth, ensures business exists. | Supabase client | Inline `useEffect` checks, minimal skeleton. | **Refactor** – migrate to server component for auth redirect, SWR/TanStack Query for data checks.
| `OwnerDashboardClient` | `app/components/OwnerDashboardClient.tsx` | Monolithic container handling tabs, analytics, promotions, appearance. | Supabase client + RPCs | 700+ LOC, heavy state, manual polling, toasts everywhere. | **Rebuild** – split into route segments, hooks, and dedicated feature components.
| `BusinessAppearanceForm` | `app/components/BusinessAppearanceForm.tsx` | Update branding/colors. | Supabase client | No live preview, minimal validation. | **Refactor** – wrap in form system (React Hook Form), tie into new pass preview.
| `PromotionForm` | `app/components/PromotionForm.tsx` | Create/edit promotions. | Supabase actions | UI minimal, lacks scheduling/validation feedback. | **Refactor** – adapt to wizard, share component between create/edit.
| `PromotionsList` | `app/components/PromotionsList.tsx` | Table of promotions. | Supabase client | Presentational but depends on parent state. | **Refactor** – convert to headless table component with TanStack Table.
| `RedeemWalletPass` | `app/components/RedeemWalletPass.tsx` | Wallet pass redemption flow. | Supabase RPC | UI utilitarian, no scanner integration. | **Refactor** – integrate with `UniversalScanner`, add success states.
| `UniversalScanner` | `app/components/UniversalScanner.tsx` | Camera scanner for QR/NFC. | Browser APIs | Needs cross-device QA. | **Keep** – reuse with visual polish.
| `EventsFeedClient` / `EventsFeed` | `app/components` | Activity feed for business events. | Supabase channel. | Client fetch + unstyled list. | **Refactor** – adopt virtualized feed, notifications.
| `StaffManagement` | `app/components/StaffManagement.tsx` | Manage staff roles. | Supabase `staff_members` (assumed) | UI static, minimal role editing. | **Rebuild** – align with new design system, add invitations.
| `BusinessJoinQR` | `app/components/BusinessJoinQR.tsx` | Generates QR for customer join. | Supabase data | Duplicated logic vs marketing. | **Refactor** – share QR card component.
| `CustomerCardsList` | `app/components/CustomerCardsList.tsx` | Shows customer cards. | Supabase | Basic table, not exposed in UI currently. | **Refactor** – reuse for new customer segment views.
| `AppTopBar`, `AuthDebugger`, `EnrollForm`, `MyRewards` | Various | Legacy/test utilities. | Mixed | Need review; some only used in dev flows. | **Evaluate** – remove or migrate to separate dev bundle.

## Shared & Utility Layers

| Module | Location | Purpose | Notes | Recommendation |
|--------|----------|---------|-------|----------------|
| `AuthContext` | `app/context/AuthContext` | Provides user session to client components. | Wraps Supabase auth client-side only, causing hydration issues. | **Refactor** – replace with server-side auth + `@supabase/auth-helpers-nextjs`.
| `lib/supabase` clients | `apps/web/lib` | Client/server Supabase wrappers. | Both `supabaseClient.ts` and `serverSupabase` exist; duplication. | **Refactor** – consolidate into single entry with typed helpers.
| Actions (`apps/web/app/actions/*`) | Server actions for Supabase mutations. | Need consistent error typing, logging. | **Refactor** – align with new data layer and types from `packages/shared`.

## Risks & Opportunities
- **Duplication** between marketing and dashboard (QR, wallet components) → centralize in `packages/ui` or shared folder.
- **Monolithic Client Components** degrade performance; App Router allows server components/route segments to improve TTFB.
- **Type Safety**: Many components use `any`; leverage generated Supabase types (`supabase/remote_types.d.ts`).
- **Design System Gap**: No shared button/input primitives; new design tokens required for consistency.

## Next Steps
1. Split roadmap tasks into tickets referencing this audit.
2. Begin refactor spikes for `OwnerDashboardClient` into route segments.
3. Draft component API contracts for new marketing sections before rebuild.
