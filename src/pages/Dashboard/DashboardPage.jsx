import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import ExpenseDonutChart from "../../components/charts/ExpenseDonutChart";
import IncomeExpenseBarChart from "../../components/charts/IncomeExpenseBarChart";
import IncomeExpenseSankeyChart from "../../components/charts/IncomeExpenseSankeyChart";
import SpendingTrendLineChart from "../../components/charts/SpendingTrendLineChart";
import BudgetProgress from "../../components/ui/BudgetProgress";
import RecentTransactions from "../../components/ui/RecentTransactions";
import SpendingInsights from "../../components/ui/SpendingInsights";
import StatusState from "../../components/ui/StatusState";
import SummaryCard from "../../components/ui/SummaryCard";
import {
  formatCurrency,
  getExpenseCategoryData,
  getMonthlyIncomeExpenseData,
  getSankeyData,
  getSpendingInsights,
  getSpendingTrendData,
  getSummaryMetrics
} from "../../utils/helpers";

export default function DashboardPage() {
  const { transactions, favorites, loading, error, isEmpty, toggleFavorite } = useOutletContext();

  const summary = useMemo(() => getSummaryMetrics(transactions), [transactions]);
  const categoryData = useMemo(() => getExpenseCategoryData(transactions), [transactions]);
  const monthlyData = useMemo(() => getMonthlyIncomeExpenseData(transactions), [transactions]);
  const trendData = useMemo(() => getSpendingTrendData(transactions), [transactions]);
  const sankeyData = useMemo(() => getSankeyData(transactions), [transactions]);
  const insights = useMemo(() => getSpendingInsights(transactions), [transactions]);
  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return <StatusState type="loading" title="Loading dashboard..." description="Fetching your latest financial activity." />;
  }

  if (error) {
    return <StatusState type="error" title="Data load failed" description={error} />;
  }

  if (isEmpty) {
    return (
      <StatusState
        type="empty"
        title="No transaction data yet"
        description="Start by adding transactions from the Transactions page."
      />
    );
  }

  return (
    <div className="page-content">
      <section className="summary-grid">
        <SummaryCard label="Total Balance" value={formatCurrency(summary.balance)} tone={summary.balance < 0 ? "negative" : "positive"} />
        <SummaryCard label="Total Income" value={formatCurrency(summary.income)} tone="positive" />
        <SummaryCard label="Total Expenses" value={formatCurrency(summary.expenses)} tone="negative" />
        <SummaryCard label="Savings" value={`${summary.savingsRate}%`} hint="Balance / Income" />
      </section>

      <section className="charts-grid">
        <ExpenseDonutChart data={categoryData} />
        <IncomeExpenseBarChart data={monthlyData} />
        <SpendingTrendLineChart data={trendData} />
        <IncomeExpenseSankeyChart data={sankeyData} />
      </section>

      <section className="widgets-grid">
        <RecentTransactions transactions={recentTransactions} favorites={favorites} onToggleFavorite={toggleFavorite} />
        <BudgetProgress expenses={summary.expenses} budget={2500} />
        <SpendingInsights insights={insights} />
      </section>
    </div>
  );
}
