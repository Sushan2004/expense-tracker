import { useAppState } from '../state/AppState.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import Icon from '../components/Icon.jsx';

const GROUPS = [
  {
    title: 'Account',
    rows: [
      { name: 'Profile', hint: 'Name, email, avatar', icon: 'info' },
      { name: 'Security', hint: 'Password and 2-factor', icon: 'check' },
    ],
  },
  {
    title: 'Preferences',
    rows: [
      { name: 'Currency', hint: 'USD · $ · 2 decimals', icon: 'wallet' },
      { name: 'Week starts on', hint: 'Monday', icon: 'calendar' },
    ],
  },
  {
    title: 'Notifications',
    rows: [
      { name: 'Budget warnings', hint: 'When you hit 80% of any budget', icon: 'alert' },
      { name: 'Monthly summary', hint: 'A short note on the 1st', icon: 'info' },
    ],
  },
];

export default function Settings() {
  const { state } = useAppState();
  const [reduceMotion, setReduceMotion] = useLocalStorage('et:reduce-motion', false);
  const [tightLists, setTightLists] = useLocalStorage('et:tight-lists', false);

  if (state.status !== 'ready') return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Settings</h1>
          <span className="t-caption">Signed in as {state.user?.email}</span>
        </div>
      </header>

      <div className="dash-grid" style={{ alignItems: 'start' }}>
        <div className="stack">
          {GROUPS.map((group) => (
            <section key={group.title}>
              <div className="t-eyebrow" style={{ marginBottom: 8 }}>{group.title}</div>
              <div className="settings-list">
                {group.rows.map((row) => (
                  <div key={row.name} className="settings-row">
                    <span className="row" style={{ gap: 12 }}>
                      <span style={{
                        width: 32, height: 32, borderRadius: 9,
                        background: 'var(--mint-wash)', color: 'var(--forest)',
                        display: 'grid', placeItems: 'center',
                      }}>
                        <Icon name={row.icon} size={15} />
                      </span>
                      <span>
                        <div className="settings-row__name">{row.name}</div>
                        <div className="settings-row__hint">{row.hint}</div>
                      </span>
                    </span>
                    <Icon name="more" size={16} stroke="var(--text-3)" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="stack">
          <section>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>Display</div>
            <div className="settings-list">
              <div className="settings-row">
                <span>
                  <div className="settings-row__name">Reduce motion</div>
                  <div className="settings-row__hint">Disable shimmer and toast animations</div>
                </span>
                <button
                  type="button"
                  className={`switch${reduceMotion ? ' is-on' : ''}`}
                  role="switch"
                  aria-checked={reduceMotion}
                  onClick={() => setReduceMotion(!reduceMotion)}
                  aria-label="Reduce motion"
                />
              </div>
              <div className="settings-row">
                <span>
                  <div className="settings-row__name">Compact lists</div>
                  <div className="settings-row__hint">Tighter row spacing in Transactions</div>
                </span>
                <button
                  type="button"
                  className={`switch${tightLists ? ' is-on' : ''}`}
                  role="switch"
                  aria-checked={tightLists}
                  onClick={() => setTightLists(!tightLists)}
                  aria-label="Compact lists"
                />
              </div>
            </div>
          </section>

          <section>
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>Data</div>
            <div className="settings-list">
              <div className="settings-row">
                <span>
                  <div className="settings-row__name">Export data</div>
                  <div className="settings-row__hint">Download a CSV of all transactions</div>
                </span>
                <button type="button" className="btn btn--secondary">
                  <Icon name="download" size={14} />
                  Export
                </button>
              </div>
              <div className="settings-row">
                <span>
                  <div className="settings-row__name">Reset to seed data</div>
                  <div className="settings-row__hint">Restores demo transactions</div>
                </span>
                <button type="button" className="btn btn--secondary" onClick={() => window.location.reload()}>
                  <Icon name="refresh" size={14} />
                  Reset
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
