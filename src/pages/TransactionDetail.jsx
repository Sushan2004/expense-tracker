import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../state/AppState.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import Icon from '../components/Icon.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { categoryById, accountById, uniqueId } from '../utils/selectors.js';
import { getCategoryAccentStyle } from '../utils/categoryAppearance.js';
import { formatCurrency, fullDate } from '../utils/format.js';

export default function TransactionDetail() {
  const { id } = useParams();
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();

  if (state.status !== 'ready') return null;

  const tx = state.transactions.find((transaction) => transaction.id === id);
  if (!tx) {
    return (
      <>
        <header className="topbar">
          <Link to="/transactions" className="btn btn--secondary">
            <Icon name="arrowLeft" size={14} />
            Back
          </Link>
        </header>
        <EmptyState
          title="Transaction not found"
          copy="It may have been deleted or the link is wrong."
          action={(
            <Link to="/transactions" className="btn btn--primary">Back to all transactions</Link>
          )}
        />
      </>
    );
  }

  const category = categoryById(state.categories, tx.categoryId);
  const account = accountById(state.accounts, tx.accountId);
  const isIncome = tx.type === 'income';
  const iconStyle = getCategoryAccentStyle(category?.colorVar, 0.16);

  function onDelete() {
    if (!window.confirm('Delete this transaction?')) return;
    dispatch({ type: 'tx/delete', payload: tx.id });
    dispatch({ type: 'toast/show', payload: { message: 'Transaction deleted', kind: 'success' } });
    navigate('/transactions');
  }

  function onDuplicate() {
    const copy = { ...tx, id: uniqueId('t'), date: new Date().toISOString().slice(0, 10) };
    dispatch({ type: 'tx/add', payload: copy });
    dispatch({ type: 'toast/show', payload: { message: 'Duplicated', kind: 'success' } });
    navigate(`/transactions/${copy.id}`);
  }

  return (
    <>
      <header className="topbar">
        <Link to="/transactions" className="btn btn--secondary" aria-label="Back to transactions">
          <Icon name="arrowLeft" size={14} />
          Back
        </Link>
        <div className="topbar__actions">
          <button type="button" className="btn btn--secondary">
            <Icon name="edit" size={14} />
            Edit
          </button>
          <button type="button" className="btn btn--secondary" onClick={onDuplicate}>
            <Icon name="repeat" size={14} />
            Duplicate
          </button>
          <button type="button" className="btn btn--danger" onClick={onDelete}>
            <Icon name="trash" size={14} />
            Delete
          </button>
        </div>
      </header>

      <section className="card card--lg" style={{ maxWidth: 720 }}>
        <div className="tx-detail__hero">
          <div className="tx-detail__icon" style={{ ...iconStyle, width: 64, height: 64, borderRadius: 16 }}>
            <CategoryIcon category={category} categoryId={tx.categoryId} size={32} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 500 }}>{tx.merchant}</div>
            <div className="t-caption">{fullDate(tx.date)}</div>
          </div>
        </div>
        <div className={`tx-detail__amount${isIncome ? ' tx-detail__amount--income' : ''} tnum`}>
          {isIncome ? '+' : '-'}
          {formatCurrency(Math.abs(tx.amount))}
        </div>
        <div className="tx-detail__list" style={{ fontSize: 14 }}>
          <div className="row row--between"><span>Category</span><span>{category?.name || '-'}</span></div>
          <div className="row row--between"><span>Account</span><span>{account?.name || 'Manual entry'}</span></div>
          <div className="row row--between"><span>Type</span><span>{isIncome ? 'Income' : 'Expense'}</span></div>
          <div className="row row--between"><span>Recurring</span><span>{tx.recurring ? 'Yes' : '-'}</span></div>
        </div>
        {tx.note ? (
          <>
            <div className="tx-detail__divider" />
            <div className="t-eyebrow" style={{ marginBottom: 6 }}>Note</div>
            <p className="t-body">{tx.note}</p>
          </>
        ) : null}
      </section>
    </>
  );
}
