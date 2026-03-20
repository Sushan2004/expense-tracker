import PropTypes from "prop-types";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";

export default function IncomeExpenseSankeyChart({ data }) {
  return (
    <section className="panel chart-panel">
      <h2>Income Flow to Expenses</h2>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <Sankey
            data={data}
            nodePadding={24}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            link={{ stroke: "#60a5fa" }}
            node={{ stroke: "#94a3b8", fill: "#cbd5e1" }}
          >
            <Tooltip />
          </Sankey>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

IncomeExpenseSankeyChart.propTypes = {
  data: PropTypes.shape({
    nodes: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired })).isRequired,
    links: PropTypes.arrayOf(
      PropTypes.shape({
        source: PropTypes.number.isRequired,
        target: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired
      })
    ).isRequired
  }).isRequired
};
