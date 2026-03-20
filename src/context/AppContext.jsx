import PropTypes from "prop-types";
import { createContext, useContext, useEffect, useMemo } from "react";
import seedTransactions from "../data/transactions.json";
import useLocalStorage from "../hooks/useLocalStorage";
import {
  coerceCustomExpenseCategories,
  resolveExpenseCategoryName
} from "../utils/helpers";

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

function prependTransaction(current, transaction) {
  return sortTransactions([normalizeTransaction(transaction), ...coerceTransactionList(current)]);
}

function deleteById(current, id) {
  return coerceTransactionList(current).filter((transaction) => String(transaction.id) !== String(id));
}

function deleteByTypeAndId(current, type, id) {
  return coerceTransactionList(current).filter(
    (transaction) => transaction.type !== type || String(transaction.id) !== String(id)
  );
}

export function AppProvider({ children }) {
  const [storedTransactions, setStoredTransactions] = useLocalStorage("transactions", SEED_TRANSACTIONS);
  const [storedFavorites, setStoredFavorites] = useLocalStorage("favoriteTransactions", []);
  const [storedCustomExpenseCategories, setStoredCustomExpenseCategories] = useLocalStorage("customExpenseCategories", []);

  const transactions = useMemo(
    () => coerceTransactionList(storedTransactions),
    [storedTransactions]
  );
  const customExpenseCategories = useMemo(
    () => coerceCustomExpenseCategories(storedCustomExpenseCategories, transactions),
    [storedCustomExpenseCategories, transactions]
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

  useEffect(() => {
    try {
      window.localStorage.removeItem("recentSearches");
    } catch {
      // Ignore storage cleanup errors.
    }
  }, []);

  const value = useMemo(
    () => ({
      transactions,
      customExpenseCategories,
      favorites,
      isEmpty: transactions.length === 0,
      addTransaction: (transaction) => {
        setStoredTransactions((current) => prependTransaction(current, transaction));
      },
      addExpense: (expense) => {
        const resolvedCategory =
          resolveExpenseCategoryName(expense?.category, customExpenseCategories) ||
          String(expense?.category || "").trim() ||
          "Other";

        setStoredTransactions((current) =>
          prependTransaction(current, {
            ...expense,
            type: "expense",
            incomeSource: "",
            category: resolvedCategory
          })
        );
      },
      addCustomExpenseCategory: (name) => {
        setStoredCustomExpenseCategories((current) =>
          coerceCustomExpenseCategories([...(Array.isArray(current) ? current : []), name])
        );
      },
      addIncomeEntry: (incomeEntry) => {
        const sourceName = String(incomeEntry?.sourceName || incomeEntry?.incomeSource || incomeEntry?.description || "").trim();

        setStoredTransactions((current) =>
          prependTransaction(current, {
            ...incomeEntry,
            type: "income",
            description: sourceName,
            incomeSource: sourceName,
            category: sourceName || "Other",
            date: incomeEntry?.date || new Date().toISOString().slice(0, 10),
            isRecurring: Boolean(incomeEntry?.recurringFrequency),
            recurringFrequency: String(incomeEntry?.recurringFrequency || "").trim().toLowerCase()
          })
        );
      },
      deleteTransaction: (id) => {
        setStoredTransactions((current) => deleteById(current, id));
        setStoredFavorites((current) =>
          Array.isArray(current) ? current.filter((favoriteId) => String(favoriteId) !== String(id)) : []
        );
      },
      deleteExpense: (id) => {
        setStoredTransactions((current) => deleteByTypeAndId(current, "expense", id));
        setStoredFavorites((current) =>
          Array.isArray(current) ? current.filter((favoriteId) => String(favoriteId) !== String(id)) : []
        );
      },
      deleteIncome: (id) => {
        setStoredTransactions((current) => deleteByTypeAndId(current, "income", id));
        setStoredFavorites((current) =>
          Array.isArray(current) ? current.filter((favoriteId) => String(favoriteId) !== String(id)) : []
        );
      },
      deleteAllExpenses: () => {
        const removedExpenseIds = transactions
          .filter((transaction) => transaction.type === "expense")
          .map((transaction) => String(transaction.id));

        setStoredTransactions((current) => coerceTransactionList(current).filter((transaction) => transaction.type !== "expense"));

        setStoredFavorites((current) =>
          Array.isArray(current)
            ? current.filter((favoriteId) => !removedExpenseIds.includes(String(favoriteId)))
            : []
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
      }
    }),
    [
      customExpenseCategories,
      favorites,
      setStoredCustomExpenseCategories,
      setStoredFavorites,
      setStoredTransactions,
      transactions
    ]
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
