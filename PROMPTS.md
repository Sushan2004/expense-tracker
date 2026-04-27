# Prompts for Claude Code

Save `DESIGN.md` in the project root alongside this file. Reference it by name in every substantial Claude Code request so the design system and build requirements stay aligned.

---

## 1. Kickoff prompt (run first)

Copy this into Claude Code as the first message:

```md
Read DESIGN.md carefully first. It is the source of truth for the visual system, interaction patterns, accessibility rules, routes, and minimum build requirements. Follow it closely and list any deviations at the end.

I am rebuilding Express Tracker from scratch as a frontend-only prototype and it must satisfy the React SPA requirements in DESIGN.md.

Stack
- Vite + React 18+
- Functional components only with Hooks
- `react-router-dom` for client-side routing
- JavaScript + JSX with PropTypes
- Plain CSS or CSS modules only; no Tailwind, no UI kit, no component framework
- Inter from Google Fonts (weights 400 and 500)

Architecture
- Use `public/data/seed.json` as the data source and load it with `fetch`
- Show app-level loading and error states while data is being fetched
- Keep fetched seed data immutable; clone it into runtime app state after load
- Use `useReducer` for shared app state
- Use at least one custom Hook: `useLocalStorage` for persisted UI state
- Use `useMemo` anywhere filtered/sorted transaction lists are derived
- All forms must be controlled components

Routes
- `/` -> Dashboard
- `/signup` -> Signup
- `/transactions` -> Transactions list
- `/transactions/:id` -> Transaction detail
- `/budget`
- `/reports`
- `/categories`
- `/wallet`
- `/goals`
- `/settings`
- `/about`
- `*` -> 404 Not Found

Project structure
- `public/data/seed.json`
- `src/main.jsx`
- `src/App.jsx`
- `src/router.jsx` or route setup inside `App.jsx`
- `src/pages/*`
- `src/components/*`
- `src/hooks/useFetch.js` or `src/hooks/useSeedData.js`
- `src/hooks/useLocalStorage.js`
- `src/state/AppState.jsx` or equivalent reducer-based store
- `src/styles/*` or `src/styles.css`

Seed data requirements
- `user`: `{ name, email, initial }`
- `accounts`: 3 entries (Main Checking, Savings, Credit) with `{ id, name, type, balance }`
- `categories`: 8 entries - Food, Transport, Shopping, Home, Subscriptions, Entertainment, Health, Other - each with `{ id, name, iconSvg, colorVar }`
- `transactions`: 30 realistic entries spanning the last 45 days; varied merchants, categories, and accounts; about 4 recurring; include 2 income entries (salary on the 1st, side gig mid-month)
- `budgets`: one entry per category for the current month with reasonable amounts
- `goals`: 3 savings goals with `{ id, name, target, current, dueDate }`

Build these routes fully in the first pass
- Dashboard (`/`)
- Signup (`/signup`)
- Transactions list (`/transactions`) with search, filter, and sort
- Transaction detail (`/transactions/:id`)
- About (`/about`)
- 404 Not Found (`*`)

For the remaining routes, create polished placeholders that still use the layout shell and route correctly.

Dashboard requirements
- Match DESIGN.md screen 1 exactly
- Greeting + date + avatar
- BalanceCard with total balance, this month's income, this month's spending, savings rate
- Budget strip with "$spent / $total"
- Recent transactions using the last 5 items
- Spending-by-category using the top 4 categories for the current month
- Desktop layout: 2-column grid (1.55fr / 1fr)

Transactions requirements
- Search input
- Filter controls for type, category, account, date range, and sort
- Derived list uses `useMemo`
- Group rows by day with a day total
- Empty state, loading state, and error state
- Clicking a row navigates to `/transactions/:id`

Detail requirements
- Show icon, merchant, date, amount, category, account, type, recurring state, and note
- Include Edit, Duplicate, and Delete buttons as presentational actions even if the edit flow is deferred
- If an id is missing, route to the 404 page or show a not-found detail state

Controlled form + persistence requirements
- Implement the Add Expense / Income flow as a controlled form route or sheet entry point
- Implement the Signup page as a controlled form with name, email, password, confirm password, validation, and a clear success state
- Persist at least one real user preference with `localStorage`, such as last-used entry type, recent filters, or default account
- Use the custom `useLocalStorage` hook for that persistence

Acceptance
- Runs with `npm install` and `npm run dev`
- Uses React 18+ with functional components only
- Uses `react-router-dom` with the required routes and a 404 route
- Includes a polished Signup route at `/signup`
- Fetches seed data from `public/data/seed.json`
- Shows loading and error states during fetch
- Includes search/filter/sort on the Transactions route
- Includes a detail route for a single transaction
- Uses `useState`, `useEffect`, `useReducer`, one custom Hook, and `useMemo` appropriately
- Includes at least one controlled form
- Persists at least one user-facing setting with `localStorage`
- Responsive on mobile and desktop
- Keyboard accessible with semantic HTML, labels, focus states, and meaningful empty/error states
- Modular components with meaningful props and PropTypes
- All colors come from CSS variables defined from DESIGN.md
- No console errors

When finished, run a quick visual and functional check against DESIGN.md and list any deviations or tradeoffs you made.
```

---

## 2. Screen prompt template

Use this format for each subsequent screen. Replace `{SCREEN}` with the route/page name.

```md
Build the `{SCREEN}` route per DESIGN.md. Follow the components, tokens, accessibility rules, and state conventions exactly.

Implementation notes
- Read from fetched app state; do not hardcode screen content in components
- Shared state changes must go through reducer actions
- Use controlled inputs for any form or filter UI
- Persist user-facing preferences with `useLocalStorage` when relevant
- Add any new component styles in the shared stylesheet structure without breaking existing routes
- Reuse existing layout shell, navigation, and shared components

Acceptance
- Matches the DESIGN.md spec visually and behaviorally
- Works on mobile, tablet, and desktop breakpoints
- Keeps hover, focus, active, loading, empty, and error states clear
- Passes keyboard navigation
- No regressions on existing routes
```

---

## 3. Specific prompts worth calling out

### Add Expense / Income

```md
Build the Add Expense / Income flow per DESIGN.md. This is the most-used flow in the app, so optimize for speed and clarity.

Requirements
- Controlled form built with React state
- Expense / Income segmented control
- Big amount display
- Numeric keypad with calculator behavior: 0-9, decimal, backspace, +, -, multiply, divide, =
- Show 8 category tiles in the default picker state; handle overflow with a "More" action only if needed
- Account picker
- Note input
- Date input defaulting to today
- Recurring toggle
- Save button disabled until the form is valid

Persistence
- Default entry type should restore from `localStorage` using `useLocalStorage`

After save
- Update reducer state
- Navigate to the most sensible previous view
- Show a toast confirmation
```

### Signup page

```md
Build the Signup route per DESIGN.md as a polished auth-style entry page for the prototype.

Requirements
- Controlled form built with React state
- Fields: full name, email, password, confirm password
- Labels, helper text, inline validation, disabled submit state, and loading state
- Link to continue into the app or to a future sign-in flow
- Mobile-first layout that still feels premium on desktop
- Keep the page visually aligned with the mint-green Express Tracker identity

Behavior
- No real backend auth is required for v1
- On successful submit, show a clear success state and route the user to the most sensible next page
- Persist lightweight onboarding preferences only if it improves the prototype
```

### Transactions list polish

```md
Upgrade the Transactions route per DESIGN.md so it fully satisfies the coursework requirements.

Key requirements
- Search input with clear label
- Filter controls for type, category, account, and date range
- Sort control with at least newest, oldest, highest amount, lowest amount
- Derived list uses `useMemo`
- Empty state, loading state, and error state all look intentional
- Desktop >= 1280px: show list + detail panel if it improves the UX without breaking the dedicated detail route
- Mobile interactions stay simple and accessible
```

### Sankey chart (Reports > Flow)

```md
Build the Sankey Flow view on the Reports route per DESIGN.md.

Key requirements
- Custom SVG, no chart library
- Three columns: income sources -> income pool -> destinations (categories + savings)
- Savings = total income - total spending and uses `--emerald-dark`
- Right-side categories sort by amount descending
- Collapse categories under 4% into "Other"
- Tooltip on hover/focus with exact amount and percent
- Clicking a flow or node should navigate through `react-router-dom` to a filtered Transactions view
- Mobile variant rotates to vertical flow instead of horizontal scroll
```

### Polish pass (run last)

```md
Do a polish pass across the whole app. Do not redesign layouts; refine quality and consistency only.

Checklist
- Empty states for Transactions, Budgets, Goals, and search results
- Skeleton loaders with mint-wash base and sage shimmer
- `prefers-reduced-motion` handling for transitions and shimmer
- Focus rings on every interactive element
- `aria-label` on icon-only buttons
- Helpful validation and error copy for forms
- Keyboard shortcut support only where it adds real value and does not harm accessibility
- Run a final QA pass for responsiveness, route handling, loading/error states, and localStorage persistence

Leave a `PASS.md` in the root with unresolved issues or intentional tradeoffs.
```

---

## 4. Working with Claude Code effectively

- **Reference `DESIGN.md` by name.** If Claude drifts, point it to the exact DESIGN.md section.
- **Start from the React scaffold, not a static HTML prototype.** The old vanilla path will fight the assignment requirements.
- **Finish the minimum assignment routes early.** `/`, `/transactions`, `/transactions/:id`, `/about`, and `*` should work before deeper polish.
- **Build Signup early if you want a stronger first impression.** It is also an easy place to demonstrate a controlled form cleanly.
- **Serve with Vite.** Use `npm install` and `npm run dev`.
- **One route or flow per session.** This keeps Claude focused and makes regressions easier to catch.
- **Commit after each meaningful milestone.** Example: `git commit -m "feat: transactions route"`.
- **Keep seed data realistic.** Bad fake data makes even good UI look broken.
- **When the feature set changes, update DESIGN.md first.** Then prompt Claude.
