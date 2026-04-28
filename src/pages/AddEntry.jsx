import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CategoryCreator from '../components/CategoryCreator.jsx';
import CategoryIcon from '../components/CategoryIcon.jsx';
import Icon from '../components/Icon.jsx';
import SegmentedControl from '../components/SegmentedControl.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { useAppState } from '../state/AppState.jsx';
import { formatCurrency, todayIso } from '../utils/format.js';
import { colorWithAlpha, getCategoryAccentStyle, resolveCategoryColor } from '../utils/categoryAppearance.js';
import { uniqueId } from '../utils/selectors.js';

const KEYS = [
  '7', '8', '9', 'Back',
  '4', '5', '6', '+',
  '1', '2', '3', '-',
  '.', '0', '00', '=',
];

export default function AddEntry() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();
  const [defaultType, setDefaultType] = useLocalStorage('et:last-entry-type', 'expense');
  const [defaultAccount, setDefaultAccount] = useLocalStorage('et:last-account', null);
  const [type, setType] = useState(defaultType);
  const [amountStr, setAmountStr] = useState('0');
  const [pendingOp, setPendingOp] = useState(null);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayIso());
  const [recurring, setRecurring] = useState(false);
  const [merchant, setMerchant] = useState('');
  const [categoryCreatorTrigger, setCategoryCreatorTrigger] = useState(null);
  const hasAccounts = state.accounts.length > 0;

  const preferredAccountId = useMemo(() => {
    if (defaultAccount && state.accounts.some((account) => account.id === defaultAccount)) {
      return defaultAccount;
    }
    return '';
  }, [defaultAccount, state.accounts]);

  useEffect(() => {
    setDefaultType(type);
  }, [type, setDefaultType]);

  useEffect(() => {
    if (!categoryId && state.categories[0]?.id) {
      setCategoryId(state.categories[0].id);
    }
  }, [categoryId, state.categories]);

  useEffect(() => {
    if (!accountId && preferredAccountId) {
      setAccountId(preferredAccountId);
    }
  }, [accountId, preferredAccountId]);

  useEffect(() => {
    if (accountId && state.accounts.some((account) => account.id === accountId)) {
      setDefaultAccount(accountId);
      return;
    }

    if (accountId && !state.accounts.some((account) => account.id === accountId)) {
      setAccountId('');
    }
  }, [accountId, setDefaultAccount, state.accounts]);

  useEffect(() => {
    if (categoryId === 'cat-other') {
      setCategoryCreatorTrigger((value) => value || 'other');
      return;
    }

    setCategoryCreatorTrigger((value) => (value === 'other' ? null : value));
  }, [categoryId]);

  const amount = Number(amountStr) || 0;
  const valid = amount > 0 && categoryId && merchant.trim().length > 0;
  const showCategoryCreator = categoryCreatorTrigger !== null;

  function press(key) {
    if (key === 'Back') {
      setAmountStr((value) => (value.length <= 1 ? '0' : value.slice(0, -1)));
      return;
    }

    if (['+', '-'].includes(key)) {
      setPendingOp({ op: key, prev: amount });
      setAmountStr('0');
      return;
    }

    if (key === '=') {
      if (pendingOp) {
        const { op, prev } = pendingOp;
        const next = op === '+' ? prev + amount : prev - amount;
        setAmountStr(String(Number(next.toFixed(2))));
        setPendingOp(null);
      }
      return;
    }

    if (key === '.') {
      if (!amountStr.includes('.')) setAmountStr(`${amountStr}.`);
      return;
    }

    if (key === '00') {
      setAmountStr((value) => (value === '0' ? '0' : `${value}00`));
      return;
    }

    setAmountStr((value) => (value === '0' ? key : `${value}${key}`));
  }

  function onSave(event) {
    event.preventDefault();
    if (!valid) return;

    const transaction = {
      id: uniqueId('t'),
      merchant: merchant.trim(),
      categoryId,
      accountId: accountId || null,
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      date,
      note: note.trim(),
      recurring,
      type,
    };

    dispatch({ type: 'tx/add', payload: transaction });
    dispatch({
      type: 'toast/show',
      payload: { message: `${type === 'income' ? 'Income' : 'Expense'} added`, kind: 'success' },
    });
    navigate('/transactions');
  }

  function handleCreateCategory(payload) {
    const nextCategory = {
      id: uniqueId('cat'),
      ...payload,
      builtin: false,
    };

    dispatch({ type: 'category/add', payload: nextCategory });
    dispatch({
      type: 'toast/show',
      payload: { message: 'Category added successfully.', kind: 'success' },
    });
    setCategoryId(nextCategory.id);
    setCategoryCreatorTrigger(null);
  }

  if (state.status !== 'ready') return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Add entry</h1>
          <span className="t-caption">Track income, expenses, and recurring bills manually</span>
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
            {type === 'expense' ? '-' : '+'}
            {formatCurrency(amount)}
            {pendingOp ? (
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
                pending {pendingOp.op}
              </div>
            ) : null}
          </div>

          <div className="keypad">
            {KEYS.map((key) => {
              let mod = '';
              if (['+', '-'].includes(key)) mod = ' keypad__btn--op';
              if (key === '=') mod = ' keypad__btn--eq';

              return (
                <button
                  key={key}
                  type="button"
                  className={`keypad__btn${mod}`}
                  onClick={() => press(key)}
                  aria-label={`Key ${key}`}
                >
                  {key}
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
            <div className="row row--between" style={{ marginBottom: 10 }}>
              <div className="t-eyebrow">Category</div>
              <button
                type="button"
                className="btn btn--ghost category-inline-create-btn"
                onClick={() => setCategoryCreatorTrigger('button')}
              >
                <Icon name="plus" size={14} strokeWidth={2} />
                New category
              </button>
            </div>
            <div className="cat-grid">
              {state.categories.map((category) => {
                const isSelected = categoryId === category.id;
                const accent = resolveCategoryColor(category.colorVar);
                const tileStyle = isSelected
                  ? { background: colorWithAlpha(accent, 0.08), borderColor: colorWithAlpha(accent, 0.45) }
                  : undefined;
                return (
                  <button
                    type="button"
                    key={category.id}
                    className={`cat-tile${isSelected ? ' is-selected' : ''}`}
                    onClick={() => setCategoryId(category.id)}
                    aria-pressed={isSelected}
                    style={tileStyle}
                  >
                    <span className="cat-tile__icon" style={getCategoryAccentStyle(accent, 0.14)}>
                      <CategoryIcon category={category} size={20} />
                    </span>
                    <span className="cat-tile__label">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {showCategoryCreator ? (
            <CategoryCreator
              categories={state.categories}
              title={categoryCreatorTrigger === 'other' ? 'Create a custom category for "Other"' : 'Create category'}
              description={
                categoryCreatorTrigger === 'other'
                  ? 'Pick a clearer name, icon, and color so this category stands out in reports.'
                  : 'Custom categories stay local to this demo workspace and will be available for future transactions.'
              }
              onCancel={() => setCategoryCreatorTrigger(null)}
              onSave={handleCreateCategory}
            />
          ) : null}

          <section className="card card--lg stack" style={{ gap: 14 }}>
            <label className="field">
              <span className="field__label">{type === 'income' ? 'Income source' : 'Merchant'}</span>
              <input
                className="input"
                value={merchant}
                onChange={(event) => setMerchant(event.target.value)}
                placeholder={type === 'income' ? 'Salary, freelance, or transfer' : 'Store or bill name'}
                required
              />
            </label>

            {hasAccounts ? (
              <label className="field">
                <span className="field__label">Account (optional)</span>
                <select
                  className="select"
                  value={accountId}
                  onChange={(event) => setAccountId(event.target.value)}
                >
                  <option value="">Manual entry</option>
                  {state.accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.name}</option>
                  ))}
                </select>
                <span className="field__hint">You can still save this entry without assigning an account.</span>
              </label>
            ) : (
              <div className="manual-note">
                <span className="manual-note__icon" aria-hidden="true">
                  <Icon name="wallet" size={16} />
                </span>
                <div>
                  <div className="manual-note__title">No bank account needed</div>
                  <div className="manual-note__copy">
                    Manual tracking works right away. Bank sync can be added later from Accounts.
                  </div>
                </div>
              </div>
            )}

            <label className="field">
              <span className="field__label">Date</span>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label className="field">
              <span className="field__label">Note (optional)</span>
              <textarea
                className="textarea"
                value={note}
                onChange={(event) => setNote(event.target.value)}
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
                onClick={() => setRecurring((value) => !value)}
                aria-label="Mark recurring"
              />
            </div>
          </section>
        </div>
      </form>
    </>
  );
}
