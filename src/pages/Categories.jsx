import { useMemo } from 'react';
import { useAppState } from '../state/AppState.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import Icon from '../components/Icon.jsx';
import { formatCurrency } from '../utils/format.js';

export default function Categories() {
  const { state } = useAppState();
  const { categories, transactions, status } = state;

  const counts = useMemo(() => {
    const map = new Map();
    for (const t of transactions) {
      const key = t.categoryId;
      if (!map.has(key)) map.set(key, { count: 0, sum: 0 });
      const entry = map.get(key);
      entry.count += 1;
      entry.sum += Math.abs(t.amount);
    }
    return map;
  }, [transactions]);

  if (status !== 'ready') return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Categories</h1>
          <span className="t-caption">Default categories · drag to reorder (coming soon)</span>
        </div>
        <button type="button" className="btn btn--primary">
          <Icon name="plus" size={14} strokeWidth={2} />
          New category
        </button>
      </header>

      <section className="card card--lg">
        <div className="stack" style={{ gap: 0 }}>
          {categories.map((c, i) => {
            const stats = counts.get(c.id) || { count: 0, sum: 0 };
            const avg = stats.count ? stats.sum / stats.count : 0;
            return (
              <div
                key={c.id}
                className="row row--between"
                style={{
                  padding: '14px 4px',
                  borderTop: i === 0 ? 'none' : '0.5px solid var(--border)',
                }}
              >
                <span className="row" style={{ gap: 12 }}>
                  <span style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'var(--mint-wash)', color: 'var(--forest)',
                    display: 'grid', placeItems: 'center',
                  }}>
                    <CategoryIcon categoryId={c.id} size={20} />
                  </span>
                  <span>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                    <div className="t-caption">
                      {stats.count} {stats.count === 1 ? 'entry' : 'entries'} · avg {formatCurrency(avg)}
                    </div>
                  </span>
                </span>
                <span className="row" style={{ gap: 8 }}>
                  <span className="tnum" style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    {formatCurrency(stats.sum)}
                  </span>
                  <button type="button" className="btn btn--ghost" aria-label={`Edit ${c.name}`}>
                    <Icon name="more" size={16} />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
