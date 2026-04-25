import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

// App-wide spending categories. Each category carries its own display colors.
const CATEGORIES = [
  { name: 'Food',          color: '#f59e0b', bg: '#2d1f00', text: '#f59e0b' },
  { name: 'Transport',     color: '#3b82f6', bg: '#0d1f3c', text: '#60a5fa' },
  { name: 'Housing',       color: '#8b5cf6', bg: '#1e1040', text: '#a78bfa' },
  { name: 'Health',        color: '#10b981', bg: '#052e1c', text: '#34d399' },
  { name: 'Shopping',      color: '#ec4899', bg: '#2d0a1e', text: '#f472b6' },
  { name: 'Entertainment', color: '#f97316', bg: '#2d1200', text: '#fb923c' },
  { name: 'Other',         color: '#6b7280', bg: '#1c2128', text: '#9ca3af' },
]

const USER = { name: 'Sushan', email: '', initials: 'SU' }

// Built-in demo exchange rates convert every entry into USD for totals.
// A production app would fetch live rates from a trusted exchange-rate API.
const BASE_CURRENCY = 'USD'
const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$', rateToUsd: 1 },
  { code: 'EUR', label: 'Euro', symbol: '€', rateToUsd: 1.08 },
  { code: 'GBP', label: 'British Pound', symbol: '£', rateToUsd: 1.25 },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'C$', rateToUsd: 0.73 },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$', rateToUsd: 0.66 },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹', rateToUsd: 0.012 },
  { code: 'NPR', label: 'Nepalese Rupee', symbol: 'रू', rateToUsd: 0.0075 },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥', rateToUsd: 0.0067 },
]

const currencyFor = (code = BASE_CURRENCY) => CURRENCIES.find(currency => currency.code === code) || CURRENCIES[0]
const convertToBase = (amount, currencyCode = BASE_CURRENCY) => Number(amount || 0) * currencyFor(currencyCode).rateToUsd
const baseAmountOf = (entry) => Number(entry.baseAmount ?? entry.amount ?? 0)
const formatOriginalMoney = (entry) => {
  const currency = currencyFor(entry.currency)
  return `${currency.symbol}${Number(entry.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency.code}`
}

const initialsFor = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'SU'
  return parts.slice(0, 2).map(part => part[0].toUpperCase()).join('')
}

// All persistence keys live here so localStorage names stay consistent.
const LS = {
  expenses: 'mf_expenses',
  budgets:  'mf_budgets',
  income:   'mf_income',
  incomeEntries: 'mf_income_entries',
  recurring: 'mf_recurring',
  savingsGoals: 'mf_savings_goals',
  notifications: 'mf_notifications_enabled',
}

// Safely read localStorage. If saved data is broken or missing, use the default value.
const load = (key, def) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def } catch { return def }
}

// Date helpers use local time so forms and monthly summaries match the user's calendar day.
const pad = (n) => String(n).padStart(2, '0')
const localDateParts = (date = new Date()) => {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  return { year, month, day }
}

const currentMonth = () => {
  const { year, month } = localDateParts()
  return `${year}-${month}`
}
const today = () => {
  const { year, month, day } = localDateParts()
  return `${year}-${month}-${day}`
}

