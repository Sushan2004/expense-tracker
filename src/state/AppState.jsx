import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useState } from 'react';
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
import { useSession } from './SessionState.jsx';
import { checkingBalance, uniqueId } from '../utils/selectors.js';
import { todayIso } from '../utils/format.js';

export const APP_STATE_STORAGE_KEY = 'et:app-state';
export const APP_STATE_STORAGE_PREFIX = 'et:app-state:';
const THEME_MODES = new Set(['light', 'dark', 'system']);

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

function normalizeThemeMode(value) {
  return THEME_MODES.has(value) ? value : 'system';
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

function normalizeBudgetAlertThreshold(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0.8;
  const ratio = numeric > 1 ? numeric / 100 : numeric;
  return Math.max(0, Math.min(1, ratio || 0.8));
}

function normalizeBudget(budget) {
  if (!budget?.categoryId) return null;

  const amount = Number(budget.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const periodType = ['weekly', 'monthly', 'yearly'].includes(budget.periodType)
    ? budget.periodType
    : 'monthly';
  const rawPeriodKey = budget.periodKey || budget.month || budget.year || budget.week;
  const periodKey = String(rawPeriodKey || '').slice(0, periodType === 'weekly' ? 10 : periodType === 'monthly' ? 7 : 4);

  if (
    (periodType === 'weekly' && !/^\d{4}-\d{2}-\d{2}$/.test(periodKey))
    || (periodType === 'monthly' && !/^\d{4}-\d{2}$/.test(periodKey))
    || (periodType === 'yearly' && !/^\d{4}$/.test(periodKey))
  ) {
    return null;
  }

  return {
    categoryId: String(budget.categoryId),
    periodType,
    periodKey,
    amount,
    alertThreshold: normalizeBudgetAlertThreshold(budget.alertThreshold),
  };
}

function normalizeBudgets(value) {
  if (!Array.isArray(value)) return [];

  const deduped = new Map();
  value.forEach((budget) => {
    const normalized = normalizeBudget(budget);
    if (!normalized) return;
    deduped.set(
      `${normalized.categoryId}:${normalized.periodType}:${normalized.periodKey}`,
      normalized
    );
  });

  return [...deduped.values()];
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

function normalizeSavingsTransfer(transfer) {
  if (!transfer?.id || !transfer?.goalId) return null;

  const amount = Number(transfer.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return {
    id: transfer.id,
    goalId: String(transfer.goalId),
    amount,
    date: transfer.date || todayIso(),
    note: transfer.note ? String(transfer.note) : '',
    kind: transfer.kind === 'income-save' ? 'income-save' : 'manual',
    createdAt: transfer.createdAt || transfer.date || todayIso(),
  };
}

function normalizeSavingsTransfers(value) {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeSavingsTransfer).filter(Boolean);
}

function normalizeState(payload) {
  const source = payload || {};
  const income = migrateIncomeData(source);

  return {
    user: source.user ? structuredClone(source.user) : null,
    themeMode: normalizeThemeMode(source.themeMode),
    accounts: cloneList(source.accounts),
    categories: mergeCategories(source.categories),
    transactions: normalizeTransactions(source.transactions),
    budgets: normalizeBudgets(source.budgets),
    goals: normalizeGoals(source.goals),
    incomeSources: income.sources,
    incomeEntries: income.entries,
    savingsTransfers: normalizeSavingsTransfers(source.savingsTransfers),
  };
}

function getUserAppStateStorageKey(userId) {
  return `${APP_STATE_STORAGE_PREFIX}${userId}`;
}

function readStoredAppState(userId) {
  if (typeof window === 'undefined') return null;

  try {
    if (!userId) return null;

    const userKey = getUserAppStateStorageKey(userId);
    const userRaw = window.localStorage.getItem(userKey);
    if (userRaw) return JSON.parse(userRaw);

    const legacyRaw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
    if (!legacyRaw) return null;

    const legacyState = JSON.parse(legacyRaw);
    window.localStorage.setItem(userKey, JSON.stringify(legacyState));
    window.localStorage.removeItem(APP_STATE_STORAGE_KEY);
    return legacyState;
  } catch {
    return null;
  }
}

function getPersistableState(state) {
  return {
    user: state.user ? structuredClone(state.user) : null,
    themeMode: normalizeThemeMode(state.themeMode),
    accounts: cloneList(state.accounts),
    categories: cloneList(state.categories),
    transactions: cloneList(state.transactions),
    budgets: cloneList(state.budgets),
    goals: cloneList(state.goals),
    incomeSources: cloneList(state.incomeSources),
    incomeEntries: cloneList(state.incomeEntries),
    savingsTransfers: cloneList(state.savingsTransfers),
  };
}

export function clearStoredAppState(userId) {
  if (typeof window === 'undefined') return;

  try {
    if (userId) {
      window.localStorage.removeItem(getUserAppStateStorageKey(userId));
      return;
    }

    window.localStorage.removeItem(APP_STATE_STORAGE_KEY);
  } catch {
    /* ignore storage failures */
  }
}

function loadStateForUser(currentUser) {
  if (!currentUser) {
    return normalizeState({ user: null });
  }

  const stored = readStoredAppState(currentUser.id);
  const next = normalizeState(stored);

  return {
    ...next,
    user: currentUser,
  };
}

function createBootstrapState(currentUser) {
  const next = loadStateForUser(currentUser);

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
    case 'theme/set':
      return { ...state, themeMode: normalizeThemeMode(action.payload) };
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
    case 'category/delete': {
      const categoryId = action.payload;
      if (!categoryId || defaultCategoryIds.has(categoryId)) return state;
      if (state.transactions.some((transaction) => transaction.categoryId === categoryId)) return state;
      if (state.budgets.some((budget) => budget.categoryId === categoryId)) return state;

      return {
        ...state,
        categories: state.categories.filter((category) => category.id !== categoryId),
      };
    }
    case 'budget/update': {
      const normalized = normalizeBudget(action.payload);
      if (!normalized) return state;

      const { categoryId, periodType, periodKey } = normalized;
      const index = state.budgets.findIndex(
        (budget) =>
          budget.categoryId === categoryId
          && budget.periodType === periodType
          && budget.periodKey === periodKey
      );
      const nextBudgets = [...state.budgets];

      if (index >= 0) nextBudgets[index] = normalized;
      else nextBudgets.push(normalized);

      return { ...state, budgets: nextBudgets };
    }
    case 'budget/delete': {
      const { categoryId, periodType, periodKey } = action.payload || {};
      if (!categoryId || !periodType || !periodKey) return state;

      return {
        ...state,
        budgets: state.budgets.filter(
          (budget) =>
            !(
              budget.categoryId === categoryId
              && budget.periodType === periodType
              && budget.periodKey === periodKey
            )
        ),
      };
    }
    case 'incomeSource/add': {
      const normalized = normalizeIncomeSource(action.payload);
      if (!normalized) return state;
      if (state.incomeSources.some((s) => s.name.toLowerCase() === normalized.name.toLowerCase())) {
        return state;
      }
      return { ...state, incomeSources: [...state.incomeSources, normalized] };
    }
    case 'incomeSource/update': {
      const current = state.incomeSources.find((source) => source.id === action.payload.id);
      if (!current) return state;

      const normalized = normalizeIncomeSource({ ...current, ...action.payload });
      if (!normalized) return state;

      if (
        state.incomeSources.some(
          (source) =>
            source.id !== normalized.id
            && source.name.toLowerCase() === normalized.name.toLowerCase()
        )
      ) {
        return state;
      }

      return {
        ...state,
        incomeSources: state.incomeSources.map((source) =>
          source.id === normalized.id ? normalized : source
        ),
        transactions: state.transactions.map((transaction) => {
          const relatedEntry = state.incomeEntries.find(
            (entry) => entry.transactionId === transaction.id && entry.sourceId === normalized.id
          );

          if (!relatedEntry) return transaction;
          return { ...transaction, merchant: normalized.name };
        }),
      };
    }
    case 'incomeSource/delete': {
      // Refuse if any entry still references this source.
      if (state.incomeEntries.some((entry) => entry.sourceId === action.payload)) return state;
      return {
        ...state,
        incomeSources: state.incomeSources.filter((source) => source.id !== action.payload),
      };
    }
    case 'incomeEntry/add': {
      const normalized = normalizeIncomeEntry(action.payload);
      if (!normalized) return state;

      const source = state.incomeSources.find((s) => s.id === normalized.sourceId);
      const merchantName = source?.name || 'Income';

      const savedAmount = (normalized.amount * normalized.savePercent) / 100;
      const validSplit = normalized.splitConfig.filter((entry) =>
        state.goals.some((goal) => goal.id === entry.goalId)
      );

      const transactionId = normalized.transactionId || uniqueId('t');
      const transaction = {
        id: transactionId,
        merchant: merchantName,
        categoryId: 'cat-income',
        accountId: null,
        amount: normalized.amount,
        date: normalized.date,
        note: normalized.note || `Income · ${normalized.frequency}`,
        recurring: normalized.frequency !== 'one-time',
        type: 'income',
      };

      const entryWithRefs = { ...normalized, transactionId, splitConfig: validSplit };

      const nextGoals = savedAmount > 0
        ? distributeSavedAmount(state.goals, savedAmount, validSplit)
        : state.goals;

      return {
        ...state,
        incomeEntries: [entryWithRefs, ...state.incomeEntries],
        transactions: [transaction, ...state.transactions],
        goals: nextGoals,
      };
    }
    case 'incomeEntry/delete': {
      const entry = state.incomeEntries.find((item) => item.id === action.payload);
      if (!entry) return state;

      const savedAmount = (entry.amount * entry.savePercent) / 100;
      const nextGoals = savedAmount > 0
        ? reverseSavedAmount(state.goals, savedAmount, entry.splitConfig)
        : state.goals;

      return {
        ...state,
        incomeEntries: state.incomeEntries.filter((item) => item.id !== entry.id),
        transactions: entry.transactionId
          ? state.transactions.filter((tx) => tx.id !== entry.transactionId)
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
        savingsTransfers: state.savingsTransfers.filter((transfer) => transfer.goalId !== action.payload),
      };
    case 'goal/transfer': {
      const { goalId, amount } = action.payload;
      const numericAmount = Number(amount);
      const goalExists = state.goals.some((goal) => goal.id === goalId);
      const available = Math.max(0, checkingBalance({ transactions: state.transactions, goals: state.goals }));

      if (!goalExists || !Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > available) {
        return state;
      }

      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === goalId
            ? { ...goal, current: Math.max(0, goal.current + numericAmount) }
            : goal
        ),
        savingsTransfers: [
          {
            id: action.payload.id || uniqueId('svtx'),
            goalId,
            amount: numericAmount,
            date: action.payload.date || todayIso(),
            note: action.payload.note ? String(action.payload.note) : '',
            kind: 'manual',
            createdAt: action.payload.createdAt || todayIso(),
          },
          ...state.savingsTransfers,
        ],
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
  const { currentUser } = useSession();
  const [state, dispatch] = useReducer(reducer, currentUser, createBootstrapState);
  const [systemTheme, setSystemTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const resolvedTheme = state.themeMode === 'system' ? systemTheme : state.themeMode;

  useEffect(() => {
    if (state.status !== 'ready') return;
    if (!currentUser?.id) return;

    try {
      window.localStorage.setItem(
        getUserAppStateStorageKey(currentUser.id),
        JSON.stringify(getPersistableState(state))
      );
    } catch {
      /* ignore storage failures */
    }
  }, [currentUser?.id, state]);

  useLayoutEffect(() => {
    dispatch({ type: 'load/success', payload: loadStateForUser(currentUser) });
  }, [currentUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = (event) => setSystemTheme(event.matches ? 'dark' : 'light');

    setSystemTheme(media.matches ? 'dark' : 'light');

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.dataset.themeMode = state.themeMode;
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, state.themeMode]);

  useEffect(() => {
    if (!state.toast) return undefined;
    const timeoutId = setTimeout(() => dispatch({ type: 'toast/clear' }), 2600);
    return () => clearTimeout(timeoutId);
  }, [state.toast]);

  const value = useMemo(
    () => ({ state, dispatch, resolvedTheme, systemTheme }),
    [resolvedTheme, state, systemTheme]
  );
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
