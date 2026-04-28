import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import BalanceCard from '../components/BalanceCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import Icon from '../components/Icon.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import Skeleton from '../components/Skeleton.jsx';
import TransactionRow from '../components/TransactionRow.jsx';
import { useAppState } from '../state/AppState.jsx';
import { formatCurrency, greetingFor, isoMonth } from '../utils/format.js';
import {
  accountById,
  categoryById,
  monthTotals,
  spendingByCategory,
  totalBalance,
} from '../utils/selectors.js';

export default function Dashboard() {
  const { state } = useAppState();
  const { user, accounts, transactions, categories, budgets, status, error } = state;
  const month = isoMonth();

  const totals = useMemo(() => monthTotals(transactions, month), [transactions, month]);
  const total = useMemo(() => totalBalance(accounts), [accounts]);
  const cashflowTotal = totals.income - totals.spending;
  const recent = useMemo(
    () => [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5),
    [transactions]
  );
  const topSpend = useMemo(
    () => spendingByCategory(transactions, month).slice(0, 4),
    [transactions, month]
  );
  const monthBudget = useMemo(
    () => budgets.filter((budget) => budget.month === month).reduce((sum, budget) => sum + budget.amount, 0),
    [budgets, month]
  );
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const hasTransactions = transactions.length > 0;
  const hasAccounts = accounts.length > 0;
  const hasBudgets = budgets.some((budget) => budget.month === month);

  if (status === 'loading' || status === 'idle') {
    return <DashboardSkeleton />;
  }

  if (status === 'error') {
    return (
      <ErrorBanner
        message={`Couldn't load your data - ${error || 'unknown error'}.`}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <span className="topbar__date">{dateLabel}</span>
          <h1 className="topbar__title">
            {greetingFor()}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
        </div>
        <div className="topbar__actions">
          <label className="search" aria-label="Search transactions">
            <Icon name="search" size={14} />
            <input type="search" placeholder="Search" />
            <span className="search__kbd" aria-hidden="true">Ctrl K</span>
          </label>
        </div>
      </header>

      <div className="dash-grid">
        <div className="stack">
          {hasTransactions ? (
            <BalanceCard
              total={hasAccounts ? total : cashflowTotal}
              income={totals.income}
              spending={totals.spending}
              savingsRate={totals.savingsRate}
              accountsCount={accounts.length}
              mode={hasAccounts ? 'balance' : 'cashflow'}
            />
          ) : (
            <section className="card card--lg">
              <EmptyState
                title="No transactions yet"
                copy="Dashboard totals and saving rate will appear after you add income and expenses."
              />
            </section>
          )}

          <section className="card card--lg">
            <header className="section-head">
              <h2 className="section-head__title">Recent transactions</h2>
              <Link to="/transactions" className="section-head__action">See all</Link>
            </header>
            {recent.length === 0 ? (
              <EmptyState
                title="No transactions yet"
                copy="Your recent activity will appear here after you add your first entry."
              />
            ) : (
              <div className="stack" style={{ gap: 4 }}>
                {recent.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    category={categoryById(categories, transaction.categoryId)}
                    account={accountById(accounts, transaction.accountId)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="stack">
          <section className="card card--lg">
            <div className="section-head">
              <h2 className="section-head__title">This month's budget</h2>
            </div>
            {hasBudgets ? (
              <div className="row" style={{ gap: 18 }}>
                <ProgressRing
                  value={totals.spending}
                  max={monthBudget || 1}
                  size={120}
                  stroke={10}
                  label={`${monthBudget > 0 ? Math.round((totals.spending / monthBudget) * 100) : 0}%`}
                  sublabel="spent"
                />
                <div style={{ flex: 1 }}>
                  <div className="t-caption">Remaining</div>
                  <div className="tnum" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>
                    {formatCurrency(Math.max(0, monthBudget - totals.spending))}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
                    of {formatCurrency(monthBudget, { compact: true })} total
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No budgets set for this month"
                copy="Add category budgets to track remaining totals and warnings here."
              />
            )}
          </section>

          <section className="card card--lg">
            <header className="section-head">
              <h2 className="section-head__title">Spending by category</h2>
              <Link to="/reports" className="section-head__action">Details</Link>
            </header>
            {topSpend.length === 0 ? (
              <EmptyState
                title="No spending data available"
                copy="Add your first expense to see category trends."
              />
            ) : (
              topSpend.map(({ categoryId, amount }) => {
                const category = categoryById(categories, categoryId);
                const budget = budgets.find(
                  (item) => item.categoryId === categoryId && item.month === month
                );
                const max = budget?.amount || amount;

                return (
                  <div className="spend-row" key={categoryId}>
                    <div className="spend-row__head">
                      <span className="spend-row__name">{category?.name || 'Other'}</span>
                      <span
                        className={`spend-row__amount${
                          max && amount / max > 1 ? ' spend-row__amount--danger' : ''
                        }${
                          max && amount / max >= 0.8 && amount / max <= 1
                            ? ' spend-row__amount--warn'
                            : ''
                        } tnum`}
                      >
                        {formatCurrency(amount, { compact: amount >= 100 })}
                      </span>
                    </div>
                    <ProgressBar value={amount} max={max || amount} />
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <Skeleton width={120} height={12} />
          <Skeleton width={220} height={26} style={{ marginTop: 6 }} />
        </div>
        <Skeleton width={180} height={36} radius={10} />
      </header>
      <div className="dash-grid">
        <div className="stack">
          <Skeleton height={170} radius={16} />
          <Skeleton height={260} radius={16} />
        </div>
        <div className="stack">
          <Skeleton height={150} radius={16} />
          <Skeleton height={220} radius={16} />
        </div>
      </div>
    </>
  );
}
