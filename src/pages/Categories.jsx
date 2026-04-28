import { useMemo, useState } from 'react';
import CategoryCreator from '../components/CategoryCreator.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import Icon from '../components/Icon.jsx';
import { useAppState } from '../state/AppState.jsx';
import { formatCurrency } from '../utils/format.js';
import { getCategoryAccentStyle } from '../utils/categoryAppearance.js';
import { uniqueId } from '../utils/selectors.js';

export default function Categories() {
  const { state, dispatch } = useAppState();
  const { categories, transactions, status } = state;
  const [isAdding, setIsAdding] = useState(false);

  const counts = useMemo(() => {
    const map = new Map();

    transactions.forEach((transaction) => {
      const key = transaction.categoryId;
      if (!map.has(key)) map.set(key, { count: 0, sum: 0 });
      const entry = map.get(key);
      entry.count += 1;
      entry.sum += Math.abs(transaction.amount);
    });

    return map;
  }, [transactions]);

  const customCount = categories.filter((category) => !category.builtin).length;

  if (status !== 'ready') return null;

  function handleCreateCategory(payload) {
    dispatch({
      type: 'category/add',
      payload: {
        id: uniqueId('cat'),
        ...payload,
        builtin: false,
      },
    });
    dispatch({
      type: 'toast/show',
      payload: { message: 'Category added successfully.', kind: 'success' },
    });
    setIsAdding(false);
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Categories</h1>
          <span className="t-caption">
            {customCount > 0
              ? `${categories.length} total categories, including ${customCount} custom`
              : 'Built-in defaults ready for manual tracking'}
          </span>
        </div>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => setIsAdding((value) => !value)}
        >
          <Icon name={isAdding ? 'minus' : 'plus'} size={14} strokeWidth={2} />
          {isAdding ? 'Close' : 'New category'}
        </button>
      </header>

      {isAdding ? (
        <CategoryCreator
          categories={categories}
          onCancel={() => setIsAdding(false)}
          onSave={handleCreateCategory}
        />
      ) : null}

      <section className="card card--lg">
        <div className="stack" style={{ gap: 0 }}>
          {categories.map((category, index) => {
            const stats = counts.get(category.id) || { count: 0, sum: 0 };
            const avg = stats.count ? stats.sum / stats.count : 0;
            const hasEntries = stats.count > 0;

            return (
              <div
                key={category.id}
                className="category-row"
                style={{
                  borderTop: index === 0 ? 'none' : '0.5px solid var(--border)',
                }}
              >
                <span className="row" style={{ gap: 12 }}>
                  <span
                    className="category-row__icon"
                    style={getCategoryAccentStyle(category.colorVar, 0.14)}
                  >
                    <CategoryIcon category={category} size={20} />
                  </span>
                  <span>
                    <div className="category-row__title">
                      <span
                        className="category-row__dot"
                        style={{ background: category.colorVar }}
                        aria-hidden="true"
                      />
                      {category.name}
                      <span className={`category-row__badge${category.builtin ? ' is-builtin' : ''}`}>
                        {category.builtin ? 'Built-in' : 'Custom'}
                      </span>
                    </div>
                    <div className="t-caption">
                      {hasEntries
                        ? `${stats.count} ${stats.count === 1 ? 'entry' : 'entries'} - avg ${formatCurrency(avg)}`
                        : 'No entries yet'}
                    </div>
                  </span>
                </span>
                <span className="tnum category-row__amount">
                  {hasEntries ? formatCurrency(stats.sum) : '-'}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
