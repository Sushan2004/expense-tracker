# Express Tracker - Design System

A personal expense tracking app with a mint-green visual identity. The product should feel premium, calm, trustworthy, and easy to scan. Users should feel in control of their money within a few seconds of opening the app.

## Core flows

Add expense or income, categorize transactions, manage monthly budgets, review multiple accounts, track savings goals, handle recurring transactions, and explore reports with category breakdown and Sankey cashflow.

## Product principles

- Clarity over decoration
- Speed over density
- Trust over playfulness
- Important numbers should be readable at a glance
- Every screen should have one obvious primary action

---

## Build requirements

These are minimum implementation requirements for the project, not optional nice-to-haves.

- React 18+ SPA
- Functional components only with Hooks
- Vite project setup
- `react-router-dom` client-side routing
- Required routes: `/`, `/transactions`, `/transactions/:id`, `/about`, and `*` for 404
- Additional app routes: `/signup`, `/budget`, `/reports`, `/categories`, `/wallet`, `/goals`, `/settings`, and optionally `/add`
- Fetch app data from at least one source via `fetch`; for this project, prefer `public/data/seed.json`
- Show loading and error states for the data fetch
- Implement search, filter, and sort on the Transactions list
- Provide a detail view for a single item on `/transactions/:id`
- Use `useState` and `useEffect`, plus at least one appropriate advanced Hook pattern such as `useReducer` or `useMemo`
- Include at least one custom Hook, such as `useLocalStorage` or `useFetch`
- Include at least one controlled form, preferably the Add Expense / Income flow
- The Signup page can also serve as a controlled form for UX and validation requirements
- Persist at least one user-facing preference or recent state with `localStorage`
- Use semantic HTML, keyboard accessibility, labels, and clear focus states
- Use a modular component structure with meaningful props
- Use PropTypes or TypeScript; if the project stays in JavaScript, use PropTypes

## Data conventions

- `seed.json` is the fetched seed source only; runtime changes live in client state
- Income amounts are positive
- Expense amounts are negative
- Dates should use ISO-style storage where practical: `YYYY-MM-DD`
- Budgets are monthly and use the user's local timezone
- Savings rate = `(income - spending) / income`
- Credit accounts should be handled consistently as liabilities; choose one display rule and keep it everywhere
- Recurring transactions should include enough metadata to render their status clearly

---

## Design tokens

### Colors

```css
:root {
  /* Brand */
  --forest: #0B3D2E;        /* logo, hero cards, primary buttons, selected states */
  --emerald: #10B981;       /* progress fills, FAB, positive accents */
  --emerald-dark: #059669;  /* income amounts, success text on white */
  --mint: #A7F3D0;          /* selected pills, labels on dark backgrounds */
  --mint-wash: #ECFDF5;     /* icon tiles, selected row bg, soft accents */
  --sage: #D1E7DB;          /* subtle tints, skeleton shimmer highlight */

  /* Neutrals */
  --cream: #FAFAF5;         /* page background */
  --surface: #FFFFFF;       /* cards */
  --border: #E9E7DF;        /* 0.5px hairlines */
  --ink: #0E1F17;           /* primary text (never pure black) */
  --text-2: #5B6B63;        /* secondary text */
  --text-3: #95A098;        /* tertiary/hint text */

  /* Semantic */
  --warning: #D97706;       /* over-budget warnings, amber banners */
  --danger: #DC2626;        /* destructive only - delete confirmations */

  /* Category ramp (light -> dark), ordered for chart encoding */
  --cat-1: #D1E7DB;
  --cat-2: #A7F3D0;
  --cat-3: #6EE7B7;
  --cat-4: #34D399;
  --cat-5: #10B981;
  --cat-6: #059669;
  --cat-7: #0B3D2E;
}
```

**Application rules**

- Forest is scarce: logo, hero balance card, primary buttons, selected pills, dark-on-light accents only
- Emerald is for fills; never use it as text color, use `--emerald-dark` instead
- Mint and mint-wash are never backgrounds for body copy
- Income amounts render in `--emerald-dark`
- Expense amounts stay in `--ink`; only move into warning or danger states when context requires it
- Bright red is reserved for destructive confirmations only

### Typography

