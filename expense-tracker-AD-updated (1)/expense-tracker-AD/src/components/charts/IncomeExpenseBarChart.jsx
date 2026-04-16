import PropTypes from "prop-types";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useCurrency } from "../../context/CurrencyContext";
import { formatCurrency } from "../../utils/helpers";

export default function IncomeExpenseBarChart({ data }) {
  const { currency } = useCurrency();

  return (
    <section className="panel chart-panel">
      <h2>Income vs Expenses (Monthly)</h2>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatCurrency(value, currency, { notation: "compact", maximumFractionDigits: 1 })} />
            <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
            <Legend />
            <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

IncomeExpenseBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      income: PropTypes.number.isRequired,
      expenses: PropTypes.number.isRequired
    })
  ).isRequired
};
