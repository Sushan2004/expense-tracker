import PropTypes from 'prop-types';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CategoryIcon from './CategoryIcon.jsx';
import EmptyState from './EmptyState.jsx';
import Icon from './Icon.jsx';
import SankeyFlowChart from './SankeyFlowChart.jsx';
import SegmentedControl from './SegmentedControl.jsx';
import { getCategoryAccentStyle, DEFAULT_CATEGORY_COLOR } from '../utils/categoryAppearance.js';
import { formatCurrency } from '../utils/format.js';
import { categoryById } from '../utils/selectors.js';

const VIEWS = [
  { value: 'bars', label: 'Bars' },
  { value: 'flow', label: 'Flow' },
];

export default function ReportsBreakdownCard({
  spending,
  categories,
  flowData,
  view,
  onViewChange,
  hasAnyTransactions,
  hasPeriodTransactions,
}) {
  const [expanded, setExpanded] = useState(false);
  const expandButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  const canExpand = view === 'bars' ? spending.length > 0 : flowData.links.length > 0;

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
      ? 'Expanded view of this period\'s category spending.'
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
          categories={categories}
          flowData={flowData}
          view={view}
          expanded={false}
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
                    categories={categories}
                    flowData={flowData}
                    view={view}
                    expanded
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
  categories,
  flowData,
  view,
  expanded,
  hasAnyTransactions,
  hasPeriodTransactions,
}) {
  if (view === 'flow') {
    return (
      <FlowBreakdown
        data={flowData}
        expanded={expanded}
        hasAnyTransactions={hasAnyTransactions}
        hasPeriodTransactions={hasPeriodTransactions}
      />
    );
  }

  return (
    <BarsBreakdown
      spending={spending}
      categories={categories}
      expanded={expanded}
      hasAnyTransactions={hasAnyTransactions}
      hasPeriodTransactions={hasPeriodTransactions}
    />
  );
}

function BarsBreakdown({
  spending,
  categories,
  expanded,
  hasAnyTransactions,
  hasPeriodTransactions,
}) {
  const max = Math.max(1, ...spending.map((item) => item.amount));
  const total = spending.reduce((sum, item) => sum + item.amount, 0);

  if (spending.length === 0) {
    const emptyCopy = !hasAnyTransactions
      ? 'Add your first expense to see reports and category trends.'
      : hasPeriodTransactions
        ? 'Add an expense in this period to compare categories here.'
        : 'No spending data is available for this period yet.';

    return (
      <div className={`reports-breakdown__empty${expanded ? ' is-expanded' : ''}`}>
        <EmptyState
          title="No spending data available"
          copy={emptyCopy}
        />
      </div>
    );
  }

  return (
    <div className={`reports-bars${expanded ? ' reports-bars--expanded' : ''}`}>
      {spending.map((item) => {
        const category = categoryById(categories, item.categoryId);
        const ratio = (item.amount / max) * 100;
        const share = total > 0 ? item.amount / total : 0;
        const fill = category?.colorVar || DEFAULT_CATEGORY_COLOR;

        return (
          <div key={item.categoryId} className="reports-bars__row">
            <div className="reports-bars__head">
              <div className="reports-bars__label-group">
                <span className="reports-bars__label-row">
                  <span className="reports-bars__icon" style={getCategoryAccentStyle(category?.colorVar, 0.14)}>
                    <CategoryIcon category={category} categoryId={item.categoryId} size={14} />
                  </span>
                  <span className="reports-bars__label">{category?.name || 'Other'}</span>
                </span>
                {expanded ? (
                  <span className="reports-bars__share">{Math.round(share * 100)}% of spending</span>
                ) : null}
              </div>
              <span className="reports-bars__value tnum">{formatCurrency(item.amount)}</span>
            </div>
            <div className="reports-bars__track">
              <div
                className="reports-bars__fill"
                style={{ width: `${ratio}%`, background: fill }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FlowBreakdown({ data, expanded, hasAnyTransactions, hasPeriodTransactions }) {
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
        height={expanded ? 520 : 360}
        framed={false}
        className="reports-flow-chart"
      />
    </div>
  );
}

ReportsBreakdownCard.propTypes = {
  spending: PropTypes.arrayOf(
    PropTypes.shape({
      categoryId: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
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
  view: PropTypes.oneOf(['bars', 'flow']).isRequired,
  onViewChange: PropTypes.func.isRequired,
  hasAnyTransactions: PropTypes.bool.isRequired,
  hasPeriodTransactions: PropTypes.bool.isRequired,
};

BreakdownContent.propTypes = {
  spending: ReportsBreakdownCard.propTypes.spending,
  categories: ReportsBreakdownCard.propTypes.categories,
  flowData: SankeyFlowChart.propTypes.data,
  view: PropTypes.oneOf(['bars', 'flow']).isRequired,
  expanded: PropTypes.bool.isRequired,
  hasAnyTransactions: PropTypes.bool.isRequired,
  hasPeriodTransactions: PropTypes.bool.isRequired,
};

BarsBreakdown.propTypes = {
  spending: ReportsBreakdownCard.propTypes.spending,
  categories: ReportsBreakdownCard.propTypes.categories,
  expanded: PropTypes.bool.isRequired,
  hasAnyTransactions: PropTypes.bool.isRequired,
  hasPeriodTransactions: PropTypes.bool.isRequired,
};

FlowBreakdown.propTypes = {
  data: SankeyFlowChart.propTypes.data,
  expanded: PropTypes.bool.isRequired,
  hasAnyTransactions: PropTypes.bool.isRequired,
  hasPeriodTransactions: PropTypes.bool.isRequired,
};
