# Expense Tracker

A personal finance web app built with React and Vite. Track income and expenses, set category budgets, and view spending reports — all saved locally in the browser.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Pages](#pages)
- [Data Model](#data-model)
- [Expense Categories & Income Sources](#expense-categories--income-sources)
- [Architecture Notes](#architecture-notes)

---

## Features

- Add and delete income/expense transactions
- Categorize expenses across 8 categories
- Set and update monthly budget limits per category with visual progress bars
- View a spending breakdown chart (CSS conic gradient) on the Dashboard
- View a bar chart of spending by category on the Report page
- Currency conversion via the ExchangeRate API on the Report page
- Search, filter, and sort transactions
- All data persisted in `localStorage` — survives page refresh

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| React Router DOM v7 | Client-side routing |
| Chart.js + react-chartjs-2 | Bar chart on Report page |
| Vite | Dev server and build tool |
| PropTypes | Runtime prop validation |
| localStorage | Client-side data persistence |

---

## Project Structure

```
expense-tracker/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # App entry point, wraps with BrowserRouter
    ├── App.jsx               # Root component — state, routing, shared props
    ├── styles.css            # Global styles (glass-morphism theme)
    ├── components/
    │   └── Navbar.jsx        # Navigation bar with active-link highlighting
    ├── hooks/
    │   └── useLocalStorage.js  # Custom hook: useState + localStorage sync
    └── pages/
        ├── Dashboard.jsx     # Add transactions, balance summary, donut chart
        ├── Transactions.jsx  # List, search, filter, and delete transactions
        ├── Budget.jsx        # Budget limits per category with progress bars
        ├── Report.jsx        # Bar chart, totals, currency converter
        ├── About.jsx         # App description
        └── NotFound.jsx      # 404 fallback route
```

---

## Getting Started

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Pages

### Dashboard `/`

The main page. Lets you add a new transaction and see a financial overview.

- **Add Transaction form** — choose type (income/expense), enter a title and amount, select a category or income source, and submit.
- **Summary cards** — Total Income, Total Expenses, and Balance.
- **Spending breakdown chart** — a CSS conic-gradient circle showing the proportion of spending per category, with a colour-coded legend.

### Transactions `/transactions`

A searchable, filterable list of all recorded transactions.

- **Search** — filter by title (case-insensitive).
- **Filter** — show all, expenses only, or income only.
- **Sort** — newest first, highest amount, or lowest amount.
- **Delete** — remove any transaction with the trash button.
- Displays a count of shown vs. total transactions and a helpful empty state when no results match.

### Budget `/budget`

Manage monthly spending limits per expense category.

- Shows each category with: amount spent, budget limit, a colour-coded progress bar, and an over-budget warning when the limit is exceeded.
- Click **Edit** on any category to enter a new limit inline, then **Save** or **Cancel**.

### Report `/report`

An at-a-glance financial summary.

- **Summary cards** — total income and total expenses.
- **Bar chart** — spending by category (Chart.js), colour-matched to category colours.
- **Currency converter** — live exchange rates fetched from `https://api.exchangerate-api.com/v4/latest/USD`; select a target currency to see your total expenses converted.

### About `/about`

A brief description of the app and how data is stored.

---

## Data Model

### Transaction object

```js
{
  id: string,        // crypto.randomUUID()
  title: string,     // user-entered label
  amount: number,    // positive number
  type: "expense" | "income",
  category: string | null,  // set when type === "expense"
  source: string | null,    // set when type === "income"
  date: string       // toLocaleDateString() at time of entry
}
```

Transactions are stored as a JSON array under the `"transactions"` key in `localStorage`.

### Budget object

```js
{
  Food: number,
  Saving: number,
  Investing: number,
  Subscription: number,
  Rent: number,
  Transport: number,
  Bills: number,
  Other: number
}
```

Stored under the `"budgets"` key in `localStorage`. Defaults are applied on first load.

---

## Expense Categories & Income Sources

**Expense categories:** Food, Saving, Investing, Subscription, Rent, Transport, Bills, Other

**Income sources:** Salary, Freelance, Scholarship, Family, Part-time, Other

---

## Architecture Notes

- **State lives in `App.jsx`** — `items` (transactions) and `budgets` are stored at the top level using the `useLocalStorage` custom hook and passed down as props (`sharedProps`) to every page via React Router's route elements. This avoids prop-drilling through intermediate components and keeps a single source of truth.
- **`useLocalStorage` hook** — wraps `useState` so that every state update is mirrored to `localStorage` automatically.
- **`useCallback`** — `addItem`, `deleteItem`, and `updateBudget` are wrapped in `useCallback` to avoid unnecessary re-renders when passed as props.
- **`useMemo`** — derived values (totals, filtered lists, chart data) are memoized in each page component so they only recompute when their dependencies change.
- **Routing** — React Router DOM v7 (`BrowserRouter` in `main.jsx`, `Routes`/`Route` in `App.jsx`). The `NotFound` page is rendered by a wildcard `*` route.