const addMonths = (dateText, count = 1) => {
  const [year, month, day] = dateText.split('-').map(Number)
  const date = new Date(year, month - 1 + count, day)
  const parts = localDateParts(date)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function AppProvider({ children, profile, theme, toggleTheme }) {
  // Core finance state. Each list is saved back to localStorage below.
  const [expenses, setExpenses] = useState(() => load(LS.expenses, []))
  const [budgets,  setBudgets]  = useState(() => load(LS.budgets, {}))
  const [income,   setIncome]   = useState(() => load(LS.income, { amount: 6500, label: 'Salary + freelance' }))
  const [incomeEntries, setIncomeEntries] = useState(() => load(LS.incomeEntries, []))
  const [recurring, setRecurring] = useState(() => load(LS.recurring, []))
  const [savingsGoals, setSavingsGoals] = useState(() => load(LS.savingsGoals, []))
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => load(LS.notifications, false))
  const user = profile
    ? { ...USER, ...profile, initials: profile.initials || initialsFor(profile.name) }
    : USER

  // Keep browser storage synchronized whenever the user changes finance data.
  useEffect(() => localStorage.setItem(LS.expenses, JSON.stringify(expenses)), [expenses])
  useEffect(() => localStorage.setItem(LS.budgets,  JSON.stringify(budgets)),  [budgets])
  useEffect(() => localStorage.setItem(LS.income,   JSON.stringify(income)),   [income])
  useEffect(() => localStorage.setItem(LS.incomeEntries, JSON.stringify(incomeEntries)), [incomeEntries])
  useEffect(() => localStorage.setItem(LS.recurring, JSON.stringify(recurring)), [recurring])
  useEffect(() => localStorage.setItem(LS.savingsGoals, JSON.stringify(savingsGoals)), [savingsGoals])
  useEffect(() => localStorage.setItem(LS.notifications, JSON.stringify(notificationsEnabled)), [notificationsEnabled])

  // Small action helpers keep page components from editing arrays directly.
  const addExpense    = (exp) => setExpenses(prev => [{
    ...exp,
    amount: Number(exp.amount),
    currency: exp.currency || BASE_CURRENCY,
    baseAmount: convertToBase(exp.amount, exp.currency),
    id: Date.now(),
  }, ...prev])
  const deleteExpense = (id)  => setExpenses(prev => prev.filter(e => e.id !== id))
  const addIncomeEntry = (entry) => setIncomeEntries(prev => [{
    ...entry,
    amount: Number(entry.amount),
    currency: entry.currency || BASE_CURRENCY,
    baseAmount: convertToBase(entry.amount, entry.currency),
    id: Date.now(),
  }, ...prev])
  const deleteIncomeEntry = (id) => setIncomeEntries(prev => prev.filter(entry => entry.id !== id))
  const addRecurring = (rule) => setRecurring(prev => [{
    ...rule,
    amount: Number(rule.amount),
    currency: rule.currency || BASE_CURRENCY,
    id: Date.now(),
    nextRun: rule.nextRun || today(),
  }, ...prev])
  const deleteRecurring = (id) => setRecurring(prev => prev.filter(rule => rule.id !== id))
  const addSavingsGoal = (goal) => setSavingsGoals(prev => [{ ...goal, id: Date.now(), saved: Number(goal.saved || 0) }, ...prev])
  const deleteSavingsGoal = (id) => setSavingsGoals(prev => prev.filter(goal => goal.id !== id))
  const updateSavingsGoal = (id, amount) => setSavingsGoals(prev => prev.map(goal => (
    goal.id === id ? { ...goal, saved: Math.max(0, Number(amount || 0)) } : goal
  )))

  // When the app opens, post any recurring items that are due and move them to next month.
  useEffect(() => {
    const due = recurring.filter(rule => rule.nextRun && rule.nextRun <= today())
    if (due.length === 0) return

    due.forEach(rule => {
      if (rule.type === 'income') {
        setIncomeEntries(prev => [{
          id: Date.now() + Math.random(),
          amount: Number(rule.amount),
          currency: rule.currency || BASE_CURRENCY,
          baseAmount: convertToBase(rule.amount, rule.currency),
          source: rule.label || 'Recurring income',
          date: rule.nextRun,
          note: 'Recurring',
        }, ...prev])
      } else {
        setExpenses(prev => [{
          id: Date.now() + Math.random(),
          amount: Number(rule.amount),
          currency: rule.currency || BASE_CURRENCY,
          baseAmount: convertToBase(rule.amount, rule.currency),
          category: rule.category || 'Other',
          date: rule.nextRun,
          note: rule.label || 'Recurring expense',
        }, ...prev])
      }
    })

    setRecurring(prev => prev.map(rule => (
      rule.nextRun && rule.nextRun <= today() ? { ...rule, nextRun: addMonths(rule.nextRun) } : rule
    )))
  }, [recurring])

  // Derived monthly numbers power the dashboard, reports, alerts, and profile stats.
  const thisMonth       = expenses.filter(ex => ex.date.startsWith(currentMonth()))
  const thisMonthIncome = incomeEntries.filter(entry => entry.date.startsWith(currentMonth()))
  const totalIncome     = thisMonthIncome.reduce((s, entry) => s + baseAmountOf(entry), 0)
  const activeIncome    = incomeEntries.length > 0
    ? { amount: totalIncome, label: `${thisMonthIncome.length} income entr${thisMonthIncome.length === 1 ? 'y' : 'ies'} this month` }
    : income
  const totalExpenses   = thisMonth.reduce((s, ex) => s + baseAmountOf(ex), 0)
  const totalBudget     = Object.values(budgets).reduce((s, v) => s + parseFloat(v || 0), 0)
  const overBudget      = totalBudget > 0 ? totalExpenses - totalBudget : 0
  const savingsRate     = activeIncome.amount > 0 ? Math.round(((activeIncome.amount - totalExpenses) / activeIncome.amount) * 100) : 0
  const balance         = activeIncome.amount - totalExpenses
  const categoryTotals  = CATEGORIES.map(cat => ({
    name: cat.name,
    color: cat.color,
    spent: thisMonth.filter(ex => ex.category === cat.name).reduce((sum, ex) => sum + baseAmountOf(ex), 0),
    budget: parseFloat(budgets[cat.name] || 0),
  }))
  // Budget alerts start at 80% usage and become over-budget alerts after 100%.
  const budgetAlerts = categoryTotals
    .filter(item => item.budget > 0 && item.spent >= item.budget * 0.8)
    .map(item => ({
      ...item,
      percent: Math.round((item.spent / item.budget) * 100),
      status: item.spent > item.budget ? 'over' : 'warning',
    }))
  const topCategory = [...categoryTotals].sort((a, b) => b.spent - a.spent)[0]
  // Human-readable insights are generated from the current month, not hard-coded text.
  const smartInsights = [
    activeIncome.amount > 0 && savingsRate < 20 ? 'Savings rate is below 20%. Try reducing flexible spending this month.' : null,
    activeIncome.amount > 0 && savingsRate >= 30 ? 'Great savings rate. You are above the 30% goal.' : null,
    topCategory && topCategory.spent > 0 ? `${topCategory.name} is your largest spending category this month.` : null,
    budgetAlerts.length > 0 ? `${budgetAlerts.length} budget alert${budgetAlerts.length === 1 ? '' : 's'} need attention.` : null,
    recurring.length > 0 ? `${recurring.length} recurring transaction${recurring.length === 1 ? '' : 's'} active.` : null,
  ].filter(Boolean)

  // Count recent activity for the dashboard transaction card.
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const thisWeekCount = expenses.filter(ex => new Date(ex.date) >= weekAgo).length

  return (
    <AppContext.Provider value={{
      user, theme, toggleTheme,
      CATEGORIES, CURRENCIES, BASE_CURRENCY, convertToBase, baseAmountOf, formatOriginalMoney,

      expenses, addExpense, deleteExpense,
      budgets, setBudgets,
      income: activeIncome, setIncome,
      incomeEntries, addIncomeEntry, deleteIncomeEntry, thisMonthIncome, totalIncome,
      recurring, addRecurring, deleteRecurring,
      savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
      notificationsEnabled, setNotificationsEnabled,
      categoryTotals, budgetAlerts, smartInsights,
      thisMonth, totalExpenses, totalBudget, overBudget,
      savingsRate, balance, thisWeekCount,
      today, currentMonth,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
