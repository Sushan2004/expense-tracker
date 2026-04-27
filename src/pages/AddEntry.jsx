import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppState.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import SegmentedControl from '../components/SegmentedControl.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import Icon from '../components/Icon.jsx';
import { formatCurrency, todayIso } from '../utils/format.js';
import { uniqueId } from '../utils/selectors.js';

const KEYS = [
  '7', '8', '9', '⌫',
  '4', '5', '6', '+',
  '1', '2', '3', '−',
  '.', '0', '00', '=',
];

export default function AddEntry() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [defaultType, setDefaultType] = useLocalStorage('et:last-entry-type', 'expense');
  const [defaultAccount, setDefaultAccount] = useLocalStorage('et:last-account', null);

  const [type, setType] = useState(defaultType);
  const [amountStr, setAmountStr] = useState('0');
  const [pendingOp, setPendingOp] = useState(null); // { op, prev }
  const [categoryId, setCategoryId] = useState(state.categories?.[0]?.id || '');
  const [accountId, setAccountId] = useState(defaultAccount || state.accounts?.[0]?.id || '');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayIso());
  const [recurring, setRecurring] = useState(false);
  const [merchant, setMerchant] = useState('');

  useEffect(() => { setDefaultType(type); }, [type, setDefaultType]);
  useEffect(() => { if (accountId) setDefaultAccount(accountId); }, [accountId, setDefaultAccount]);

  const amount = Number(amountStr) || 0;
  const valid = amount > 0 && categoryId && accountId && merchant.trim().length > 0;

  function press(key) {
    if (key === '⌫') {
      setAmountStr((s) => (s.length <= 1 ? '0' : s.slice(0, -1)));
      return;
    }
    if (['+', '−', '×', '÷'].includes(key)) {
      setPendingOp({ op: key, prev: amount });
      setAmountStr('0');
      return;
    }
    if (key === '=') {
      if (pendingOp) {
        const { op, prev } = pendingOp;
        let next = amount;
        if (op === '+') next = prev + amount;
        if (op === '−') next = prev - amount;
        if (op === '×') next = prev * amount;
        if (op === '÷') next = amount === 0 ? 0 : prev / amount;
        setAmountStr(String(Number(next.toFixed(2))));
        setPendingOp(null);
      }
      return;
    }
    if (key === '.') {
      if (!amountStr.includes('.')) setAmountStr(amountStr + '.');
      return;
    }
    if (key === '00') {
      setAmountStr((s) => (s === '0' ? '0' : s + '00'));
      return;
    }
    setAmountStr((s) => (s === '0' ? key : s + key));
  }

  function onSave(e) {
    e.preventDefault();
    if (!valid) return;
    const tx = {
      id: uniqueId('t'),
      merchant: merchant.trim(),
      categoryId,
      accountId,
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      date,
      note: note.trim(),
      recurring,
      type,
    };
    dispatch({ type: 'tx/add', payload: tx });
    dispatch({
      type: 'toast/show',
      payload: { message: `${type === 'income' ? 'Income' : 'Expense'} added`, kind: 'success' },
    });
    navigate('/transactions');
  }

  if (state.status !== 'ready') return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Add entry</h1>
          <span className="t-caption">Track an expense or income</span>
        </div>
        <Link to="/transactions" className="btn btn--secondary" aria-label="Cancel">
          <Icon name="x" size={14} strokeWidth={2} />
          Cancel
        </Link>
      </header>

      <form className="dash-grid" onSubmit={onSave} style={{ alignItems: 'start' }}>
        <section className="card card--lg stack stack--lg" style={{ gap: 18 }}>
          <SegmentedControl
            value={type}
            onChange={setType}
            options={[
              { value: 'expense', label: 'Expense' },
              { value: 'income', label: 'Income' },
            ]}
            ariaLabel="Entry type"
          />

          <div
            className={`amount-display tnum${type === 'income' ? ' amount-display--income' : ''}`}
            aria-live="polite"
          >
            {type === 'expense' ? '−' : '+'}{formatCurrency(amount)}
            {pendingOp && (
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
                pending {pendingOp.op}
              </div>
            )}
          </div>

          <div className="keypad">
            {KEYS.map((k) => {
              let mod = '';
              if (['+', '−', '×', '÷'].includes(k)) mod = ' keypad__btn--op';
              if (k === '=') mod = ' keypad__btn--eq';
              return (
                <button
                  key={k}
                  type="button"
                  className={`keypad__btn${mod}`}
                  onClick={() => press(k)}
                  aria-label={`Key ${k}`}
                >
                  {k}
                </button>
              );
            })}
          </div>

          <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={!valid}>
            Save {type === 'income' ? 'income' : 'expense'}
          </button>
        </section>

        <div className="stack">
          <section className="card card--lg">
            <div className="t-eyebrow" style={{ marginBottom: 10 }}>Category</div>
            <div className="cat-grid">
              {state.categories.slice(0, 8).map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={`cat-tile${categoryId === c.id ? ' is-selected' : ''}`}
                  onClick={() => setCategoryId(c.id)}
                  aria-pressed={categoryId === c.id}
                >
                  <span className="cat-tile__icon">
                    <CategoryIcon categoryId={c.id} size={20} />
                  </span>
                  <span className="cat-tile__label">{c.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card card--lg stack" style={{ gap: 14 }}>
            <label className="field">
              <span className="field__label">Merchant</span>
              <input
                className="input"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Trader Joe's"
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Account</span>
              <select
                className="select"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                {state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Date</span>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field__label">Note (optional)</span>
              <textarea
                className="textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything worth remembering?"
                rows={3}
              />
            </label>
            <div className="row row--between" style={{ paddingTop: 4 }}>
              <span className="t-label">Recurring</span>
              <button
                type="button"
                className={`switch${recurring ? ' is-on' : ''}`}
                role="switch"
                aria-checked={recurring}
                onClick={() => setRecurring((v) => !v)}
                aria-label="Mark recurring"
              />
            </div>
          </section>
        </div>
      </form>
    </>
  );
}
