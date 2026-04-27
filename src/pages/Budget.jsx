import { useMemo } from 'react';
import { useAppState } from '../state/AppState.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { formatCurrency, isoMonth } from '../utils/format.js';
import {
  getBudgetBreakdown,
  getBudgetCategoryData,
  getBudgetSummary,
} from '../utils/selectors.js';

export default function Budget() {
  const { state } = useAppState();
  const { budgets, transactions, categories, status } = state;
  const month = isoMonth();

  const categoryData = useMemo(
    () => getBudgetCategoryData(budgets, transactions, categories, month),
    [budgets, transactions, categories, month]
  );
  const summary = useMemo(
    () => getBudgetSummary(budgets, transactions, categories, month),
    [budgets, transactions, categories, month]
  );
  const breakdown = useMemo(() => getBudgetBreakdown(categoryData), [categoryData]);
  const monthLabel = useMemo(
    () =>
      new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [month]
  );

  if (status !== 'ready') return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Budget</h1>
          <span className="t-caption">{monthLabel}</span>
        </div>
      </header>

      {categoryData.length === 0 ? (
        <section className="card card--lg">
          <EmptyState
            title="No budgets set for this month"
            copy="Add category budgets to see remaining totals, warnings, and budget progress in one place."
          />
        </section>
      ) : (
        <>
          <section className="budget-overview-grid">
            <BudgetRemainingCard summary={summary} />
            <BudgetSpentCard summary={summary} breakdown={breakdown} />
            <BudgetSignalCard
              tone="danger"
              icon="alert"
              label="Over budget"
              value={formatCount(summary.overBudgetCount, 'category')}
              copy={
                summary.overBudgetCount > 0
                  ? 'Needs attention now'
                  : 'Everything is within plan'
              }
            />
            <BudgetSignalCard
              tone="warn"
              icon="clock"
              label="Near limit"
              value={formatCount(summary.nearLimitCount, 'category')}
              copy="At 80% of budget or more"
            />
          </section>

          <section className="card card--lg budget-categories-card">
            <header className="section-head budget-categories-card__head">
              <h2 className="section-head__title">All categories</h2>
              <span className="t-caption">{categoryData.length} tracked</span>
            </header>
            <div className="budget-category-grid">
              {categoryData.map((item) => (
                <BudgetCategoryTile key={item.categoryId} item={item} />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}

function BudgetRemainingCard({ summary }) {
  const pctLeft = Math.max(0, Math.round(summary.remainingRatio * 100));
  const isOver = summary.remaining < 0;

  return (
    <section className={`budget-summary-card budget-summary-card--remaining${isOver ? ' is-over' : ''}`}>
      <div className="budget-summary-card__eyebrow">
        {isOver ? 'Over plan' : 'Remaining'}
      </div>
      <div className="budget-summary-card__amount">
        {formatCurrency(Math.abs(summary.remaining))}
      </div>
      <div className="budget-summary-card__subtle">
        of {formatCurrency(summary.totalBudget)} total budget
      </div>
      <div className="budget-summary-card__track" aria-hidden="true">
        <div
          className="budget-summary-card__fill"
          style={{ width: `${isOver ? 100 : pctLeft}%` }}
        />
      </div>
      <div className="budget-summary-card__foot">
        {isOver
          ? `${formatCurrency(Math.abs(summary.remaining))} over total budget`
          : `${pctLeft}% of budget left`}
      </div>
    </section>
  );
}

function BudgetSpentCard({ summary, breakdown }) {
  const usedPercent = summary.totalBudget > 0 ? Math.round(summary.usedRatio * 100) : 0;

  return (
    <section className="budget-summary-card budget-summary-card--spent">
      <div className="budget-summary-card__eyebrow">Spent</div>
      <div className="budget-summary-card__amount budget-summary-card__amount--dark">
        {formatCurrency(summary.totalSpent)}
      </div>
      <div className="budget-summary-card__subtle">
        {usedPercent}% used this month
      </div>

      {breakdown.length > 0 ? (
        <>
          <div className="budget-breakdown-bar" aria-hidden="true">
            {breakdown.map((item) => (
              <span
                key={item.categoryId}
                className="budget-breakdown-bar__segment"
                style={{
                  flex: `${Math.max(item.share, 0.04)} 1 0`,
                  background: `var(${item.colorVar})`,
                }}
              />
            ))}
          </div>
          <div className="budget-breakdown-legend">
            {breakdown.map((item) => (
              <span className="budget-breakdown-legend__item" key={item.categoryId}>
                <span
                  className="budget-breakdown-legend__dot"
                  style={{ background: `var(${item.colorVar})` }}
                  aria-hidden="true"
                />
                {item.name}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="t-caption" style={{ marginTop: 18 }}>
          No spending recorded yet this month.
        </div>
      )}
    </section>
  );
}

function BudgetSignalCard({ tone, icon, label, value, copy }) {
  return (
    <section className={`budget-signal-card budget-signal-card--${tone}`}>
      <span className={`budget-signal-card__icon budget-signal-card__icon--${tone}`} aria-hidden="true">
        <Icon name={icon} size={15} />
      </span>
      <div>
        <div className="budget-signal-card__label">{label}</div>
        <div className={`budget-signal-card__value budget-signal-card__value--${tone}`}>{value}</div>
        <div className="budget-signal-card__copy">{copy}</div>
      </div>
    </section>
  );
}

function BudgetCategoryTile({ item }) {
  const badgeText =
    item.status === 'over'
      ? 'Over'
      : `${Math.round(item.ratio * 100)}%`;

  return (
    <article className={`budget-category-tile budget-category-tile--${item.status}`}>
      <div className="budget-category-tile__head">
        <span className="budget-category-tile__title row" style={{ gap: 10 }}>
          <span className="budget-category-tile__icon" aria-hidden="true">
            <CategoryIcon categoryId={item.categoryId} size={15} />
          </span>
          <span className="budget-category-tile__name">{item.name}</span>
        </span>
        <span className={`budget-category-tile__badge budget-category-tile__badge--${item.status}`}>
          {badgeText}
        </span>
      </div>

      <div className="budget-category-tile__amount tnum">{formatCurrency(item.spent)}</div>
      <div className="budget-category-tile__meta">of {formatCurrency(item.budget)}</div>

      <div className="budget-category-tile__progress">
        <ProgressBar value={item.spent} max={item.budget || item.spent || 1} />
      </div>

      <div className={`budget-category-tile__delta budget-category-tile__delta--${item.status}`}>
        {item.status === 'over'
          ? `${formatCurrency(item.overBy)} over limit`
          : `${formatCurrency(item.remaining)} left`}
      </div>
    </article>
  );
}

function formatCount(value, noun) {
  const plural = noun.endsWith('y') ? `${noun.slice(0, -1)}ies` : `${noun}s`;
  return `${value} ${value === 1 ? noun : plural}`;
}
