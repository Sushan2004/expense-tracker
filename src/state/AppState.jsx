import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import {
  DEFAULT_CATEGORIES,
} from '../data/defaultCategories.js';
import {
  DEFAULT_CATEGORY_COLOR,
  DEFAULT_CATEGORY_ICON,
  normalizeCategoryColor,
  normalizeCategoryIcon,
  resolveCategoryColor,
} from '../utils/categoryAppearance.js';
import { uniqueId } from '../utils/selectors.js';
import { todayIso } from '../utils/format.js';

export const APP_STATE_STORAGE_KEY = 'et:app-state';

const AppStateContext = createContext(null);
const defaultCategoryIds = new Set(DEFAULT_CATEGORIES.map((category) => category.id));

const INCOME_FREQUENCIES = new Set(['one-time', 'weekly', 'biweekly', 'monthly', 'yearly']);

function cloneDefaultCategories() {
  return DEFAULT_CATEGORIES.map((category) => ({ ...category }));
}

function cloneList(value) {
  return Array.isArray(value) ? structuredClone(value) : [];
}

function normalizeCategory(category, builtin = false) {
  if (!category?.id || !category?.name) return null;

  return {
    id: category.id,
    name: category.name,
    icon: normalizeCategoryIcon(category.icon || DEFAULT_CATEGORY_ICON),
    colorVar: resolveCategoryColor(category.colorVar || DEFAULT_CATEGORY_COLOR),
    builtin: category.builtin ?? builtin,
  };
}

function mergeCategories(value) {
  const merged = cloneDefaultCategories();

  if (!Array.isArray(value)) return merged;

  value.forEach((category) => {
    if (!category || defaultCategoryIds.has(category.id)) return;
    const normalized = normalizeCategory(category, false);
    if (!normalized) return;
    merged.push(normalized);
  });

  return merged;
}

function normalizeTransaction(transaction) {
  if (!transaction?.id || !transaction?.categoryId || !transaction?.date) return null;

  return {
    ...structuredClone(transaction),
    accountId: transaction.accountId || null,
    recurring: Boolean(transaction.recurring),
  };
}

function normalizeTransactions(value) {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeTransaction).filter(Boolean);
}

function clampPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

function normalizeSplitConfig(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => entry && entry.goalId)
    .map((entry) => ({
      goalId: String(entry.goalId),
      percent: clampPercent(entry.percent),
    }))
    .filter((entry) => entry.percent > 0);
}

function normalizeIncomeSource(source) {
  if (!source?.id || !source?.name) return null;
  return {
    id: source.id,
    name: String(source.name).trim(),
    color: normalizeCategoryColor(source.color || source.colorVar || DEFAULT_CATEGORY_COLOR),
    createdAt: source.createdAt || todayIso(),
  };
}

function normalizeIncomeSources(value) {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeIncomeSource).filter(Boolean);
}

function normalizeIncomeEntry(entry) {
  if (!entry?.id) return null;
  const amount = Number(entry.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const frequency = INCOME_FREQUENCIES.has(entry.frequency) ? entry.frequency : 'one-time';

  return {
    id: entry.id,
    sourceId: entry.sourceId || null,
    amount,
    frequency,
    note: entry.note ? String(entry.note) : '',
    savePercent: clampPercent(entry.savePercent),
    splitConfig: normalizeSplitConfig(entry.splitConfig),
    date: entry.date || todayIso(),
    transactionId: entry.transactionId || null,
    createdAt: entry.createdAt || todayIso(),
  };
}

function normalizeIncomeEntries(value) {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeIncomeEntry).filter(Boolean);
}

