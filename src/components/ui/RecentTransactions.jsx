import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { CATEGORY_ICONS, formatCurrency, formatDate } from "../../utils/helpers";

export default function RecentTransactions({ transactions, favorites, onToggleFavorite }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Recent Transactions</h2>
        <Link to="/transactions">View all</Link>
      </div>
      {transactions.length === 0 ? (
        <p className="muted">No transactions available.</p>
      ) : (
        <ul className="recent-list">
          {transactions.map((item) => {
            const isFavorite = favorites.includes(item.id);
            return (
              <li key={item.id} className="recent-item">
                <div>
                  <p className="item-title">
                    {CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Other} {item.description}
                  </p>
                  <small>
                    {item.category} - {formatDate(item.date)}
                    {item.type === "income" && item.incomeSource ? ` - Source: ${item.incomeSource}` : ""}
                    {item.type === "expense" && item.isRecurring
                      ? ` - Recurring (${item.recurringFrequency || "unspecified"})`
                      : ""}
                  </small>
                </div>
                <div className="row-actions">
                  <span className={item.type === "expense" ? "expense" : "income"}>
                    {item.type === "expense" ? "-" : "+"}
                    {formatCurrency(item.amount)}
                  </span>
                  <button
                    type="button"
                    className="ghost-btn"
                    aria-label={`Toggle favorite for ${item.description}`}
                    onClick={() => onToggleFavorite(item.id)}
                  >
                    {isFavorite ? "★" : "☆"}
                  </button>
                  <Link className="ghost-btn" to={`/details/${item.id}`}>
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
  transactions: PropTypes.arrayOf(PropTypes.object).isRequired,
  favorites: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])).isRequired,
  onToggleFavorite: PropTypes.func.isRequired
};
