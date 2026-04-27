import { useMemo, useState } from 'react';
import { useAppState } from '../state/AppState.jsx';
import StatCard from '../components/StatCard.jsx';
import SegmentedControl from '../components/SegmentedControl.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SankeyFlowChart from '../components/SankeyFlowChart.jsx';
import {
  monthTotals,
  spendingByCategory,
  categoryById,
  getSankeyData,
} from '../utils/selectors.js';
import { formatCurrency, formatPercent, isoMonth } from '../utils/format.js';

const PERIODS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

const VIEWS = [
  { value: 'bars', label: 'Bars' },
  { value: 'flow', label: 'Flow' },
];

export default function Reports() {
  const { state } = useAppState();
  const { transactions, categories } = state;
  const [period, setPeriod] = useState('month');
  const [view, setView] = useState('bars');
  const month = isoMonth();
  const periodTransactions = useMemo(
    () => transactions.filter((t) => t.date.startsWith(month)),
    [transactions, month]
  );

  const totals = useMemo(() => monthTotals(periodTransactions, month), [periodTransactions, month]);
  const spending = useMemo(() => spendingByCategory(periodTransactions, month), [periodTransactions, month]);
  const flowData = useMemo(
    () => getSankeyData(periodTransactions, categories),
    [periodTransactions, categories]
  );

  if (state.status !== 'ready') return null;

  const dailyAvg = totals.spending / new Date().getDate();

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Reports</h1>
          <span className="t-caption">Cashflow and category insights</span>
        </div>
        <SegmentedControl value={period} options={PERIODS} onChange={setPeriod} ariaLabel="Period" />
      </header>

      <div className="kpi-grid">
        <StatCard label="Income" value={formatCurrency(totals.income)} delta="+0% vs prev" deltaTone="up" />
        <StatCard label="Spending" value={formatCurrency(totals.spending)} delta="−12% vs prev" deltaTone="up" />
        <StatCard label="Savings rate" value={formatPercent(totals.savingsRate)} delta="+8 pts" deltaTone="up" />
        <StatCard label="Avg. daily" value={formatCurrency(dailyAvg)} delta="−$6 vs prev" deltaTone="warn" />
      </div>

      <section className="dash-grid" style={{ alignItems: 'start' }}>
        <div className="card card--lg">
          <div className="row row--between" style={{ marginBottom: 14 }}>
            <h2 className="t-h2">Spending breakdown</h2>
            <SegmentedControl value={view} options={VIEWS} onChange={setView} ariaLabel="Chart view" />
          </div>
          {view === 'bars' ? (
            <BarsChart spending={spending} categories={categories} />
          ) : (
            <FlowChart data={flowData} />
          )}
        </div>

        <div className="card card--lg">
          <h2 className="t-h2" style={{ marginBottom: 12 }}>Insights</h2>
          <div className="stack" style={{ gap: 10 }}>
            <Insight tone="success" title="Food trending down" body="Fewer coffee runs this month — nice work." />
            <Insight tone="warning" title="Shopping nearing limit" body="97% of budget used. 12 days to go." />
            <Insight tone="neutral" title="Biggest spend" body="Rent · $1,200 on the 1st." />
          </div>
        </div>
      </section>
    </>
  );
}

function BarsChart({ spending, categories }) {
  const max = Math.max(1, ...spending.map((s) => s.amount));
  return (
    <div className="stack" style={{ gap: 10 }}>
      {spending.length === 0 && <div className="t-caption">No spending yet this month.</div>}
      {spending.map((s, i) => {
        const cat = categoryById(categories, s.categoryId);
        const pct = (s.amount / max) * 100;
        const fill = `var(--cat-${Math.min(7, 7 - i)})`;
        return (
          <div key={s.categoryId}>
            <div className="row row--between" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{cat?.name || 'Other'}</span>
              <span className="tnum" style={{ fontSize: 13, color: 'var(--text-2)' }}>
                {formatCurrency(s.amount)}
              </span>
            </div>
            <div className="pbar" style={{ background: 'var(--mint-wash)' }}>
              <div className="pbar__fill" style={{ width: `${pct}%`, background: fill }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FlowChart({ data }) {
  if (!data.links.length) {
    return (
      <EmptyState
        title="No money flow data yet"
        copy="Add income and expense entries this month to see how money moves through your categories."
      />
    );
  }

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="t-caption">
        Income flows into a shared money pool, then into your biggest spending categories and savings.
      </div>
      <SankeyFlowChart data={data} height={360} framed={false} className="reports-flow-chart" />
    </div>
  );
}

function Insight({ tone, title, body }) {
  const bg =
    tone === 'success' ? 'var(--mint-wash)' :
    tone === 'warning' ? 'var(--warning-wash)' :
    'var(--cream)';
  const ink =
    tone === 'success' ? 'var(--forest)' :
    tone === 'warning' ? 'var(--warning-ink)' :
    'var(--ink)';
  return (
    <div style={{ background: bg, borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: ink, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{body}</div>
    </div>
  );
}

FlowChart.propTypes = {
  data: SankeyFlowChart.propTypes.data,
};
