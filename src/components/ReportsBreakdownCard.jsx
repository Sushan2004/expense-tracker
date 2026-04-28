import PropTypes from 'prop-types';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CategoryIcon from './CategoryIcon.jsx';
import EmptyState from './EmptyState.jsx';
import Icon from './Icon.jsx';
import SankeyFlowChart from './SankeyFlowChart.jsx';
import SegmentedControl from './SegmentedControl.jsx';
import SpendingDoughnutChart from './SpendingDoughnutChart.jsx';
import { getCategoryAccentStyle, resolveCategoryColor } from '../utils/categoryAppearance.js';
import { formatCurrency, fullDate } from '../utils/format.js';
import { categoryById } from '../utils/selectors.js';

const VIEWS = [
  { value: 'bars', label: 'Breakdown' },
  { value: 'flow', label: 'Flow' },
];

export default function ReportsBreakdownCard({
  spending,
  expenseTransactions,
  categories,
  flowData,
  resolvedTheme,
  view,
  onViewChange,
  hasAnyTransactions,
  hasPeriodTransactions,
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const expandButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  const canExpand = view === 'bars' ? spending.length > 0 : flowData.links.length > 0;

  useEffect(() => {
    if (view !== 'bars') return;

    if (spending.length === 0) {
      setActiveCategoryId(null);
      return;
    }

    if (!spending.some((item) => item.categoryId === activeCategoryId)) {
      setActiveCategoryId(spending[0].categoryId);
    }
  }, [activeCategoryId, spending, view]);

  useEffect(() => {
    if (!expanded) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeExpanded();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [expanded]);

  function openExpanded() {
    if (!canExpand) return;
    setExpanded(true);
  }

  function closeExpanded() {
    setExpanded(false);
    window.requestAnimationFrame(() => {
      expandButtonRef.current?.focus();
    });
  }

  const dialogCopy =
    view === 'bars'
      ? 'Expanded view of this period\'s spending breakdown and category transactions.'
      : 'Expanded view of how income flows into spending categories and savings.';

  return (
    <>
      <section className="card card--lg reports-breakdown" aria-label="Spending breakdown">
        <div className="reports-breakdown__header">
          <h2 className="t-h2">Spending breakdown</h2>
          <div className="reports-breakdown__actions">
            <SegmentedControl value={view} options={VIEWS} onChange={onViewChange} ariaLabel="Chart view" />
            {canExpand ? (
              <button
                ref={expandButtonRef}
                type="button"
                className="reports-breakdown__expand"
                onClick={openExpanded}
                aria-label={view === 'bars' ? 'Expand spending breakdown' : 'Expand money flow chart'}
              >
                <Icon name="expand" size={15} strokeWidth={1.8} />
              </button>
            ) : null}
          </div>
        </div>

        <BreakdownContent
          spending={spending}
          expenseTransactions={expenseTransactions}
          categories={categories}
          flowData={flowData}
          resolvedTheme={resolvedTheme}
          view={view}
          expanded={false}
          activeCategoryId={activeCategoryId}
          onActiveCategoryChange={setActiveCategoryId}
          hasAnyTransactions={hasAnyTransactions}
          hasPeriodTransactions={hasPeriodTransactions}
        />
      </section>

      {expanded && portalTarget
        ? createPortal(
            <div
              className="sheet-backdrop reports-breakdown__backdrop"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  closeExpanded();
                }
              }}
            >
              <section
                className="sheet reports-breakdown__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={dialogTitleId}
                aria-describedby={dialogDescriptionId}
              >
                <div className="reports-breakdown__dialog-head">
                  <div className="reports-breakdown__dialog-copy">
                    <h2 id={dialogTitleId} className="t-h2">Spending breakdown</h2>
                    <p id={dialogDescriptionId} className="reports-breakdown__dialog-text">
                      {dialogCopy}
                    </p>
                  </div>
                  <div className="reports-breakdown__dialog-actions">
                    <SegmentedControl value={view} options={VIEWS} onChange={onViewChange} ariaLabel="Expanded chart view" />
                    <button
                      ref={closeButtonRef}
                      type="button"
                      className="reports-breakdown__close"
                      onClick={closeExpanded}
                      aria-label="Close expanded spending breakdown"
                    >
                      <Icon name="x" size={16} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                <div className="reports-breakdown__dialog-body">
                  <BreakdownContent
                    spending={spending}
                    expenseTransactions={expenseTransactions}
                    categories={categories}
                    flowData={flowData}
                    resolvedTheme={resolvedTheme}
                    view={view}
                    expanded
                    activeCategoryId={activeCategoryId}
                    onActiveCategoryChange={setActiveCategoryId}
                    hasAnyTransactions={hasAnyTransactions}
                    hasPeriodTransactions={hasPeriodTransactions}
                  />
                </div>
              </section>
            </div>,
            portalTarget
          )
        : null}
    </>
  );
}