```css
font-family: 'Inter', -apple-system, sans-serif;
font-feature-settings: "tnum", "cnum";
```

Use only weights `400` and `500`. Hierarchy should come from size, spacing, and color, not heavier font weights.

| Role | Size | Weight | Notes |
|---|---|---|---|
| Display numeric | 32-40px | 500 | letter-spacing -0.02em |
| H1 screen title | 22px | 500 | |
| H2 section | 17px | 500 | |
| Body | 14-15px | 400 | line-height 1.5 |
| Label | 12-13px | 500 | |
| Caption | 11-12px | 400 | color: `--text-3` |
| Eyebrow | 11px | 500 | uppercase, letter-spacing 0.08em |

### Spacing

4px grid. Use 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

### Radius

```css
--radius-sm: 8px;   /* chips, pills, small buttons */
--radius-md: 12px;  /* cards */
--radius-lg: 16px;  /* hero cards */
--radius-xl: 24px;  /* sheets, modals */
```

### Shadow

Use one token and use it sparingly:

```css
--shadow-soft: 0 1px 2px rgba(14,31,23,0.04), 0 4px 12px rgba(14,31,23,0.04);
```

Hierarchy should come mainly from surface contrast and hairlines, not heavy shadow.

### Breakpoints

- `< 640px` - mobile, bottom nav, stacked content, sheets slide from bottom
- `640-1024px` - transitional tablet layout; sidebar collapses to icon rail
- `1024-1280px` - sidebar with labels, two-column dashboard
- `>= 1280px` - detail panels can appear on Transactions and Reports

---

## Components

### BalanceCard

Forest-green fill, mint label, 22-28px display number, optional in/out micro-stats row, rounded 16px.

### StatCard

White surface, 0.5px border, 12px eyebrow label, 20-24px number below, optional delta in `--emerald-dark` or `--warning`.

### TransactionRow

Left: 28px tinted square with inline-SVG category icon. Center: merchant plus supporting metadata. Right: signed amount. Minus stays `--ink`; plus uses `--emerald-dark`. Entire row is keyboard focusable and links to detail.

### CategoryTile

48px square, mint-wash background, 18-20px line icon in `--forest`, 11px label. Selected state uses mint-wash fill, 1px emerald border, and emerald label.

### ProgressBar

4-6px track in mint-wash. Fill logic: `--emerald` when under 80%, `--warning` at 80-100%, `--danger` over 100%. Always pair with a numeric readout.

### ProgressRing

SVG circle with the same status color rules as ProgressBar. Center content shows number plus muted label.

### Chip / FilterPill

Pill shape. Default is white with border. Selected is forest fill with mint-wash text. Secondary-selected is mint-wash fill with forest text.

### SegmentedControl

Mint-wash container with pill radius. Active segment uses forest fill with mint-wash text.

### FAB

56px emerald circle with white plus icon and soft shadow. Mobile: bottom-center above bottom nav. Desktop: bottom-right inside the main content area.

### Sheet / BottomSheet

Rounded top corners, centered grab handle, white content on cream. On desktop, the same pattern can become a centered dialog.

### Toast

Pill shape with `--shadow-soft`. Success uses mint-wash background plus forest text. Warning uses cream background plus warning text.

### Form fields

All inputs need labels, visible focus states, disabled states, error states, and helper text where useful. Finance forms should feel calm and obvious, not crowded.

---

## Screens

### 1. Dashboard

Greeting, date, avatar, BalanceCard hero, month budget strip, recent transactions, and top category spend bars. Desktop uses a 2-column layout.

### 2. Add Expense / Income

Mobile: full-height sheet. Desktop: centered dialog or route-level modal. Segmented Expense/Income toggle. Big amount display. Numeric keypad with calculator behavior. Default category picker shows 8 category tiles; add a "More" action only if categories exceed the default grid. Include note input, account picker, recurring toggle, date, and a fixed save action. This should be a controlled form and a strong candidate for `localStorage` persistence of the last-used entry type.

### 3. Transactions list

Top area includes title, search, export, and add entry. Filter chip row includes type, category, account, date range, and sort. Body groups rows by day with day totals. Desktop at large widths can show list + detail panel. This route must satisfy the coursework requirements for search, filter, sort, empty state, loading state, and error state.

### 4. Transaction detail

