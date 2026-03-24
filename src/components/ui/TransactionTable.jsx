import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";
import ConfirmDialog from "./ConfirmDialog";
import { CATEGORY_ICONS, formatDate, formatRecurringFrequency } from "../../utils/helpers";

export default function TransactionTable({
  expenses,
  favorites,
  onToggleFavorite,
  onDelete,
  headerActions
}) {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  if (expenses.length === 0) {
    return (
      <section className="panel">
        <div className="panel-head">
          <h2>Expenses</h2>
          {headerActions ? <div className="row-actions">{headerActions}</div> : null}
        </div>
        <p className="muted">No expenses match your current filters.</p>
      </section>
    );
  }

  return (
    <section className="panel table-wrap">
      <div className="panel-head">
        <h2>Expenses</h2>
        {headerActions ? <div className="row-actions">{headerActions}</div> : null}
      </div>
      <table>
        <caption className="sr-only">Expense history list</caption>
        <thead>
          <tr>
            <th scope="col">Description</th>
            <th scope="col">Category</th>
            <th scope="col">Date</th>
            <th scope="col">Amount</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((item) => {
            const isFavorite = favorites.includes(item.id);

            return (
              <tr
                key={item.id}
                tabIndex={0}
                onClick={() => navigate(`/expenses/${item.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/expenses/${item.id}`);
                  }
                }}
              >
                <td>
                  <div>
                    <strong>{CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Other} {item.description}</strong>
                    {item.isRecurring ? (
                      <div className="table-meta">Recurring ({formatRecurringFrequency(item.recurringFrequency)})</div>
                    ) : null}
                  </div>
                </td>
                <td>{item.category}</td>
                <td>{formatDate(item.date)}</td>
                <td className="expense">{formatCurrency(item.amount)}</td>
                <td className="table-actions-cell">
                  <div className="row-actions table-actions-row">
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      aria-label={`Favorite expense ${item.description}`}
                    >
                      {isFavorite ? "Favorited" : "Favorite"}
                    </button>
                    <button
                      type="button"
                      className="ghost-btn danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPendingDeleteId(item.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          onDelete(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </section>
  );
}

TransactionTable.propTypes = {
  expenses: PropTypes.arrayOf(PropTypes.object).isRequired,
  favorites: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  headerActions: PropTypes.node
};

TransactionTable.defaultProps = {
  headerActions: null
};
