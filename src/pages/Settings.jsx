import Icon from '../components/Icon.jsx';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { clearStoredAppState, useAppState } from '../state/AppState.jsx';

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
      { name: 'Currency', hint: 'USD - $ - 2 decimals', icon: 'wallet' },
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

const THEME_OPTIONS = [
  {
    value: 'light',
    label: 'Light mode',
    hint: 'Bright canvas with soft mint accents',
    icon: 'sun',
  },
  {
    value: 'dark',
    label: 'Dark mode',
    hint: 'Deep Forest dark theme',
    icon: 'moon',
  },
  {
    value: 'system',
    label: 'System default',
    hint: 'Follow your device appearance',
    icon: 'settings',
  },
];

export default function Settings() {
  const { state, dispatch, resolvedTheme, systemTheme } = useAppState();
  const [reduceMotion, setReduceMotion] = useLocalStorage('et:reduce-motion', false);
  const [tightLists, setTightLists] = useLocalStorage('et:tight-lists', false);
  const hasTransactions = state.transactions.length > 0;

  if (state.status !== 'ready') return null;

  return (
    <>
      <header className="topbar">
        <div className="topbar__title-block">
          <h1 className="topbar__title">Settings</h1>
          <span className="t-caption">{state.user?.email || 'No profile connected'}</span>
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
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: 'var(--accent-soft-bg)',
                          color: 'var(--accent-soft-ink)',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
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
            <div className="t-eyebrow" style={{ marginBottom: 8 }}>Appearance</div>
            <div className="appearance-grid">
              {THEME_OPTIONS.map((option) => {
                const active = state.themeMode === option.value;
                const previewClass =
                  option.value === 'light'
                    ? 'appearance-option__preview--light'
                    : option.value === 'dark'
                      ? 'appearance-option__preview--dark'
                      : resolvedTheme === 'dark'
                        ? 'appearance-option__preview--dark'
                        : 'appearance-option__preview--light';

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`appearance-option${active ? ' is-active' : ''}`}
                    onClick={() => dispatch({ type: 'theme/set', payload: option.value })}
                    aria-pressed={active}
                  >
                    <span className={`appearance-option__preview ${previewClass}`} aria-hidden="true">
                      <span className="appearance-option__preview-top" />
                      <span className="appearance-option__preview-card" />
                      <span className="appearance-option__preview-card appearance-option__preview-card--small" />
                    </span>
                    <span className="appearance-option__copy">
                      <span className="appearance-option__title-row">
                        <span className="appearance-option__title">{option.label}</span>
                        {active ? (
                          <span className="appearance-option__badge">
                            <Icon name="check" size={12} strokeWidth={2} />
                            Selected
                          </span>
                        ) : null}
                      </span>
                      <span className="appearance-option__hint">{option.hint}</span>
                      {option.value === 'system' ? (
                        <span className="appearance-option__meta">
                          Currently using {systemTheme === 'dark' ? 'Deep Forest dark' : 'Light mode'}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

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
                  <div className="settings-row__hint">
                    {hasTransactions
                      ? 'Download a CSV of all transactions'
                      : 'Available after you add transactions'}
                  </div>
                </span>
                <button type="button" className="btn btn--secondary" disabled={!hasTransactions}>
                  <Icon name="download" size={14} />
                  Export
                </button>
              </div>
              <div className="settings-row">
                <span>
                  <div className="settings-row__name">Start fresh</div>
                  <div className="settings-row__hint">Clear local demo data and return to an empty workspace</div>
                </span>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    clearStoredAppState();
                    window.location.reload();
                  }}
                >
                  <Icon name="refresh" size={14} />
                  Clear data
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
