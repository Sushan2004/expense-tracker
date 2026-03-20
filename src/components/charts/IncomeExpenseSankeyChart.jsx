import PropTypes from "prop-types";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";
import { useCurrency } from "../../context/CurrencyContext";
import { formatCurrency } from "../../utils/helpers";

function renderSankeyNode({ x, y, width, height, payload }) {
  const isTerminalNode = payload.targetNodes?.length === 0;
  const labelX = isTerminalNode ? x - 10 : x + width + 10;
  const labelY = y + height / 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        fill="var(--primary)"
        stroke="var(--text)"
        strokeOpacity={0.18}
      />
      <text
        x={labelX}
        y={labelY}
        dominantBaseline="middle"
        fontSize={12}
        fontWeight={600}
        pointerEvents="none"
        textAnchor={isTerminalNode ? "end" : "start"}
        style={{ fill: "var(--text)" }}
      >
        {payload.name}
      </text>
    </g>
  );
}

export default function IncomeExpenseSankeyChart({ data, title }) {
  const { currency } = useCurrency();

  return (
    <section className="panel chart-panel">
      <h2>{title}</h2>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <Sankey
            data={data}
            nodeWidth={18}
            nodePadding={20}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            link={{ stroke: "var(--primary)", strokeOpacity: 0.45 }}
            node={renderSankeyNode}
          >
            <Tooltip
              formatter={(value) => formatCurrency(Number(value), currency, { maximumFractionDigits: 0 })}
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                color: "var(--text)"
              }}
              itemStyle={{ color: "var(--text)" }}
              labelStyle={{ color: "var(--muted)" }}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

IncomeExpenseSankeyChart.propTypes = {
  title: PropTypes.string,
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

IncomeExpenseSankeyChart.defaultProps = {
  title: "Income Flow to Expenses"
};
