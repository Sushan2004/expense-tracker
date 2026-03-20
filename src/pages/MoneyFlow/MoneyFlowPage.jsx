import { useMemo } from "react";
import IncomeExpenseSankeyChart from "../../components/charts/IncomeExpenseSankeyChart";
import StatusState from "../../components/ui/StatusState";
import { useAppContext } from "../../context/AppContext";
import { useCurrency } from "../../context/CurrencyContext";
import { getSankeyData } from "../../utils/helpers";

export default function MoneyFlowPage() {
  const { transactions, isEmpty } = useAppContext();
  const { convertAmount } = useCurrency();
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
    <div className="page-content money-flow-page">
      <IncomeExpenseSankeyChart data={convertedSankeyData} />
    </div>
  );
}
