import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useAppContext } from "../../context/AppContext";
import { useCurrency } from "../../context/CurrencyContext";
import { CATEGORY_ICONS, formatDate, formatRecurringFrequency } from "../../utils/helpers";

export default function DetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { transactions, favorites, deleteExpense, toggleFavorite } = useAppContext();
  const { formatCurrency } = useCurrency();

  const transaction = useMemo(
    () => transactions.find((item) => item.type === "expense" && String(item.id) === String(id)),
    [transactions, id]
  );

  if (!transaction) {
    return (
      <section className="panel">
        <h2>Expense Not Found</h2>
        <p className="muted">The requested expense does not exist.</p>
        <Link to="/expenses" className="ghost-btn">
          Back to Expense History
        </Link>
      </section>
    );
  }

  const isFavorite = favorites.includes(transaction.id);

  return (
    <section className="panel details-card">
      <div className="panel-head">
        <h2>
          {CATEGORY_ICONS[transaction.category] || CATEGORY_ICONS.Other} {transaction.description}
        </h2>
        <div className="row-actions">
          <button type="button" className="ghost-btn" onClick={() => navigate("/expenses")}>
            Back to Expense History
          </button>
          <button type="button" className="ghost-btn" onClick={() => toggleFavorite(transaction.id)}>
            {isFavorite ? "Unfavorite" : "Favorite"}
          </button>
          <button
            type="button"
            className="ghost-btn danger"
            onClick={() => setIsDeleteOpen(true)}
          >
            Delete
          </button>
        </div>
      </div>

      <dl className="details-grid">
        <div>
          <dt>Amount</dt>
          <dd>{formatCurrency(transaction.amount)}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{transaction.category}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{formatDate(transaction.date)}</dd>
        </div>
        <div>
          <dt>Recurring</dt>
          <dd>{transaction.isRecurring ? formatRecurringFrequency(transaction.recurringFrequency) : "No"}</dd>
        </div>
        <div>
          <dt>ID</dt>
          <dd>{transaction.id}</dd>
        </div>
      </dl>
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          deleteExpense(transaction.id);
          navigate("/expenses");
        }}
      />
    </section>
  );
}
