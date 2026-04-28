import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import ColorPickerModal from '../components/ColorPickerModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Icon from '../components/Icon.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useAppState } from '../state/AppState.jsx';
import {
  DEFAULT_CATEGORY_COLOR,
  colorWithAlpha,
  normalizeCategoryColor,
} from '../utils/categoryAppearance.js';
import { formatCurrency, fullDate, todayIso } from '../utils/format.js';
import { checkingBalance, totalSavings, uniqueId } from '../utils/selectors.js';

const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const FREQUENCY_LABEL = Object.fromEntries(FREQUENCY_OPTIONS.map((f) => [f.value, f.label]));

export default function Goals() {
  const { state, dispatch } = useAppState();
  const { incomeSources, goals, transactions, status } = state;

  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const checking = useMemo(
    () => checkingBalance({ transactions, goals }),
    [transactions, goals]
  );
  const savedTotal = useMemo(() => totalSavings(goals), [goals]);

  if (status !== 'ready') return null;

  function handleAddIncome(payload) {
    dispatch({
      type: 'incomeSource/add',
      payload: {
        id: uniqueId('inc'),
        createdAt: todayIso(),
        ...payload,
      },
    });
    dispatch({
      type: 'toast/show',
      payload: { message: 'Income added successfully.', kind: 'success' },
    });
    setIsAddingIncome(false);
  }

  function handleDeleteIncome(id) {
    dispatch({ type: 'incomeSource/delete', payload: id });
    dispatch({
      type: 'toast/show',
      payload: { message: 'Income source removed.', kind: 'success' },
    });
  }

  function handleAddGoal(payload) {
    dispatch({
      type: 'goal/add',
      payload: {
        id: uniqueId('goal'),
        current: 0,
        createdAt: todayIso(),
        ...payload,
      },
    });
    dispatch({
      type: 'toast/show',
      payload: { message: 'Savings goal added.', kind: 'success' },
    });
    setIsAddingGoal(false);
  }

  function handleDeleteGoal(id) {
    dispatch({ type: 'goal/delete', payload: id });
    dispatch({
      type: 'toast/show',
      payload: { message: 'Goal removed.', kind: 'success' },
    });
  }

  function handleTransfer({ goalId, amount }) {
    dispatch({ type: 'goal/transfer', payload: { goalId, amount } });
    const goal = goals.find((g) => g.id === goalId);
    dispatch({
      type: 'toast/show',
      payload: {
        message: `Moved ${formatCurrency(amount)} to ${goal?.name || 'savings'}.`,
        kind: 'success',
      },
    });
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Income &amp; Savings</h1>
          <span className="t-caption">
            Track income sources, your checking balance, and progress on savings goals.
          </span>
        </div>
      </header>

      <section className="is-stats">
        <div className="is-stat is-stat--checking">
          <div className="is-stat__label">Checking balance</div>
          <div className="is-stat__value tnum">{formatCurrency(checking)}</div>
          <div className="is-stat__sub">
            From {incomeSources.length} income {incomeSources.length === 1 ? 'source' : 'sources'}
            {goals.length > 0 ? ` · ${formatCurrency(savedTotal)} moved to savings` : ''}
          </div>
        </div>
        <div className="is-stat is-stat--savings">
          <div className="is-stat__label">Total savings</div>
          <div className="is-stat__value tnum">{formatCurrency(savedTotal)}</div>
          <div className="is-stat__sub">
            Across {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
          </div>
        </div>
      </section>

      <section className="card card--lg is-section">
        <div className="is-section__head">
          <div>
            <h2 className="t-h2">Income</h2>
            <span className="t-caption">All income flows into your checking balance first.</span>
          </div>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setIsAddingIncome((value) => !value)}
          >
            <Icon name={isAddingIncome ? 'minus' : 'plus'} size={14} strokeWidth={2} />
            {isAddingIncome ? 'Close' : 'Add income'}
          </button>
        </div>

        {isAddingIncome ? (
          <IncomeForm
            goals={goals}
            onCancel={() => setIsAddingIncome(false)}
            onSave={handleAddIncome}
          />
        ) : null}

        {incomeSources.length === 0 ? (
          <EmptyState
            title="No income sources yet"
            copy="Add a paycheck, side gig, or any deposit to start growing your checking balance."
          />
        ) : (
          <div className="is-income-list">
            {incomeSources.map((source) => (
              <IncomeRow key={source.id} source={source} onDelete={handleDeleteIncome} />
            ))}
          </div>
        )}
      </section>

      <section className="card card--lg is-section">
        <div className="is-section__head">
          <div>
            <h2 className="t-h2">Move money to savings</h2>
            <span className="t-caption">
              Available in checking: <span className="tnum">{formatCurrency(Math.max(0, checking))}</span>
            </span>
          </div>
        </div>

        <TransferForm
          goals={goals}
          available={checking}
          onTransfer={handleTransfer}
        />
      </section>

      <section className="card card--lg is-section">
        <div className="is-section__head">
          <div>
            <h2 className="t-h2">Savings goals</h2>
            <span className="t-caption">
              {goals.length > 0
                ? `${formatCurrency(savedTotal)} saved across ${goals.length} ${goals.length === 1 ? 'goal' : 'goals'}.`
                : 'Create your first goal to start dividing savings.'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setIsAddingGoal((value) => !value)}
          >
            <Icon name={isAddingGoal ? 'minus' : 'plus'} size={14} strokeWidth={2} />
            {isAddingGoal ? 'Close' : 'New goal'}
          </button>
        </div>

        {isAddingGoal ? (
          <GoalForm
            goals={goals}
            onCancel={() => setIsAddingGoal(false)}
            onSave={handleAddGoal}
          />
        ) : null}

        {goals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            copy="Create your first savings goal to start saving."
          />
        ) : (
          <div className="is-goal-grid">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/* ----------------------------- Income form ------------------------------ */

function IncomeForm({ goals, onCancel, onSave }) {
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [note, setNote] = useState('');
  const [savePercentStr, setSavePercentStr] = useState('0');
  const [splitState, setSplitState] = useState(() =>
    Object.fromEntries(goals.map((g, i) => [g.id, i === 0 ? 100 : 0]))
  );

  const amount = Number(amountStr) || 0;
  const savePercent = Math.max(0, Math.min(100, Number(savePercentStr) || 0));
  const savedAmount = (amount * savePercent) / 100;
  const checkingPortion = amount - savedAmount;

  const splitTotal = useMemo(
    () => goals.reduce((sum, g) => sum + (Number(splitState[g.id]) || 0), 0),
    [goals, splitState]
  );
  const splitValid = goals.length === 0 || savePercent === 0 || Math.round(splitTotal) === 100;
  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && amount > 0 && splitValid;

  function handleSplitChange(goalId, value) {
    const numeric = Math.max(0, Math.min(100, Number(value) || 0));
    setSplitState((prev) => ({ ...prev, [goalId]: numeric }));
  }

  function handleSave() {
    if (!canSave) return;
    const splitConfig = goals.length > 0 && savePercent > 0
      ? goals
          .map((g) => ({ goalId: g.id, percent: Number(splitState[g.id]) || 0 }))
          .filter((entry) => entry.percent > 0)
      : [];
    onSave({
      name: trimmedName,
      amount,
      frequency,
      note: note.trim(),
      savePercent,
      splitConfig,
    });
  }

  return (
    <div className="is-form">
      <div className="is-form-grid">
        <label className="field">
          <span className="field__label">Source name</span>
          <input
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Salary, freelance, side gig..."
            maxLength={40}
          />
        </label>
        <label className="field">
          <span className="field__label">Amount</span>
          <input
            type="number"
            className="input tnum"
            value={amountStr}
            onChange={(event) => setAmountStr(event.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </label>
        <label className="field">
          <span className="field__label">Frequency</span>
          <select
            className="select"
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
          >
            {FREQUENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span className="field__label">Note (optional)</span>
        <textarea
          className="textarea"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Anything worth remembering"
          rows={2}
        />
      </label>

      <div className="is-save-percent">
        <div className="is-save-percent__head">
          <span className="field__label">Save a percentage</span>
          <span className="is-save-percent__value tnum">{savePercent}%</span>
        </div>
        <input
          type="range"
          className="is-save-percent__slider"
          min={0}
          max={100}
          step={5}
          value={savePercent}
          onChange={(event) => setSavePercentStr(event.target.value)}
          disabled={goals.length === 0}
        />
        <div className="is-save-percent__hint">
          {goals.length === 0
            ? 'Create a savings goal first to enable percentage saving.'
            : amount > 0
              ? `${formatCurrency(savedAmount)} goes to savings · ${formatCurrency(checkingPortion)} stays in checking.`
              : 'Enter an amount to see how the split works.'}
        </div>
      </div>

      {goals.length > 1 && savePercent > 0 ? (
        <div className="is-split">
          <div className="is-split__head">
            <span className="field__label">Split across goals</span>
            <span className={`is-split__total tnum${splitValid ? '' : ' is-split__total--error'}`}>
              Total: {Math.round(splitTotal)}%
            </span>
          </div>
          <div className="is-split__rows">
            {goals.map((goal) => {
              const percent = Number(splitState[goal.id]) || 0;
              const portion = (savedAmount * percent) / 100;
              return (
                <div key={goal.id} className="is-split__row">
                  <span className="is-split__dot" style={{ background: goal.color }} aria-hidden="true" />
                  <span className="is-split__name">{goal.name}</span>
                  <input
                    type="number"
                    className="input is-split__input"
                    min={0}
                    max={100}
                    value={percent}
                    onChange={(event) => handleSplitChange(goal.id, event.target.value)}
                    aria-label={`Percent for ${goal.name}`}
                  />
                  <span className="is-split__percent">%</span>
                  <span className="is-split__portion tnum">{formatCurrency(portion)}</span>
                </div>
              );
            })}
          </div>
          {!splitValid ? (
            <span className="field__error">Goal split must total 100%.</span>
          ) : null}
        </div>
      ) : null}

      <div className="is-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn btn--primary" disabled={!canSave} onClick={handleSave}>
          Add income
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- Income row ------------------------------- */

function IncomeRow({ source, onDelete }) {
  const savedAmount = (source.amount * source.savePercent) / 100;

  return (
    <div className="is-income-row">
      <div className="is-income-row__main">
        <div className="is-income-row__title">
          {source.name}
          <span className="is-income-row__badge">{FREQUENCY_LABEL[source.frequency] || 'One-time'}</span>
        </div>
        {source.note ? <div className="t-caption">{source.note}</div> : null}
        {source.savePercent > 0 ? (
          <div className="t-caption is-income-row__split">
            {source.savePercent}% saved ({formatCurrency(savedAmount)})
          </div>
        ) : null}
      </div>
      <div className="is-income-row__amount tnum">+{formatCurrency(source.amount)}</div>
      <button
        type="button"
        className="is-income-row__delete"
        onClick={() => onDelete(source.id)}
        aria-label={`Remove ${source.name}`}
        title="Remove income source"
      >
        <Icon name="trash" size={14} strokeWidth={1.6} />
      </button>
    </div>
  );
}

/* ----------------------------- Transfer form ---------------------------- */

function TransferForm({ goals, available, onTransfer }) {
  const [goalId, setGoalId] = useState(goals[0]?.id || '');
  const [amountStr, setAmountStr] = useState('');

  const amount = Number(amountStr) || 0;
  const noGoals = goals.length === 0;
  const noChecking = available <= 0;
  const overAvailable = amount > available;
  const valid = !noGoals && !noChecking && amount > 0 && !overAvailable && goals.some((g) => g.id === goalId);

  function handleSubmit() {
    if (!valid) return;
    onTransfer({ goalId, amount });
    setAmountStr('');
  }

  if (noGoals) {
    return (
      <div className="is-transfer is-transfer--disabled">
        Create a savings goal first, then come back to move money over.
      </div>
    );
  }

  return (
    <div className="is-transfer">
      <label className="field">
        <span className="field__label">To savings goal</span>
        <select
          className="select"
          value={goalId}
          onChange={(event) => setGoalId(event.target.value)}
        >
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name} · {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span className="field__label">Amount</span>
        <input
          type="number"
          className={`input tnum${overAvailable ? ' input--error' : ''}`}
          value={amountStr}
          onChange={(event) => setAmountStr(event.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
        {overAvailable ? (
          <span className="field__error">
            Amount exceeds available checking ({formatCurrency(Math.max(0, available))}).
          </span>
        ) : noChecking ? (
          <span className="field__hint">Add income to checking before transferring.</span>
        ) : (
          <span className="field__hint">
            Available: <span className="tnum">{formatCurrency(Math.max(0, available))}</span>
          </span>
        )}
      </label>
      <button
        type="button"
        className="btn btn--primary is-transfer__submit"
        onClick={handleSubmit}
        disabled={!valid}
      >
        Transfer
      </button>
    </div>
  );
}

/* ----------------------------- Goal form -------------------------------- */

function GoalForm({ goals, onCancel, onSave }) {
  const [name, setName] = useState('');
  const [targetStr, setTargetStr] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState(DEFAULT_CATEGORY_COLOR);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const trimmedName = name.trim();
  const target = Number(targetStr) || 0;
  const duplicateName = useMemo(
    () => goals.some((g) => g.name.toLowerCase() === trimmedName.toLowerCase()),
    [goals, trimmedName]
  );
  const canSave = trimmedName.length > 0 && target > 0 && !duplicateName;

  function handleSave() {
    if (!canSave) return;
    onSave({
      name: trimmedName,
      target,
      deadline: deadline || null,
      color: normalizeCategoryColor(color),
    });
  }

  return (
    <div className="is-form">
      <div className="is-form-grid">
        <label className="field">
          <span className="field__label">Goal name</span>
          <input
            className={`input${trimmedName && duplicateName ? ' input--error' : ''}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Emergency fund, Vacation, Laptop..."
            maxLength={40}
          />
          {trimmedName && duplicateName ? (
            <span className="field__error">A goal with this name already exists.</span>
          ) : null}
        </label>
        <label className="field">
          <span className="field__label">Target amount</span>
          <input
            type="number"
            className="input tnum"
            value={targetStr}
            onChange={(event) => setTargetStr(event.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </label>
        <label className="field">
          <span className="field__label">Deadline (optional)</span>
          <input
            type="date"
            className="input"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
          />
        </label>
      </div>

      <button
        type="button"
        className="category-create__chooser category-create__chooser--full"
        onClick={() => setColorPickerOpen(true)}
      >
        <span
          className="category-create__chooser-swatch category-create__chooser-swatch--solid"
          style={{ background: color }}
          aria-hidden="true"
        />
        <span className="category-create__chooser-meta">
          <span className="category-create__chooser-label">Color accent</span>
          <span className="category-create__chooser-value tnum">{color}</span>
        </span>
        <span className="category-create__chooser-cta">Change</span>
      </button>

      <div className="is-form__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn btn--primary" disabled={!canSave} onClick={handleSave}>
          Save goal
        </button>
      </div>

      <ColorPickerModal
        open={colorPickerOpen}
        value={color}
        onClose={() => setColorPickerOpen(false)}
        onSave={(hex) => {
          setColor(normalizeCategoryColor(hex));
          setColorPickerOpen(false);
        }}
      />
    </div>
  );
}

/* ----------------------------- Goal card -------------------------------- */

function GoalCard({ goal, onDelete }) {
  const ratio = goal.target > 0 ? goal.current / goal.target : 0;
  const pct = Math.min(100, Math.round(ratio * 100));
  const remaining = Math.max(0, goal.target - goal.current);
  const cardStyle = {
    borderColor: colorWithAlpha(goal.color, 0.32),
  };

  return (
    <article className="is-goal-card" style={cardStyle}>
      <header className="is-goal-card__head">
        <div className="is-goal-card__title">
          <span className="is-goal-card__dot" style={{ background: goal.color }} aria-hidden="true" />
          <span>{goal.name}</span>
        </div>
        <button
          type="button"
          className="is-goal-card__delete"
          onClick={() => onDelete(goal.id)}
          aria-label={`Remove ${goal.name}`}
          title={goal.current > 0
            ? `Remove (loses ${formatCurrency(goal.current)} of progress)`
            : 'Remove goal'}
        >
          <Icon name="trash" size={14} strokeWidth={1.6} />
        </button>
      </header>

      <div className="is-goal-card__amounts tnum">
        <span className="is-goal-card__current">{formatCurrency(goal.current)}</span>
        <span className="is-goal-card__sep">of {formatCurrency(goal.target)}</span>
      </div>

      <div className="is-goal-card__bar">
        <div
          className="is-goal-card__bar-fill"
          style={{ width: `${pct}%`, background: goal.color }}
        />
      </div>

      <div className="is-goal-card__meta">
        <span>{pct}% complete</span>
        <span>{remaining > 0 ? `${formatCurrency(remaining)} to go` : 'Goal reached'}</span>
      </div>

      {goal.deadline ? (
        <div className="t-caption">By {fullDate(goal.deadline)}</div>
      ) : null}
    </article>
  );
}

const goalShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  target: PropTypes.number.isRequired,
  current: PropTypes.number.isRequired,
  deadline: PropTypes.string,
  color: PropTypes.string.isRequired,
});

IncomeForm.propTypes = {
  goals: PropTypes.arrayOf(goalShape).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

IncomeRow.propTypes = {
  source: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    frequency: PropTypes.string.isRequired,
    note: PropTypes.string,
    savePercent: PropTypes.number.isRequired,
    splitConfig: PropTypes.array,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

TransferForm.propTypes = {
  goals: PropTypes.arrayOf(goalShape).isRequired,
  available: PropTypes.number.isRequired,
  onTransfer: PropTypes.func.isRequired,
};

GoalForm.propTypes = {
  goals: PropTypes.arrayOf(goalShape).isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

GoalCard.propTypes = {
  goal: goalShape.isRequired,
  onDelete: PropTypes.func.isRequired,
};
