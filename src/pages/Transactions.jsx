import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppState } from '../state/AppState.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import TransactionRow from '../components/TransactionRow.jsx';
import Chip from '../components/Chip.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import Skeleton from '../components/Skeleton.jsx';
import Icon from '../components/Icon.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import {
  groupByDay,
  categoryById,
  accountById,
} from '../utils/selectors.js';
import { formatCurrency, formatDayLabel, fullDate } from '../utils/format.js';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'amount-desc', label: 'Highest amount' },
  { value: 'amount-asc', label: 'Lowest amount' },
];

const DATE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: 'month', label: 'This month' },
];

export default function Transactions() {
  const { state } = useAppState();
  const { transactions, categories, accounts, status, error } = state;

  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [accountId, setAccountId] = useState('all');
  const [dateRange, setDateRange] = useLocalStorage('et:tx-date-range', 'month');
  const [sort, setSort] = useLocalStorage('et:tx-sort', 'newest');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = transactions.filter((t) => {
      if (type !== 'all' && t.type !== type) return false;
      if (categoryId !== 'all' && t.categoryId !== categoryId) return false;
      if (accountId !== 'all' && t.accountId !== accountId) return false;
      if (q) {
        const hay = `${t.merchant} ${t.note || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (dateRange !== 'all') {
        const today = new Date();
        const tDate = new Date(`${t.date}T00:00:00`);
        if (dateRange === 'month') {
          if (tDate.getMonth() !== today.getMonth() || tDate.getFullYear() !== today.getFullYear()) return false;
        } else {
          const diff = (today - tDate) / 86_400_000;
          if (diff > Number(dateRange)) return false;
        }
      }
      return true;
    });
    list = list.slice();
    switch (sort) {
      case 'oldest':
        list.sort((a, b) => (a.date < b.date ? -1 : 1));
        break;
      case 'amount-desc':
        list.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        break;
      case 'amount-asc':
        list.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
        break;
      case 'newest':
      default:
        list.sort((a, b) => (a.date < b.date ? 1 : -1));
    }
    return list;
  }, [transactions, search, type, categoryId, accountId, dateRange, sort]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);

  const params = useParams();
  const activeId = params.id;
  const selected = activeId
    ? filtered.find((t) => t.id === activeId)
    : filtered[0];

  if (status === 'loading' || status === 'idle') {
    return <TransactionsSkeleton />;
  }

  if (status === 'error') {
    return (
      <ErrorBanner
        message={`Couldn't load transactions — ${error || 'unknown error'}.`}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Transactions</h1>
          <span className="t-caption">{filtered.length} of {transactions.length} entries</span>
        </div>
        <div className="topbar__actions">
          <label className="search" aria-label="Search transactions">
            <Icon name="search" size={14} />
            <input
              type="search"
              placeholder={`Search ${transactions.length} entries`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button type="button" className="btn btn--secondary">
            <Icon name="download" size={14} strokeWidth={1.8} />
            Export
          </button>
          <Link to="/add" className="btn btn--primary">
            <Icon name="plus" size={14} strokeWidth={2} />
            Add entry
          </Link>
        </div>
      </header>

      <div className="tx-toolbar" role="group" aria-label="Transaction filters">
        <Chip selected={type !== 'all'} as="label">
          <Icon name="filter" size={12} strokeWidth={1.7} />
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
            <option value="all">All types</option>
            <option value="expense">Expenses</option>
            <option value="income">Income</option>
          </select>
        </Chip>
        <Chip selected={categoryId !== 'all'} as="label">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Filter by category">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Chip>
        <Chip selected={accountId !== 'all'} as="label">
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} aria-label="Filter by account">
            <option value="all">All accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </Chip>
        <Chip secondary selected={dateRange !== 'all'} as="label">
          <Icon name="calendar" size={12} strokeWidth={1.7} />
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} aria-label="Date range">
            {DATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Chip>
        <Chip as="label">
          <Icon name="sort" size={12} strokeWidth={1.7} />
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>Sort: {o.label}</option>
            ))}
          </select>
        </Chip>
      </div>

      <div className="tx-layout">
        <section className="card card--lg" aria-label="Transaction list">
          {filtered.length === 0 ? (
            <EmptyState
              title="No matching transactions"
              copy="Try clearing a filter or widening your date range."
              action={
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    setSearch(''); setType('all'); setCategoryId('all');
                    setAccountId('all'); setDateRange('all');
                  }}
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            grouped.map((group) => (
              <div className="daygroup" key={group.date}>
                <div className="daygroup__head">
                  <span className="daygroup__date">{formatDayLabel(group.date)}</span>
                  <span className="daygroup__total tnum">
                    {group.total >= 0 ? '+' : '−'}
                    {formatCurrency(Math.abs(group.total))}
                  </span>
                </div>
                <div className="daygroup__list">
                  {group.items.map((t) => (
                    <TransactionRow
                      key={t.id}
                      transaction={t}
                      category={categoryById(categories, t.categoryId)}
                      account={accountById(accounts, t.accountId)}
                      active={selected?.id === t.id}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        <aside className="tx-detail" aria-label="Transaction preview">
          {selected ? (
            <DetailPreview
              transaction={selected}
              category={categoryById(categories, selected.categoryId)}
              account={accountById(accounts, selected.accountId)}
            />
          ) : (
            <div className="card card--lg">
              <div className="t-eyebrow">Detail</div>
              <p className="t-body" style={{ marginTop: 12, color: 'var(--text-2)' }}>
                Select an entry to see details here.
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function DetailPreview({ transaction, category, account }) {
  const isIncome = transaction.type === 'income';
  return (
    <div className="card card--lg">
      <div className="row row--between" style={{ marginBottom: 14 }}>
        <span className="t-eyebrow">Detail</span>
        <Link to={`/transactions/${transaction.id}`} className="section-head__action">Open</Link>
      </div>
      <div className="tx-detail__hero">
        <div className="tx-detail__icon">
          <CategoryIcon categoryId={transaction.categoryId} size={26} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500 }}>{transaction.merchant}</div>
          <div className="t-caption">{fullDate(transaction.date)}</div>
        </div>
      </div>
      <div className={`tx-detail__amount${isIncome ? ' tx-detail__amount--income' : ''} tnum`}>
        {isIncome ? '+' : '−'}
        {formatCurrency(Math.abs(transaction.amount))}
      </div>
      <div className="tx-detail__list">
        <div className="row row--between"><span>Category</span><span>{category?.name || '—'}</span></div>
        <div className="row row--between"><span>Account</span><span>{account?.name || '—'}</span></div>
        <div className="row row--between"><span>Type</span><span>{isIncome ? 'Income' : 'Expense'}</span></div>
        <div className="row row--between"><span>Recurring</span><span>{transaction.recurring ? 'Yes' : '—'}</span></div>
      </div>
      {transaction.note && (
        <>
          <div className="tx-detail__divider" />
          <div className="t-caption" style={{ marginBottom: 4 }}>Note</div>
          <p className="t-body" style={{ color: 'var(--ink)' }}>{transaction.note}</p>
        </>
      )}
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <>
      <header className="topbar">
        <Skeleton width={180} height={26} />
        <Skeleton width={300} height={36} radius={10} />
      </header>
      <div className="tx-toolbar">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width={120} height={28} radius={100} />
        ))}
      </div>
      <Skeleton height={420} radius={16} />
    </>
  );
}