// Migrates older "incomeSources had amount" records into the split shape
// (sources = labels only, entries = actual income events). Idempotent.
function migrateIncomeData(payload) {
  const rawSources = Array.isArray(payload?.incomeSources) ? payload.incomeSources : [];
  const rawEntries = Array.isArray(payload?.incomeEntries) ? payload.incomeEntries : null;

  // Already split (entries field present): trust the new shape.
  if (rawEntries) {
    return {
      sources: normalizeIncomeSources(rawSources),
      entries: normalizeIncomeEntries(rawEntries),
    };
  }

  // Legacy: each item in incomeSources had amount/frequency/etc. Fan out.
  const legacy = rawSources.filter((item) => Number(item?.amount) > 0);
  if (legacy.length === 0) {
    return {
      sources: normalizeIncomeSources(rawSources),
      entries: [],
    };
  }

  const sourceByName = new Map();
  const entries = [];

  for (const item of legacy) {
    const name = String(item.name || '').trim();
    if (!name) continue;
    const key = name.toLowerCase();

    let source = sourceByName.get(key);
    if (!source) {
      source = {
        id: `isrc-${key.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'src'}-${Math.random().toString(36).slice(2, 6)}`,
        name,
        color: normalizeCategoryColor(item.color || item.colorVar || DEFAULT_CATEGORY_COLOR),
        createdAt: item.createdAt || todayIso(),
      };
      sourceByName.set(key, source);
    }

    entries.push(normalizeIncomeEntry({
      id: item.id,
      sourceId: source.id,
      amount: item.amount,
      frequency: item.frequency,
      note: item.note,
      savePercent: item.savePercent,
      splitConfig: item.splitConfig,
      date: item.date || item.createdAt,
      transactionId: item.transactionId,
      createdAt: item.createdAt,
    }));
  }

  return {
    sources: Array.from(sourceByName.values()),
    entries: entries.filter(Boolean),
  };
}

function normalizeGoal(goal) {
  if (!goal?.id || !goal?.name) return null;
  const target = Number(goal.target);
  if (!Number.isFinite(target) || target <= 0) return null;

  const current = Math.max(0, Number(goal.current) || 0);
  const deadline = goal.deadline || goal.dueDate || null;

  return {
    id: goal.id,
    name: String(goal.name).trim(),
    target,
    current,
    deadline,
    color: normalizeCategoryColor(goal.color || goal.colorVar || DEFAULT_CATEGORY_COLOR),
    createdAt: goal.createdAt || todayIso(),
  };
}

function normalizeGoals(value) {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeGoal).filter(Boolean);
}

function normalizeState(payload) {
  const source = payload || {};

  return {
    user: source.user ? structuredClone(source.user) : null,
    accounts: cloneList(source.accounts),
    categories: mergeCategories(source.categories),
    transactions: normalizeTransactions(source.transactions),
    budgets: cloneList(source.budgets),
    goals: normalizeGoals(source.goals),
    incomeSources: normalizeIncomeSources(source.incomeSources),
  };
}

function readStoredAppState() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getPersistableState(state) {
  return {
    user: state.user ? structuredClone(state.user) : null,
    accounts: cloneList(state.accounts),
    categories: cloneList(state.categories),
    transactions: cloneList(state.transactions),
    budgets: cloneList(state.budgets),
    goals: cloneList(state.goals),
    incomeSources: cloneList(state.incomeSources),
  };
}

export function clearStoredAppState() {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(APP_STATE_STORAGE_KEY);
  } catch {
    /* ignore storage failures */
  }
}

function createBootstrapState() {
  const stored = readStoredAppState();
  const next = normalizeState(stored);

  return {
    status: 'ready',
    error: null,
    ...next,
    toast: null,
  };
}

function distributeSavedAmount(goals, savedAmount, splitConfig) {
  if (savedAmount <= 0 || !goals.length) return goals;

  const allocations = new Map();

  if (Array.isArray(splitConfig) && splitConfig.length > 0) {
    splitConfig.forEach(({ goalId, percent }) => {
      if (!percent) return;
      const portion = (savedAmount * percent) / 100;
      allocations.set(goalId, (allocations.get(goalId) || 0) + portion);
    });
  } else {
    const share = savedAmount / goals.length;
    goals.forEach((goal) => allocations.set(goal.id, share));
  }

  return goals.map((goal) => {
    const add = allocations.get(goal.id);
    if (!add) return goal;
    return { ...goal, current: Math.max(0, goal.current + add) };
  });
}

function reverseSavedAmount(goals, savedAmount, splitConfig) {
  if (savedAmount <= 0 || !goals.length) return goals;

  const reversals = new Map();

  if (Array.isArray(splitConfig) && splitConfig.length > 0) {
    splitConfig.forEach(({ goalId, percent }) => {
      if (!percent) return;
      const portion = (savedAmount * percent) / 100;
      reversals.set(goalId, (reversals.get(goalId) || 0) + portion);
    });
  } else {
    const share = savedAmount / goals.length;
    goals.forEach((goal) => reversals.set(goal.id, share));
  }

  return goals.map((goal) => {
    const subtract = reversals.get(goal.id);
    if (!subtract) return goal;
    return { ...goal, current: Math.max(0, goal.current - subtract) };
  });
}