Hero with icon, merchant, date, and large amount. Show category, account, type, recurring state, and note. Include Edit, Duplicate, and Delete actions. This is the primary single-item detail view required by the project.

### 5. Budget Overview

Month selector, large ProgressRing for total budget status, category budget list with ProgressBars, and an adjust-budgets sheet.

### 6. Reports / Analytics

Period selector, 4 StatCards, a primary chart area with Bars and Flow views, and an insights column on desktop.

### 7. Categories Management

Sectioned list for default and custom categories. Each row includes icon tile, name, transaction count, average amount, and drag handle. Edit opens a sheet with icon picker and color swatches.

### 8. Wallet / Accounts

Stacked account cards using a slim BalanceCard variant. Include an add-account tile at the end.

### 9. Savings Goals

Each goal shows a ProgressRing, name, target date, and progress summary. Goal detail can include contribution history and suggested monthly amount.

### 10. Settings / Profile

Grouped settings list covering account, preferences, budgets and categories, notifications, data, security, and about. This is another good place to persist user preferences to `localStorage`.

### 11. Signup

Clean, premium auth-style page using the same mint-green identity. Include logo or brand area, headline, short supporting copy, fields for full name, email, password, and confirm password, a primary create-account action, and a secondary path for existing users. Show default, focus, disabled, loading, success, and inline error states. Mobile should use a calm single-column layout; desktop can use a centered card or tasteful split layout. This is a prototype UI for v1, so no real backend authentication is required unless added later.

### 12. About

Simple, calm informational route that explains what Express Tracker is, the design mission, and the key finance features. Keep it short and polished; do not make it feel like marketing fluff.

### 13. 404 Not Found

Cream background, small mint-toned illustration, one clear message, and a primary CTA back to the dashboard. It should feel on-brand, not like a default browser error.

---

## Sankey chart (Reports > Flow toggle)

Custom SVG, no chart library. Three columns: income sources -> income pool -> destinations, including savings as the positive outflow.

Rules:

- Cap right nodes at 5-7
- Categories under 4% collapse into `Other`
- Right-side nodes sort by amount descending
- Node and flow colors use `--cat-1` through `--cat-7` ordered by amount, not by category identity
- Savings uses `--emerald-dark`
- Flow opacity ranges from 0.4 for large flows to 0.75 for small flows
- Flow paths use cubic bezier curves with midpoint control points

Interactions:

- Hover or focus a flow to show exact amount and percent
- Clicking a flow or node should navigate to a filtered Transactions view through React Router
- Mobile should rotate to a vertical layout instead of forcing horizontal scroll

---

## States

**Empty states.** Small mint-toned SVG illustration, one-sentence explanation, and one clear CTA.

**Loading.** Skeleton layouts with mint-wash base and sage shimmer. The skeleton should match the real layout so the page does not jump.

**Error.** Amber banner or inline panel with one short explanation and a retry action. Use full-screen errors only when the whole route cannot function.

**Not found.** Use the dedicated 404 route style, not a generic text fallback.

---

## Accessibility

- Tap targets >= 44x44 on mobile, >= 32x32 on desktop
- Focus ring: `2px solid var(--emerald); outline-offset: 2px;`
- Never encode meaning in color alone
- All icon-only buttons need `aria-label`
- Inputs need visible labels
- Currency uses tabular figures globally
- Respect `prefers-reduced-motion`
- Ensure hover, focus, active, disabled, loading, empty, and error states are visually clear
- Mint and mint-wash are never body-text backgrounds

---

## Routing and interactions

Use React Router with client-side navigation.

Primary routes:

- `/`
- `/signup`
- `/transactions`
- `/transactions/:id`
- `/budget`
- `/reports`
- `/categories`
- `/wallet`
- `/goals`
- `/settings`
- `/about`
- `*`

Interaction requirements:

- Search, filter, and sort on the Transactions route
- One custom Hook for fetch or persistence
- `useReducer` or another justified shared-state pattern for runtime state
- Persist at least one useful user-facing preference with `localStorage`
- Keyboard shortcuts are optional polish, not a substitute for accessible visible controls

## Non-goals for v1

- No backend
- No real authentication backend unless explicitly added later
- No bank sync
- No dark mode requirement unless explicitly added later
