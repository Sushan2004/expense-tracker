import { useMemo, useState } from "react";
import AddTransactionForm from "../../components/ui/AddTransactionForm";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import StatusState from "../../components/ui/StatusState";
import TransactionFilters from "../../components/ui/TransactionFilters";
import TransactionTable from "../../components/ui/TransactionTable";
import { useAppContext } from "../../context/AppContext";
import { filterAndSortTransactions } from "../../utils/helpers";

const initialFilters = {
  query: "",
  category: "all",
  sortBy: "date"
};

export default function ExpensesPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const {
    transactions,
    favorites,
    addExpense,
    deleteExpense,
    deleteAllExpenses,
    toggleFavorite
  } = useAppContext();

  const expenses = useMemo(
    () => transactions.filter((item) => item.type === "expense"),
    [transactions]
  );
  const categoryOptions = useMemo(
    () => [...new Set(expenses.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [expenses]
  );
  const filteredExpenses = useMemo(
    () => filterAndSortTransactions(expenses, { ...filters, type: "expense" }),
    [expenses, filters]
  );

  return (
    <div className="page-content">
      <AddTransactionForm onAdd={addExpense} />
      <TransactionFilters
        filters={filters}
        onFiltersChange={setFilters}
        categoryOptions={categoryOptions}
      />

      {expenses.length === 0 ? (
        <StatusState
          type="empty"
          title="No expenses yet"
          description="Use the form above to add your first expense."
        />
      ) : (
        <TransactionTable
          expenses={filteredExpenses}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onDelete={deleteExpense}
          headerActions={(
            <button
              type="button"
              className="ghost-btn danger"
              onClick={() => setIsDeleteAllOpen(true)}
              disabled={expenses.length === 0}
            >
              Delete All
            </button>
          )}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteAllOpen}
        title="Delete All Expenses"
        message="Are you sure you want to delete all expenses? This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setIsDeleteAllOpen(false)}
        onConfirm={() => {
          deleteAllExpenses();
          setIsDeleteAllOpen(false);
        }}
      />
    </div>
  );
}
