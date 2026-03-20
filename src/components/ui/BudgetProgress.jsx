import PropTypes from "prop-types";
import { useCurrency } from "../../context/CurrencyContext";

export default function BudgetProgress({ expenses, budget }) {
  const { formatCurrency } = useCurrency();
  const progress = budget > 0 ? Math.min(100, (expenses / budget) * 100) : 0;
  const remaining = budget - expenses;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Budget Progress</h2>
        <span>{progress.toFixed(1)}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="muted">
        Spent {formatCurrency(expenses)} of {formatCurrency(budget)}.{" "}
        {remaining >= 0 ? `${formatCurrency(remaining)} remaining.` : `${formatCurrency(Math.abs(remaining))} over budget.`}
      </p>
    </section>
  );
}

BudgetProgress.propTypes = {
  expenses: PropTypes.number.isRequired,
  budget: PropTypes.number.isRequired
};
