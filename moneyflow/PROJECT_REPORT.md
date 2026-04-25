# MoneyFlow Project Report

## Project Overview

MoneyFlow is a personal finance web application built to help users track income, expenses, budgets, savings, and financial trends in one place. The app includes authentication, profile creation, multi-currency money entry, reports, charts, smart insights, budget alerts, savings goals, recurring transactions, notifications, PDF export, and dark/light mode.

The main goal of the project is to make personal finance easier to understand by showing both raw transaction history and visual summaries of where money comes from and where it goes.

## Technology Stack

- React 18: frontend UI framework
- Vite: development server and build tool
- React Router: page navigation
- CSS Modules: page/component styling
- Bootstrap 5: responsive utility and component styling support
- Chart.js and react-chartjs-2: charts and reports
- localStorage: browser-based data persistence
- Browser Notification API: optional notifications
- Browser print API: PDF export through print/save as PDF

## Main Features Included

### 1. Authentication and Profile

The app has a signup and login flow before users enter the website. During signup, users enter their name, email, and password. The profile name and initials are used across the app, including the dashboard greeting and profile avatar.

This authentication is local/demo authentication using browser localStorage. It is not connected to a backend server.

### 2. Dashboard

The dashboard shows:

- Monthly income
- Total expenses
- Savings rate
- Number of transactions
- Total balance
- Recent transactions
- Smart insights
- Budget alerts
- Savings goal progress

Dashboard cards are clickable and take the user to filtered transaction views such as income, expenses, or savings.

### 3. Income Management

The Income page allows users to add income entries with amount, currency, source, date, and optional note. Income entries appear as summary cards and history records. The app uses this income data to update dashboard totals, savings rate, reports, and charts dynamically.

### 4. Expense Transactions

Users can add expenses with amount, currency, category, date, and optional note. Expenses can be filtered by category and deleted. The transaction page also supports filtered views for expenses, income, and savings.

### 5. Multi-Currency Support

Users can enter income and expenses in multiple currencies:

- USD
- EUR
- GBP
- CAD
- AUD
- INR
- NPR
- JPY

The app stores the original currency and amount, then converts each value to USD for dashboard totals, budgets, reports, charts, savings, and alerts.

### 6. Budgeting

The Budget page lets users set monthly spending limits for each category. Users can set, edit, cancel, and clear budgets. Progress bars and over-budget warnings update automatically.

Budget alerts are generated when spending reaches 80% or more of a category budget.

### 7. Smart Insights

The dashboard generates simple finance insights from live app data, such as low savings rate warnings, largest spending category, active budget alerts, and active recurring transactions.

### 8. Recurring Transactions

In Settings, users can create recurring income or expense rules. A recurring rule includes type, name, amount, currency, category for expenses, and next run date.

When the app opens and a recurring transaction is due, MoneyFlow automatically posts it and moves the next run date forward by one month.

### 9. Savings Goals

Users can create savings goals with a goal name, target amount, and saved amount. The app shows progress bars and percentage completion. Savings goals also appear on the dashboard.

### 10. Reports and Charts

The View Reports page includes dynamic charts based on real user data:

- Donut chart: expense breakdown by category
- Pie chart: expenses vs savings
- Bar chart: income, expenses, and savings by month
- Line chart: spending and savings trends
- Sankey-style flow chart: income flowing into expenses and savings

The Sankey-style chart is built with custom SVG. The other charts use Chart.js.

### 11. PDF and CSV Export

The app supports CSV export for expense data and PDF export through the browser print/save-as-PDF workflow. The PDF report includes income, expenses, balance, savings rate, budget alerts, and savings goals.

### 12. Notifications

Users can enable browser notifications from Settings. Notifications are used for important finance updates such as budget alerts or completed savings goals.

### 13. Dark and Light Mode

The app supports both dark mode and light mode. The selected theme is saved in localStorage and applied across the entire app.

## What APIs Are Used?

This project does not use any external web API.

No third-party finance API, banking API, currency exchange API, or backend API is connected.

The app uses browser APIs and frontend library APIs only.

### Browser APIs

- localStorage API: stores profile, login state, transactions, budgets, income, goals, recurring rules, theme, and notification settings
- Notification API: shows browser notifications after user permission
- Window/Print API: opens a printable report that can be saved as PDF

### Library APIs

- React API: state, effects, components, and rendering
- React Router API: navigation and routes
- Chart.js API: charts for reports
- react-chartjs-2 API: React wrapper for Chart.js charts

### Currency Conversion Note

Currency conversion currently uses built-in demo exchange rates inside the app code. It does not call a live exchange-rate API. In a production version, this could be upgraded to use a real exchange-rate API.

## Data Storage

All data is stored locally in the user's browser through localStorage. This means data remains after refresh, but it stays on the same browser/device and is not synced online.

Important localStorage keys include:

- mf_profile
- mf_is_logged_in
- mf_expenses
- mf_income_entries
- mf_budgets
- mf_recurring
- mf_savings_goals
- mf_theme
- mf_notifications_enabled

## Page Structure

- Login page: signup and login
- Dashboard: main overview and smart insights
- Transactions: expense, income, and savings history
- Income: add income and view income history
- Budget: category budget management
- Reports: charts and visual analytics
- Settings: exports, theme, notifications, recurring transactions, savings goals, logout
- Profile: user profile and account summary

## Strengths of the Project

- Clean React component structure
- Dynamic dashboard updates
- Local persistence without backend setup
- Multi-currency entry support
- Multiple chart types
- Smart insights and budget alerts
- Responsive UI design
- Dark/light mode support
- Practical personal finance workflow

## Limitations

- Authentication is local only and not secure like real server authentication
- Currency conversion uses fixed demo rates, not live exchange rates
- Data is stored only in the browser and not synced across devices
- PDF export uses the browser print dialog instead of a dedicated PDF library

## Future Improvements

- Real backend authentication
- Cloud database storage
- Live exchange-rate API
- Bank account API integration
- Password reset
- More advanced recurring schedules
- Editable profile details
- More detailed financial forecasting
- Mobile hamburger navigation

## Conclusion

MoneyFlow is a feature-rich personal finance dashboard that tracks income, expenses, budgets, savings goals, and reports. It uses React, localStorage, Chart.js, and browser APIs to create a dynamic finance tracking experience without requiring a backend server. The app is suitable as a strong frontend project and can be expanded later with real APIs, cloud storage, and production authentication.
