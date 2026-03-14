import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AddTransactionForm from "../../components/ui/AddTransactionForm";
import ExportCsvButton from "../../components/ui/ExportCsvButton";
import StatusState from "../../components/ui/StatusState";
import TransactionFilters from "../../components/ui/TransactionFilters";
import TransactionTable from "../../components/ui/TransactionTable";
import { filterAndSortTransactions } from "../../utils/helpers";

const initialFilters = {
  query: "",
  category: "all",
  type: "all",
  sortBy: "date"
};

export default function TransactionsPage() {
  const {
    transactions,
    favorites,
    loading,
    error,
    isEmpty,
    addTransaction,
    deleteTransaction,
    toggleFavorite,
    recentSearches,
    setRecentSearches
  } = useOutletContext();

  const [filters, setFilters] = useState(initialFilters);
  const categoryOptions = useMemo(
    () => [...new Set(transactions.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [transactions]
  );

  const filteredTransactions = useMemo(
    () => filterAndSortTransactions(transactions, filters),
    [transactions, filters]
  );

  useEffect(() => {
    const query = filters.query.trim();
    if (query.length < 2) {
      return;
    }
    const timeout = setTimeout(() => {
      setRecentSearches((current) => [query, ...current.filter((item) => item !== query)].slice(0, 6));
    }, 300);

    return () => clearTimeout(timeout);
  }, [filters.query, setRecentSearches]);

  if (loading) {
    return <StatusState type="loading" title="Loading transactions..." description="Getting records from your data source." />;
  }

  if (error) {
    return <StatusState type="error" title="Unable to load transactions" description={error} />;
  }

  return (
    <div className="page-content">
      <div className="panel-head">
        <h2>Manage Transactions</h2>
        <ExportCsvButton transactions={filteredTransactions} />
      </div>

      <AddTransactionForm onAdd={addTransaction} />
      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        recentSearches={recentSearches}
        categoryOptions={categoryOptions}
      />

      {isEmpty ? (
        <StatusState
          type="empty"
          title="No transactions yet"
          description="Use the form above to add your first transaction."
        />
      ) : (
        <TransactionTable
          transactions={filteredTransactions}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onDelete={deleteTransaction}
        />
      )}
    </div>
  );
}
