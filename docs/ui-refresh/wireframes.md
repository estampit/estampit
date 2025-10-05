# Wireframe Outline – Landing & Owner Dashboard Refresh

_Last updated: 2025-10-05_

These wireframe notes describe the target layouts and flows for the redesigned marketing site and owner dashboard. They fold in learnings from competitors like Loyaltify, Loyalzoo, FiveStars, and Smile.io while adapting them to the MyStamp value proposition.

> **References**
> - https://www.loyaltify.io/es/#use-cases – use-case storytelling, vertical-specific CTAs.
> - https://www.fivestars.com/ – testimonial carousel, hero animation.
> - https://smile.io/ – pricing toggle and feature comparison.

## 1. Marketing Landing Page (Desktop first)

### 1.1 Hero Section
- **Layout**: Split hero (60/40). Left column: headline + subheadline + primary CTA ("Prueba gratuita de 14 días") and secondary CTA ("Solicita demo"). Right column: device mockup carousel (auto-rotating) showing loyalty card filling up, referencing Loyaltify's use-case visuals.
- **Elements**:
  - Microcopy above headline: small badge "Loyalty CRM para retail & hospitality" similar to Loyaltify segment tags.
  - Headline: bold statement connecting to revenue impact (“Convierte a cada visita en un cliente fiel”).
  - CTA group: Buttons with icons, plus a "Sin tarjeta física" bullet list.
  - Trust bar under CTAs: brand logos (seed: from testimonials table).
  - Background: layered gradient + confetti animation triggered on CTA hover.
- **Interactions**: On scroll, hero transitions into next section with parallax. Device mockup uses Framer Motion to flip between stamp and analytics screens.

### 1.2 Social Proof & Stats
- **Layout**: Horizontal band with three KPI cards (total sellos, recompensas canjeadas, comercios activos) pulling live numbers from `landing_stats` view.
- **Highlight**: Up/down arrows showing % delta vs previous month.

### 1.3 Use Cases (inspired by Loyaltify)
- **Layout**: Tabbed (pills) for verticals: Cafeterías, Restaurantes, Salones de Belleza, Gimnasios.
- **Content**: Each tab shows hero image + bullet benefits + relevant metric (“Incrementa los retornos +32%”). Data fetch from Supabase `use_case_content` table (to create) or embed in CMS.
- **CTA**: "Ver guía completa" linking to blog/case study.

### 1.4 Feature Storytelling
- **Section 1**: "Sellos digitales sin fricción" – grid of 3 cards w/ icons, lighten backgrounds.
- **Section 2**: "Dashboard inteligente" – screenshot with callouts (tooltip style). Inspired by Loyaltify use case overlays.
- **Section 3**: "Automatiza promociones" – highlight workflow (trigger > segment > recompensa) using stepper component.

### 1.5 Integrations & Processes
- **Carousel**: Show partner integrations (POS systems, email providers) with icon slider.
- **Process Flow**: Timeline from signup → configuración de negocio → clientes se unen → recompensas → reportes, referencing the step narrative on Loyaltify.

### 1.6 Testimonials & Proof
- **Carousel**: 3 cards per view with quote, avatar, rating, business type. Auto-play with manual controls.
- **Video**: Optional embedded video (Lightbox) featuring founder or customer story.

### 1.7 Pricing
- **Toggle**: Mensual/Anual switch (annual shows discount). Derived from `pricing_plans` table.
- **Cards**: 3 tiers with highlight state for "Más popular". Each card includes plan features with checkmarks and add-ons.
- **Comparison Table**: Under cards, responsive table comparing features vs competitors (optional).

### 1.8 FAQ & Support
- **Accordion**: Top 6 questions. Inset call-to-action for contact.

### 1.9 Final CTA & Footer
- **CTA Band**: Background gradient, short copy, CTA button, contact link.
- **Footer**: Organized in 4 columns (Producto, Recursos, Empresa, Legal) plus social icons and language selector.

### Mobile Considerations
- Collapse hero with stacked layout, convert tabs to select menu, use horizontal scroll for cards.

## 2. Owner Dashboard (App Router)

### 2.1 Global Shell
- **Structure**:
  - Left sidebar (collapsed on mobile) with navigation icons (Overview, Clientes, Promociones, Campañas, Apariencia, Ajustes) using iconography similar to modern SaaS (inspired by Linear + Loyaltify admin).
  - Top bar with search/command palette, notifications (real-time), profile dropdown, and quick action button ("Agregar sello").