function reducer(state, action) {
  switch (action.type) {
    case 'load/success': {
      const next = normalizeState(action.payload);
      return {
        ...state,
        status: 'ready',
        error: null,
        ...next,
      };
    }
    case 'load/error':
      return { ...state, status: 'ready', error: action.payload };
    case 'tx/add':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'tx/update':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id
            ? { ...transaction, ...action.payload }
            : transaction
        ),
      };
    case 'tx/delete':
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload),
      };
    case 'category/add':
      return {
        ...state,
        categories: [...state.categories, normalizeCategory(action.payload, false)].filter(Boolean),
      };
    case 'budget/update': {
      const { categoryId, month, amount } = action.payload;
      const index = state.budgets.findIndex(
        (budget) => budget.categoryId === categoryId && budget.month === month
      );
      const nextBudgets = [...state.budgets];

      if (index >= 0) nextBudgets[index] = { ...nextBudgets[index], amount };
      else nextBudgets.push({ categoryId, month, amount });

      return { ...state, budgets: nextBudgets };
    }
    case 'incomeSource/add': {
      const normalized = normalizeIncomeSource(action.payload);
      if (!normalized) return state;

      const savedAmount = (normalized.amount * normalized.savePercent) / 100;
      const validSplit = normalized.splitConfig.filter((entry) =>
        state.goals.some((goal) => goal.id === entry.goalId)
      );

      const transactionId = normalized.transactionId || uniqueId('t');
      const transaction = {
        id: transactionId,
        merchant: normalized.name,
        categoryId: 'cat-other',
        accountId: null,
        amount: normalized.amount,
        date: todayIso(),
        note: normalized.note || `Income source · ${normalized.frequency}`,
        recurring: normalized.frequency !== 'one-time',
        type: 'income',
      };

      const sourceWithRefs = { ...normalized, transactionId, splitConfig: validSplit };

      const nextGoals = savedAmount > 0
        ? distributeSavedAmount(state.goals, savedAmount, validSplit)
        : state.goals;

      return {
        ...state,
        incomeSources: [sourceWithRefs, ...state.incomeSources],
        transactions: [transaction, ...state.transactions],
        goals: nextGoals,
      };
    }
    case 'incomeSource/delete': {
      const source = state.incomeSources.find((item) => item.id === action.payload);
      if (!source) return state;

      const savedAmount = (source.amount * source.savePercent) / 100;
      const nextGoals = savedAmount > 0
        ? reverseSavedAmount(state.goals, savedAmount, source.splitConfig)
        : state.goals;

      return {
        ...state,
        incomeSources: state.incomeSources.filter((item) => item.id !== source.id),
        transactions: source.transactionId
          ? state.transactions.filter((tx) => tx.id !== source.transactionId)
          : state.transactions,
        goals: nextGoals,
      };
    }
    case 'goal/add': {
      const normalized = normalizeGoal(action.payload);
      if (!normalized) return state;
      if (state.goals.some((goal) => goal.name.toLowerCase() === normalized.name.toLowerCase())) {
        return state;
      }
      return { ...state, goals: [...state.goals, normalized] };
    }
    case 'goal/update': {
      const { id, ...patch } = action.payload;
      return {
        ...state,
        goals: state.goals.map((goal) => {
          if (goal.id !== id) return goal;
          return normalizeGoal({ ...goal, ...patch }) || goal;
        }),
      };
    }
    case 'goal/delete':
      return {
        ...state,
        goals: state.goals.filter((goal) => goal.id !== action.payload),
      };
    case 'goal/transfer': {
      const { goalId, amount } = action.payload;
      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) return state;

      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? { ...goal, current: Math.max(0, goal.current + numericAmount) }
            : goal
        ),
      };
    }
    case 'toast/show':
      return { ...state, toast: action.payload };
    case 'toast/clear':
      return { ...state, toast: null };
    default:
      return state;
  }
}

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, createBootstrapState);

  useEffect(() => {
    if (state.status !== 'ready') return;

    try {
      window.localStorage.setItem(
        APP_STATE_STORAGE_KEY,
        JSON.stringify(getPersistableState(state))
      );
    } catch {
      /* ignore storage failures */
    }
  }, [state]);

  useEffect(() => {
    if (!state.toast) return undefined;
    const timeoutId = setTimeout(() => dispatch({ type: 'toast/clear' }), 2600);
    return () => clearTimeout(timeoutId);
  }, [state.toast]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

AppStateProvider.propTypes = {
  children: PropTypes.node,
};

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
}
