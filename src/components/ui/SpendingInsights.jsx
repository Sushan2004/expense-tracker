import PropTypes from "prop-types";
import { useCurrency } from "../../context/CurrencyContext";

export default function SpendingInsights({ insights }) {
  const { formatCurrency } = useCurrency();

  return (
    <section className="panel">
      <h2>Spending Insights</h2>
      <ul className="insights-list">
        <li>
          <strong>Total expenses:</strong> {formatCurrency(insights.totalExpenses)}
        </li>
        <li>
          <strong>Top category:</strong> {insights.topCategory}
        </li>
        <li>
          <strong>Top category spend:</strong> {formatCurrency(insights.topCategorySpend)}
        </li>
      </ul>
    </section>
  );
}

SpendingInsights.propTypes = {
  insights: PropTypes.shape({
    totalExpenses: PropTypes.number.isRequired,
    topCategory: PropTypes.string.isRequired,
    topCategorySpend: PropTypes.number.isRequired
  }).isRequired
};
