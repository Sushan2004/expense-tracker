import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import useFetch from '../hooks/useFetch.js';

const AppStateContext = createContext(null);

const initialState = {
  status: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
  error: null,
  user: null,
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  goals: [],
  toast: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'load/start':
      return { ...state, status: 'loading', error: null };
    case 'load/success': {
      const seed = action.payload;
      return {
        ...state,
        status: 'ready',
        error: null,
        user: structuredClone(seed.user),
        accounts: structuredClone(seed.accounts),
        categories: structuredClone(seed.categories),
        transactions: structuredClone(seed.transactions),
        budgets: structuredClone(seed.budgets),
        goals: structuredClone(seed.goals),
      };
    }
    case 'load/error':
      return { ...state, status: 'error', error: action.payload };
    case 'tx/add': {
      return { ...state, transactions: [action.payload, ...state.transactions] };
    }
    case 'tx/update': {
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    }
    case 'tx/delete': {
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) };
    }
    case 'budget/update': {
      const { categoryId, month, amount } = action.payload;
      const idx = state.budgets.findIndex((b) => b.categoryId === categoryId && b.month === month);
      const next = [...state.budgets];
      if (idx >= 0) next[idx] = { ...next[idx], amount };
      else next.push({ categoryId, month, amount });
      return { ...state, budgets: next };
    }
    case 'goal/update': {
      return {
        ...state,
        goals: state.goals.map((g) => (g.id === action.payload.id ? { ...g, ...action.payload } : g)),
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const { data, error, loading } = useFetch('/data/seed.json');

  useEffect(() => {
    if (loading) dispatch({ type: 'load/start' });
  }, [loading]);

  useEffect(() => {
    if (data) dispatch({ type: 'load/success', payload: data });
  }, [data]);

  useEffect(() => {
    if (error) dispatch({ type: 'load/error', payload: error.message });
  }, [error]);

  useEffect(() => {
    if (!state.toast) return undefined;
    const id = setTimeout(() => dispatch({ type: 'toast/clear' }), 2600);
    return () => clearTimeout(id);
  }, [state.toast]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

AppStateProvider.propTypes = { children: PropTypes.node };

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
