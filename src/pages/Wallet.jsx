import { useAppState } from '../state/AppState.jsx';
import Icon from '../components/Icon.jsx';
import { formatCurrency } from '../utils/format.js';
import { totalBalance } from '../utils/selectors.js';

const TYPE_LABEL = {
  checking: 'Checking',
  savings: 'Savings',
  credit: 'Credit card',
};

export default function Wallet() {
  const { state } = useAppState();
  const { accounts, status } = state;

  if (status !== 'ready') return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Accounts</h1>
          <span className="t-caption">Total: {formatCurrency(totalBalance(accounts))}</span>
        </div>
        <button type="button" className="btn btn--primary">
          <Icon name="plus" size={14} strokeWidth={2} />
          New account
        </button>
      </header>

      <section className="acct-grid">
        {accounts.map((a) => {
          const isCredit = a.type === 'credit';
          return (
            <div key={a.id} className={`acct${isCredit ? ' acct--credit' : ''}`}>
              <div className="row row--between">
                <span className="acct__label">{TYPE_LABEL[a.type] || 'Account'}</span>
                <Icon name={a.type === 'credit' ? 'card' : 'wallet'} size={16} stroke={isCredit ? 'var(--mint)' : 'var(--text-3)'} />
              </div>
              <div className="acct__name">{a.name}</div>
              <div className="acct__balance tnum">
                {a.balance < 0 ? '−' : ''}
                {formatCurrency(Math.abs(a.balance))}
              </div>
              {isCredit && (
                <div style={{ fontSize: 12, color: 'var(--mint)', marginTop: 4 }}>
                  Outstanding balance
                </div>
              )}
            </div>
          );
        })}
        <button type="button" className="acct__add">
          <Icon name="plus" size={20} strokeWidth={1.5} />
          <span style={{ marginLeft: 8 }}>Add account</span>
        </button>
      </section>
    </>
  );
}
