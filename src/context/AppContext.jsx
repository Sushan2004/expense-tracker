import PropTypes from "prop-types";
import { createContext, useContext, useMemo } from "react";
import seedTransactions from "../data/transactions.json";
import useLocalStorage from "../hooks/useLocalStorage";

const AppContext = createContext(null);

const SEED_TRANSACTIONS = sortTransactions(seedTransactions.map(normalizeTransaction));

function normalizeTransaction(transaction) {
  const type = transaction?.type === "income" ? "income" : "expense";
  const incomeSource = String(transaction?.incomeSource || "").trim();

  return {
    id: transaction?.id ?? `${String(transaction?.description || "transaction")}-${String(transaction?.date || "")}`,
    description: String(transaction?.description || "").trim(),
    amount: Number(transaction?.amount) || 0,
    category: String(transaction?.category || incomeSource || "Other").trim(),
    type,
    incomeSource,
    isRecurring: Boolean(transaction?.isRecurring),
    recurringFrequency: String(transaction?.recurringFrequency || "").trim(),
    date: String(transaction?.date || new Date().toISOString().slice(0, 10))
  };
}

function sortTransactions(transactions) {
  return [...transactions].sort((left, right) => new Date(right.date) - new Date(left.date));
}

function coerceTransactionList(value, fallback = SEED_TRANSACTIONS) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return sortTransactions(value.map(normalizeTransaction));
}

function normalizeSearchHistory(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 6);
}

export function AppProvider({ children }) {
  const [storedTransactions, setStoredTransactions] = useLocalStorage("transactions", SEED_TRANSACTIONS);
  const [storedFavorites, setStoredFavorites] = useLocalStorage("favoriteTransactions", []);
  const [storedRecentSearches, setStoredRecentSearches] = useLocalStorage("recentSearches", []);

  const transactions = useMemo(
    () => coerceTransactionList(storedTransactions),
    [storedTransactions]
  );

  const favorites = useMemo(() => {
    if (!Array.isArray(storedFavorites)) {
      return [];
    }

    return storedFavorites.filter((id, index, list) => {
      const isUnique = list.findIndex((item) => String(item) === String(id)) === index;
      const exists = transactions.some((transaction) => String(transaction.id) === String(id));
      return isUnique && exists;
    });
  }, [storedFavorites, transactions]);

  const recentSearches = useMemo(
    () => normalizeSearchHistory(storedRecentSearches),
    [storedRecentSearches]
  );

  const value = useMemo(
    () => ({
      transactions,
      favorites,
      recentSearches,
      isEmpty: transactions.length === 0,
      addTransaction: (transaction) => {
        setStoredTransactions((current) =>
          sortTransactions([normalizeTransaction(transaction), ...coerceTransactionList(current)])
        );
      },
      deleteTransaction: (id) => {
        setStoredTransactions((current) =>
          coerceTransactionList(current).filter((transaction) => String(transaction.id) !== String(id))
        );
        setStoredFavorites((current) =>
          Array.isArray(current) ? current.filter((favoriteId) => String(favoriteId) !== String(id)) : []
        );
      },
      toggleFavorite: (id) => {
        const exists = transactions.some((transaction) => String(transaction.id) === String(id));
        if (!exists) {
          return;
        }

        setStoredFavorites((current) => {
          const favoritesList = Array.isArray(current) ? current : [];
          const isFavorite = favoritesList.some((favoriteId) => String(favoriteId) === String(id));

          if (isFavorite) {
            return favoritesList.filter((favoriteId) => String(favoriteId) !== String(id));
          }

          return [id, ...favoritesList];
        });
      },
      setRecentSearches: (updater) => {
        setStoredRecentSearches((current) => {
          const currentValue = normalizeSearchHistory(current);
          const nextValue = typeof updater === "function" ? updater(currentValue) : updater;
          return normalizeSearchHistory(nextValue);
        });
      }
    }),
    [favorites, recentSearches, setStoredFavorites, setStoredRecentSearches, setStoredTransactions, transactions]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

AppProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}
