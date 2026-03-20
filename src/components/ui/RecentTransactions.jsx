import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";
import { CATEGORY_ICONS, formatDate, formatRecurringFrequency } from "../../utils/helpers";

export default function RecentTransactions({ expenses, favorites, onToggleFavorite }) {
  const { formatCurrency } = useCurrency();

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Recent Expenses</h2>
        <Link to="/expenses">View all</Link>
      </div>
      {expenses.length === 0 ? (
        <p className="muted">No expenses available.</p>
      ) : (
        <ul className="recent-list">
          {expenses.map((item) => {
            const isFavorite = favorites.includes(item.id);

            return (
              <li key={item.id} className="recent-item">
                <div>
                  <p className="item-title">
                    {CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Other} {item.description}
                  </p>
                  <small>
                    {item.category} - {formatDate(item.date)}
                    {item.isRecurring ? ` - Recurring (${formatRecurringFrequency(item.recurringFrequency)})` : ""}
                  </small>
                </div>
                <div className="row-actions">
                  <span className="expense">{formatCurrency(item.amount)}</span>
                  <button
                    type="button"
                    className="ghost-btn"
                    aria-label={`Toggle favorite for ${item.description}`}
                    onClick={() => onToggleFavorite(item.id)}
                  >
                    {isFavorite ? "Favorited" : "Favorite"}
                  </button>
                  <Link className="ghost-btn" to={`/expenses/${item.id}`}>
                    Details
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

RecentTransactions.propTypes = {
  expenses: PropTypes.arrayOf(PropTypes.object).isRequired,
  favorites: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
  onToggleFavorite: PropTypes.func.isRequired
};