function BreakdownContent({
  spending,
  expenseTransactions,
  categories,
  flowData,
  resolvedTheme,
  view,
  expanded,
  activeCategoryId,
  onActiveCategoryChange,
  hasAnyTransactions,
  hasPeriodTransactions,
}) {
  if (view === 'flow') {
    return (
      <FlowBreakdown
        data={flowData}
        resolvedTheme={resolvedTheme}
        expanded={expanded}
        hasAnyTransactions={hasAnyTransactions}
        hasPeriodTransactions={hasPeriodTransactions}
      />
    );
  }

  return (
    <DoughnutBreakdown
      spending={spending}
      expenseTransactions={expenseTransactions}
      categories={categories}
      resolvedTheme={resolvedTheme}
      expanded={expanded}
      activeCategoryId={activeCategoryId}
      onActiveCategoryChange={onActiveCategoryChange}
      hasAnyTransactions={hasAnyTransactions}
      hasPeriodTransactions={hasPeriodTransactions}
    />
  );
}

function DoughnutBreakdown({
  spending,
  expenseTransactions,
  categories,
  resolvedTheme,
  expanded,
  activeCategoryId,
  onActiveCategoryChange,
  hasAnyTransactions,
  hasPeriodTransactions,
}) {
  const total = spending.reduce((sum, item) => sum + item.amount, 0);
  const segments = useMemo(() => {
    const transactionsByCategory = new Map();

    expenseTransactions.forEach((transaction) => {
      if (!transactionsByCategory.has(transaction.categoryId)) {
        transactionsByCategory.set(transaction.categoryId, []);
      }
      transactionsByCategory.get(transaction.categoryId).push(transaction);
    });

    return spending.map((item) => {
      const category = categoryById(categories, item.categoryId);
      const transactions = [...(transactionsByCategory.get(item.categoryId) || [])].sort((a, b) => {
        if (a.date === b.date) return Math.abs(b.amount) - Math.abs(a.amount);
        return a.date < b.date ? 1 : -1;
      });

      return {
        categoryId: item.categoryId,
        name: category?.name || 'Other',
        icon: category?.icon,
        colorVar: category?.colorVar,
        amount: item.amount,
        share: total > 0 ? item.amount / total : 0,
        transactionCount: transactions.length,
        transactions,
      };
    });
  }, [categories, expenseTransactions, spending, total]);

  const activeSegment = segments.find((segment) => segment.categoryId === activeCategoryId) || segments[0] || null;

  if (segments.length === 0) {
    const emptyCopy = !hasAnyTransactions
      ? 'Add expenses to see your breakdown.'
      : hasPeriodTransactions
        ? 'Add expenses to see your breakdown.'
        : 'No spending data yet. Add expenses to see your breakdown.';

    return (
      <div className={`reports-breakdown__empty${expanded ? ' is-expanded' : ''}`}>
        <EmptyState
          title="No spending data yet"
          copy={emptyCopy}
        />
      </div>
    );
  }

  return (
    <div className={`reports-breakdown-detail${expanded ? ' reports-breakdown-detail--expanded' : ''}`}>
      <div className="reports-breakdown-detail__summary">
        <SpendingDoughnutChart
          segments={segments}
          total={total}
          theme={resolvedTheme}
          expanded={expanded}
          activeCategoryId={activeSegment?.categoryId || null}
          onSelectCategory={onActiveCategoryChange}
        />
        <div className="reports-breakdown-detail__caption">
          <span className="reports-breakdown-detail__caption-title">Category details</span>
          <span className="reports-breakdown-detail__caption-copy">
            Select a chart slice or category row to inspect the expense transactions behind it.
          </span>
        </div>
      </div>

      <div className="reports-category-breakdown" aria-label="Detailed category spending breakdown">
        {segments.map((segment) => {
          const isActive = segment.categoryId === activeSegment?.categoryId;
          const itemId = `reports-category-${segment.categoryId}`;

          return (
            <section
              key={segment.categoryId}
              className={`reports-category-breakdown__item${isActive ? ' is-active' : ''}`}
            >
              <button
                type="button"
                className="reports-category-breakdown__toggle"
                aria-expanded={isActive}
                aria-controls={itemId}
                onClick={() => onActiveCategoryChange(segment.categoryId)}
              >
                <span className="reports-category-breakdown__main">
                  <span
                    className="reports-category-breakdown__icon"
                    style={getCategoryAccentStyle(segment.colorVar, 0.15)}
                    aria-hidden="true"
                  >
                    <CategoryIcon category={segment} categoryId={segment.categoryId} size={15} />
                  </span>

                  <span className="reports-category-breakdown__copy">
                    <span className="reports-category-breakdown__name-row">
                      <span className="reports-category-breakdown__name">{segment.name}</span>
                      <span
                        className="reports-category-breakdown__dot"
                        style={{ backgroundColor: resolveCategoryColor(segment.colorVar) }}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="reports-category-breakdown__meta">
                      {formatCount(segment.transactionCount, 'transaction')} / {Math.round(segment.share * 100)}% of spending
                    </span>
                  </span>
                </span>

                <span className="reports-category-breakdown__stats">
                  <span className="reports-category-breakdown__amount tnum">{formatCurrency(segment.amount)}</span>
                  <span className="reports-category-breakdown__share tnum">{Math.round(segment.share * 100)}%</span>
                  <span className="reports-category-breakdown__chevron" aria-hidden="true">
                    <Icon name={isActive ? 'arrowUp' : 'arrowDown'} size={14} strokeWidth={1.8} />
                  </span>
                </span>
              </button>

              {isActive ? (
                <div id={itemId} className="reports-category-breakdown__panel">
                  <div className="reports-category-breakdown__transactions">
                    {segment.transactions.map((transaction) => (
                      <article key={transaction.id} className="reports-category-breakdown__transaction">
                        <div className="reports-category-breakdown__transaction-main">
                          <div className="reports-category-breakdown__transaction-name">
                            {transaction.merchant || segment.name}
                          </div>
                          <div className="reports-category-breakdown__transaction-date">
                            {fullDate(transaction.date)}
                          </div>
                          {transaction.note ? (
                            <div className="reports-category-breakdown__transaction-note">
                              {transaction.note}
                            </div>
                          ) : null}
                        </div>

                        <div className="reports-category-breakdown__transaction-amount tnum">
                          {formatCurrency(Math.abs(transaction.amount))}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function FlowBreakdown({ data, resolvedTheme, expanded, hasAnyTransactions, hasPeriodTransactions }) {
  if (!data.links.length) {
    const emptyCopy = !hasAnyTransactions
      ? 'Saving rate will appear after you add income and expenses.'
      : hasPeriodTransactions
        ? 'Add both income and expenses in this period to see money flow.'
        : 'No money flow data is available for this period yet.';

    return (
      <div className={`reports-breakdown__empty${expanded ? ' is-expanded' : ''}`}>
        <EmptyState
          title="No money flow data yet"
          copy={emptyCopy}
        />
      </div>
    );
  }

  return (
    <div className={`reports-flow${expanded ? ' reports-flow--expanded' : ''}`}>
      <div className="reports-flow__caption t-caption">
        Income flows into a shared money pool, then into your biggest spending categories and savings.
      </div>
      <SankeyFlowChart
        data={data}
        theme={resolvedTheme}
        height={expanded ? 520 : 360}
        framed={false}
        className="reports-flow-chart"
      />
    </div>
  );
}

function formatCount(value, noun) {
  return `${value} ${value === 1 ? noun : `${noun}s`}`;
}

ReportsBreakdownCard.propTypes = {
  spending: PropTypes.arrayOf(
    PropTypes.shape({
      categoryId: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
    })
  ).isRequired,
  expenseTransactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      merchant: PropTypes.string,
      amount: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
      note: PropTypes.string,
      categoryId: PropTypes.string.isRequired,
    })
  ).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      icon: PropTypes.string,
      colorVar: PropTypes.string,
    })
  ).isRequired,
  flowData: SankeyFlowChart.propTypes.data,
  resolvedTheme: PropTypes.oneOf(['light', 'dark']).isRequired,
  view: PropTypes.oneOf(['bars', 'flow']).isRequired,
  onViewChange: PropTypes.func.isRequired,
  hasAnyTransactions: PropTypes.bool.isRequired,
  hasPeriodTransactions: PropTypes.bool.isRequired,
};

BreakdownContent.propTypes = {
  spending: ReportsBreakdownCard.propTypes.spending,
  expenseTransactions: ReportsBreakdownCard.propTypes.expenseTransactions,
  categories: ReportsBreakdownCard.propTypes.categories,
  flowData: SankeyFlowChart.propTypes.data,
  resolvedTheme: ReportsBreakdownCard.propTypes.resolvedTheme,
  view: PropTypes.oneOf(['bars', 'flow']).isRequired,
  expanded: PropTypes.bool.isRequired,
  activeCategoryId: PropTypes.string,
  onActiveCategoryChange: PropTypes.func.isRequired,
  hasAnyTransactions: PropTypes.bool.isRequired,
  hasPeriodTransactions: PropTypes.bool.isRequired,
};

DoughnutBreakdown.propTypes = {
  spending: ReportsBreakdownCard.propTypes.spending,
  expenseTransactions: ReportsBreakdownCard.propTypes.expenseTransactions,
  categories: ReportsBreakdownCard.propTypes.categories,
  resolvedTheme: ReportsBreakdownCard.propTypes.resolvedTheme,
  expanded: PropTypes.bool.isRequired,
  activeCategoryId: PropTypes.string,
  onActiveCategoryChange: PropTypes.func.isRequired,
  hasAnyTransactions: PropTypes.bool.isRequired,
  hasPeriodTransactions: PropTypes.bool.isRequired,
};

FlowBreakdown.propTypes = {
  data: SankeyFlowChart.propTypes.data,
  resolvedTheme: ReportsBreakdownCard.propTypes.resolvedTheme,
  expanded: PropTypes.bool.isRequired,
  hasAnyTransactions: PropTypes.bool.isRequired,
  hasPeriodTransactions: PropTypes.bool.isRequired,
};
