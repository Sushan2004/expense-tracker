import { useAppState } from '../state/AppState.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import Icon from '../components/Icon.jsx';
import { formatCurrency, fullDate } from '../utils/format.js';

export default function Goals() {
  const { state } = useAppState();
  const { goals, status } = state;

  if (status !== 'ready') return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Savings goals</h1>
          <span className="t-caption">{goals.length} active goals</span>
        </div>
        <button type="button" className="btn btn--primary">
          <Icon name="plus" size={14} strokeWidth={2} />
          New goal
        </button>
      </header>

      <section className="goals-grid">
        {goals.map((g) => {
          const ratio = g.target > 0 ? g.current / g.target : 0;
          const monthsLeft = Math.max(
            1,
            Math.round((new Date(g.dueDate) - new Date()) / (30 * 86_400_000))
          );
          const suggested = Math.max(0, (g.target - g.current) / monthsLeft);
          return (
            <article key={g.id} className="goal">
              <ProgressRing
                value={g.current}
                max={g.target}
                size={92}
                stroke={9}
                label={`${Math.round(ratio * 100)}%`}
              />
              <div className="goal__meta">
                <div className="goal__name">{g.name}</div>
                <div className="goal__sub">By {fullDate(g.dueDate)}</div>
                <div className="goal__amount tnum">
                  {formatCurrency(g.current)} / {formatCurrency(g.target)}
                </div>
                <div className="t-caption" style={{ marginTop: 6 }}>
                  Suggested: {formatCurrency(suggested, { compact: true })}/mo
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
