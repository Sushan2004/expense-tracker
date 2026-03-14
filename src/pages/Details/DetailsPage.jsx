import { useMemo } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { CATEGORY_ICONS, formatCurrency, formatDate } from "../../utils/helpers";

export default function DetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, favorites, deleteTransaction, toggleFavorite } = useOutletContext();

  const transaction = useMemo(
    () => transactions.find((item) => String(item.id) === String(id)),
    [transactions, id]
  );

  if (!transaction) {
    return (
      <section className="panel">
        <h2>Transaction Not Found</h2>
        <p className="muted">The requested transaction does not exist.</p>
        <Link to="/transactions" className="ghost-btn">
          Back to Transactions
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
          <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>
            Back
          </button>
          <button type="button" className="ghost-btn" onClick={() => toggleFavorite(transaction.id)}>
            {isFavorite ? "Unfavorite" : "Favorite"}
          </button>
          <button
            type="button"
            className="ghost-btn danger"
            onClick={() => {
              deleteTransaction(transaction.id);
              navigate("/transactions");
            }}
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
          <dt>Type</dt>
          <dd>{transaction.type}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{formatDate(transaction.date)}</dd>
        </div>
        {transaction.type === "income" ? (
          <div>
            <dt>Income Source</dt>
            <dd>{transaction.incomeSource || "Not specified"}</dd>
          </div>
        ) : (
          <div>
            <dt>Recurring</dt>
            <dd>
              {transaction.isRecurring
                ? `Yes (${transaction.recurringFrequency || "frequency not set"})`
                : "No"}
            </dd>
          </div>
        )}
        <div>
          <dt>ID</dt>
          <dd>{transaction.id}</dd>
        </div>
      </dl>
    </section>
  );
}
