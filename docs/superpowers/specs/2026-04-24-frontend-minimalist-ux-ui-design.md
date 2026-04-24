# Frontend UX/UI Coherence Design (Sober + Minimalist)

## Context

The frontend already has a strong MUI-based structure, reusable building blocks, and a recently refreshed visual style. The goal is not a redesign. The goal is a low-risk refinement pass that improves coherence, readability, and perceived quality across the whole app while preserving current behavior and navigation.

Primary areas of influence:

- Global design tokens and component defaults in `frontend/src/theme/theme.ts`
- Global browser-level styling in `frontend/src/index.css`
- App shell and navigation surfaces (`Drawer`, list navigation, toolbar patterns)
- Shared content wrappers (`PageContainer`, `DataGrid`, form container patterns)
- Representative page families (sign-in, list/table pages, detail/form pages, reports)

Out of scope:

- Route changes, feature changes, data model changes, or backend integration changes
- Major layout restructuring
- Rebranding

## Goals and Success Criteria

### Goals

- Deliver a coherent, sober, minimalist visual language across the full frontend.
- Improve visual consistency using mostly global/thematic changes.
- Keep interaction behavior and information architecture intact.
- Minimize risk and code churn.

### Success Criteria

- A user can move between login, drawer navigation, list pages, forms, and reports without abrupt visual style shifts.
- Spacing, radii, borders, text emphasis, and control states feel consistent and calm.
- Components remain functionally unchanged.
- The frontend builds successfully and passes lint for touched files.

## Approaches Considered

### Approach A (Recommended): Theme-First Global Harmonization

Refine tokens and component overrides at theme level, then apply small targeted tweaks only where global styles do not fully solve consistency.

Pros:

- Maximum consistency with minimal per-page edits
- Lowest regression risk
- Fastest path to visible app-wide improvement

Cons:

- Limited dramatic transformation
- Requires careful tuning to avoid unintended global side effects

### Approach B: Component-by-Component Visual Touch-Up

Tune key components independently without a strong token-first pass.

Pros:

- High local control

Cons:

- Higher inconsistency risk
- More repetitive edits

### Approach C: Hybrid with Layout Restructuring

Theme tuning plus shell and content layout reorganization.

Pros:

- Largest possible visual impact

Cons:

- Higher complexity and regression risk
- Conflicts with “don’t change too much”

Recommendation: Approach A with light targeted component refinement.

## Proposed Design

### 1) Visual System Refinement (Global)

Update the existing visual language by reducing contrast noise and harmonizing rhythm:

- Keep neutral/chrome palette direction, but smooth contrast jumps between background layers.
- Keep the current accent identity while reducing over-emphasized selection/focus fills.
- Standardize border presence as the primary separation mechanism instead of stronger fills.
- Normalize corner-radius usage across surfaces and controls.
- Tighten typography hierarchy:
  - Fewer extreme weight jumps
  - Consistent title/body/supporting text rhythm
- Keep density compact, but ensure predictable spacing increments.

Expected result: calmer and more coherent UI with minimal visual surprise across modules.

### 2) Shared Shell and Navigation Consistency

Refine app shell surfaces while preserving behavior:

- Align top app bar, drawer, and main content container spacing rhythm.
- Keep breadcrumbs and title hierarchy, but reduce heavy emphasis differences.
- Keep drawer collapse/expand and nested list behavior unchanged.
- Soften selected/hover states in navigation so active context remains clear without high visual intensity.

### 3) Shared Data and Form Patterns

Unify style semantics in highly reused components:

- Data grid containers, headers, row hover/selected cues, toolbars, and pagination chrome should follow one neutral system.
- Form containers/cards should match the same border/radius/shadow logic as table and page containers.
- Inputs and focus rings should remain accessible while becoming visually quieter and consistent.

### 4) Page-Level Consistency Pass

Apply spot adjustments only where a page diverges from shared standards:

- Sign-in surface hierarchy and vertical rhythm
- Typical list pages using `DataGrid`
- Typical detail/form pages using `EntityFormContainer`
- Reports pages

No page-specific redesign; only alignment to system rules.

## Architecture and Boundaries

### Core Styling Layers

1. Theme tokens and MUI component overrides (`theme.ts`) as source of truth.
2. Global CSS (`index.css`) for browser-wide defaults (font-face, scrollbar, base smoothing).
3. Shared reusable components (`Drawer`, `DataGrid`, `PageContainer`, `EntityFormContainer`) as distribution points.
4. Page-level styles only for local exceptions.

### Responsibility Boundaries

- `theme.ts`: canonical definitions for color semantics, state feedback, radius, shadows, component default styling.
- `index.css`: only generic base styles that cannot/should not live in MUI theme.
- Shared components: consume theme consistently and avoid local one-off visual rules unless required.
- Pages: should rely on shared primitives and only declare local spacing/layout specifics.

## Data Flow and State Impact

No new data flow is introduced.

- Existing UI state in Redux (`uiSlice`) remains unchanged.
- Existing routing and auth flow remain unchanged.
- Existing DataGrid filtering/sorting/pagination behavior remains unchanged.

This work is purely presentational and style-system-oriented.

## Error Handling and Risk Management

Primary risks:

- Unintended global visual side effects from theme override changes
- Subtle contrast regressions affecting readability
- Inconsistent results if local `sx` overrides conflict with theme defaults

Mitigations:

- Prefer incremental token changes over broad structural override rewrites.
- Keep per-component targeted edits narrow and justified.
- Validate representative pages (public and private) after each grouped change.
- Preserve accessible contrast and visible focus cues.

## Testing and Verification Strategy

### Functional Safety

- `pnpm -s run build` in `frontend` to ensure TypeScript/build integrity.
- `pnpm -s run lint` in `frontend` for static checks on touched code.

### Visual/UX Verification

Manual visual pass on representative screens:

- Sign-in page
- Drawer navigation across collapsed/expanded and nested routes
- At least one table/list page with search and row interactions
- At least one detail/form page with editable and read-only states
- Reports page(s)

Checklist:

- Surface hierarchy is consistent and calm
- Hover/selected/focus states are visible but not heavy
- Typography and spacing rhythm feel consistent
- No clipped/overflowing UI on mobile and desktop common breakpoints

## Rollout Plan (High-Level)

1. Tune global tokens and high-impact MUI overrides.
2. Adjust shared shell/navigation components for rhythm and emphasis consistency.
3. Harmonize shared data/form wrappers and toolbar patterns.
4. Apply minimal page-level corrections where divergence remains.
5. Build/lint and run manual visual verification pass.

## Non-Goals and Guardrails

- Do not alter feature behavior.
- Do not introduce new UX paradigms.
- Do not over-theme with decorative effects.
- Do not perform broad refactors unrelated to visual coherence.

## Expected Outcome

A visibly more polished and cohesive frontend that feels sober and minimalist, achieved mostly through global style harmonization and a handful of focused shared-component refinements, with minimal disruption to the existing product structure.
