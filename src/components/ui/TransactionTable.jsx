import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";
import { CATEGORY_ICONS, formatDate } from "../../utils/helpers";

export default function TransactionTable({ transactions, favorites, onToggleFavorite, onDelete }) {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  if (transactions.length === 0) {
    return (
      <section className="panel">
        <h2>Transactions</h2>
        <p className="muted">No transactions match your current filters.</p>
      </section>
    );
  }

  return (
    <section className="panel table-wrap">
      <h2>Transactions</h2>
      <table>
        <caption className="sr-only">Expense tracker transaction list</caption>
        <thead>
          <tr>
            <th scope="col">Description</th>
            <th scope="col">Category</th>
            <th scope="col">Type</th>
            <th scope="col">Date</th>
            <th scope="col">Amount</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((item) => {
            const isFavorite = favorites.includes(item.id);
            return (
              <tr
                key={item.id}
                tabIndex={0}
                onClick={() => navigate(`/details/${item.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/details/${item.id}`);
                  }
                }}
              >
                <td>
                  <div>
                    <strong>{CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Other} {item.description}</strong>
                    <div className="table-meta">
                      {item.type === "income" && item.incomeSource ? `Source: ${item.incomeSource}` : null}
                      {item.type === "expense" && item.isRecurring
                        ? `Recurring (${item.recurringFrequency || "unspecified"})`
                        : null}
                    </div>
                  </div>
                </td>
                <td>{item.category}</td>
                <td>
                  <span className={`pill ${item.type}`}>{item.type}</span>
                </td>
                <td>{formatDate(item.date)}</td>
                <td className={item.type === "expense" ? "expense" : "income"}>{formatCurrency(item.amount)}</td>
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleFavorite(item.id);
                      }}
                      aria-label={`Favorite transaction ${item.description}`}
                    >
                      {isFavorite ? "★" : "☆"}
                    </button>
                    <button
                      type="button"
                      className="ghost-btn danger"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(item.id);
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
    </section>
  );
}

TransactionTable.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
  favorites: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
