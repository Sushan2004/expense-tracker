import { useEffect, useMemo, useReducer } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import useFetch from "./hooks/useFetch";
import useLocalStorage from "./hooks/useLocalStorage";
import AboutPage from "./pages/About/AboutPage";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import DetailsPage from "./pages/Details/DetailsPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage";
import TransactionsPage from "./pages/Transactions/TransactionsPage";
import { initialTransactionState, transactionReducer } from "./utils/helpers";

const transactionsDataUrl = new URL("./data/transactions.json", import.meta.url).href;

export default function App() {
  const { data, loading, error, isEmpty } = useFetch(transactionsDataUrl);
  const [savedFavorites, setSavedFavorites] = useLocalStorage("favoriteTransactions", []);
  const [recentSearches, setRecentSearches] = useLocalStorage("recentSearches", []);
  const [state, dispatch] = useReducer(transactionReducer, initialTransactionState);

  useEffect(() => {
    if (!loading && data.length > 0) {
      dispatch({ type: "INIT_TRANSACTIONS", payload: data });
    }
  }, [data, loading]);

  useEffect(() => {
    dispatch({ type: "SET_FAVORITES", payload: savedFavorites });
  }, [savedFavorites]);

  useEffect(() => {
    setSavedFavorites(state.favorites);
  }, [setSavedFavorites, state.favorites]);

  const appContext = useMemo(
    () => ({
      transactions: state.transactions,
      favorites: state.favorites,
      loading,
      error,
      isEmpty: isEmpty && state.transactions.length === 0,
      addTransaction: (transaction) => dispatch({ type: "ADD_TRANSACTION", payload: transaction }),
      deleteTransaction: (id) => dispatch({ type: "DELETE_TRANSACTION", payload: id }),
      toggleFavorite: (id) => dispatch({ type: "TOGGLE_FAVORITE", payload: id }),
      recentSearches,
      setRecentSearches
    }),
    [state.transactions, state.favorites, loading, error, isEmpty, recentSearches, setRecentSearches]
  );

  return (
    <Routes>
      <Route path="/" element={<AppLayout appContext={appContext} />}>
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="details/:id" element={<DetailsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