- **Theme**: Light + optional dark mode. Primary accent matches marketing palette.

### 2.2 Overview Page
- **Top KPIs**: Responsive grid of cards showing Sellos hoy, Nuevos clientes, Canjes semana, Ingresos estimados. Each card includes delta vs previous period and small sparkline. Data from `get_dashboard_kpis`.
- **Live Activity Feed**: Right column (on desktop) showing real-time events (customer joined, reward redeemed) using Supabase real-time channel `business-activity:{id}`.
- **Trends Section**: Dual-axis chart for stamps vs redemptions (Recharts LineChart) pulling from `get_stamps_timeseries` (backed by materialized view). Include filters (7d/30d/90d) and segmentation toggle (by location).
- **Customer Segments Snapshot**: Horizontal cards for Active, En Riesgo, Perdidos, Nuevos with counts from `mv_customer_segments` plus "Ver detalles" link.
- **Task & Alerts Panel**: Expandable card showing recommended actions ("Programa una campaña" etc.) similar to Loyaltify's guided steps.

### 2.3 Customers Page
- **Header**: Search bar, filters (segment, plan, última visita).
- **Table**: TanStack Table w/ sticky header, infinite scroll. Columns: Nombre, Sellos actuales, Recompensas, Última visita, Gasto. Bulk actions (export CSV, enviar campaña) in toolbar.
- **Detail Drawer**: Sliding panel when clicking a row showing timeline of visits, rewards, demographic info.

### 2.4 Promotions & Campaigns
- **List View**: Card list with status pills (Activo, Pausado, Programado). Each card shows goal, canjes, finaliza en.
- **Creation Wizard**: Multi-step form (Tipo > Segmento > Mensaje > Revisión) with progress indicator. Integrate schedule and budget controls.
- **Analytics Tab**: Bar chart comparing promotion performance; top table highlighting ROI.

### 2.5 Appearance & Wallet Pass
- **Layout**: Two-column: Form controls on left, live preview on right (wallet pass + landing card). Use early version of pass preview hooking into same components as marketing demo.
- **Actions**: Upload logo, set colors, adjust copy, preview on mobile template. Option to push updates to existing customer passes.

### 2.6 Staff & Permissions
- **Table**: List staff, roles, last access. Add "Invitar" button opening modal (email + role). Manage role-based access (owner, manager, cashier).

### 2.7 Settings & Integrations
- **Tabbed**: Business info, Integrations (POS, eCommerce), Billing (stripe portal). Provide summary cards for integration status similar to Loyaltify processes.

### Mobile Dashboard
- Collapse sidebar into bottom navigation, stack KPI cards, convert tables into cards with key stats.

## 3. User Journeys

1. **New Merchant Onboarding**
   - Signup → onboarding wizard (business info, loyalty card setup, appearance) using progressive disclosure like Loyaltify process.
   - After completion, direct to Overview with guidance checklist.

2. **Campaign Launch Flow**
   - Owner visits Campaigns tab → selects "Crear campaña" → wizard → schedule on calendar → confirm summary → success toast and card inserted at top with status.

3. **Real-time Reward Redemption**
   - Staff uses Universal Scanner → stamp event triggers real-time update in Overview KPI and feed; customer detail drawer shows new stamp.

4. **Marketing Funnel**
   - Visitor arrives via marketing campaign (landing hero) → selects "Ver demo" (modal form) or "Comenzar gratis" (auth flow) → tracked via analytics.

## 4. Implementation Notes

- Separate marketing route group (`app/(marketing)`) from application area (`app/(app)`), allowing lightweight marketing bundles.
- Use feature flags for new landing/dash (e.g., `NEXT_PUBLIC_ENABLE_NEW_LANDING`, `NEXT_PUBLIC_ENABLE_DASH_V2`).
- Ensure Supabase queries for marketing (pricing/testimonials) run server-side (edge) for SEO.
- Adopt new Tailwind tokens defined in design system update.

## 5. Next Deliverables

1. Translate this outline into low-fidelity wireframes (Figma link to add).
2. Confirm data contract feasibility with backend (new tables/views migrations).
3. Prepare component tickets referencing audit + wireframe specs.
