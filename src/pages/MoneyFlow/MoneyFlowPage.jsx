import { useMemo } from "react";
import IncomeExpenseSankeyChart from "../../components/charts/IncomeExpenseSankeyChart";
import StatusState from "../../components/ui/StatusState";
import SummaryCard from "../../components/ui/SummaryCard";
import { useAppContext } from "../../context/AppContext";
import { useCurrency } from "../../context/CurrencyContext";
import {
  getSankeyData,
  getSpendingInsights,
  getSummaryMetrics
} from "../../utils/helpers";

export default function MoneyFlowPage() {
  const { transactions, isEmpty } = useAppContext();
  const { convertAmount, formatCurrency } = useCurrency();

  const summary = useMemo(() => getSummaryMetrics(transactions), [transactions]);
  const insights = useMemo(() => getSpendingInsights(transactions), [transactions]);
  const sankeyData = useMemo(() => getSankeyData(transactions), [transactions]);
  const convertedSankeyData = useMemo(
    () => ({
      nodes: sankeyData.nodes,
      links: sankeyData.links.map((item) => ({ ...item, value: convertAmount(item.value) }))
    }),
    [sankeyData, convertAmount]
  );

  if (isEmpty) {
    return (
      <StatusState
        type="empty"
        title="No money flow data yet"
        description="Add income sources and expenses to see how your money moves across categories."
      />
    );
  }

  return (
    <div className="page-content">
      <section className="panel">
        <h2>Money Flow Overview</h2>
        <p className="muted">
          Follow how your income moves into expenses and where the largest categories are taking your budget.
        </p>
      </section>

      <section className="summary-grid money-flow-summary">
        <SummaryCard label="Total Income" value={formatCurrency(summary.income)} tone="positive" />
        <SummaryCard label="Total Expenses" value={formatCurrency(summary.expenses)} tone="negative" />
        <SummaryCard
          label="Top Spend Category"
          value={insights.topCategory}
          hint={insights.topCategorySpend > 0 ? formatCurrency(insights.topCategorySpend) : "No expenses yet"}
        />
      </section>

      <IncomeExpenseSankeyChart data={convertedSankeyData} title="Money Flow" />
    </div>
  );
}
