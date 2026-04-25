import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { fmt, fmtShort, greeting, exportCSV } from '../utils/helpers'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    user, expenses,
    income, totalExpenses, overBudget,
    savingsRate, balance, thisWeekCount,
    thisMonth, budgetAlerts, smartInsights, savingsGoals, notificationsEnabled,
  } = useApp()

  useEffect(() => {
    if (!notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') return

    const completedGoals = savingsGoals.filter(goal => Number(goal.saved || 0) >= Number(goal.target || 1))
    const alertText = budgetAlerts.length > 0
      ? `${budgetAlerts.length} budget alert${budgetAlerts.length === 1 ? '' : 's'} need attention.`
      : completedGoals.length > 0
        ? `${completedGoals[0].name} savings goal is complete.`
        : ''
    if (!alertText) return

    const key = `mf_notice_${new Date().toISOString().slice(0, 10)}_${alertText}`
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, 'true')
    new Notification('MoneyFlow update', { body: alertText })
  }, [budgetAlerts, notificationsEnabled, savingsGoals])

  return (
    <main className={styles.page}>

      {/* ── Hero banner ── */}
      <div className={styles.heroBanner}>
        <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <p className={styles.heroGreeting}>{greeting()}, {user.name}</p>
          <h1 className={styles.heroHeadline}>Track smarter. Spend wiser.</h1>
          <p className={styles.heroSub}>
            Your personal finance dashboard. Track income, manage expenses,
            visualize your money flow, and export your data anytime.
          </p>
          <div className={styles.heroCtas}>
            <button
              className={styles.ctaPrimary}
              onClick={() => navigate('/transactions?type=expenses')}
            >
              + Add expense
            </button>
            <button
              className={styles.ctaSecondary}
              onClick={() => navigate('/transactions?type=expenses')}
            >
              View transactions
            </button>
          </div>
        </div>

        <div className={styles.heroRight}>
          <p className={styles.balanceLabel}>Total balance</p>
          <p className={styles.balanceAmount}>{fmtShort(balance)}</p>
        </div>
        </section>
      </div>

      {/* ── Metric cards row ── */}
      <section className={styles.metrics}>
        <MetricCard
          label="Monthly income"
          value={fmtShort(income.amount)}
          sub={income.label}
          subColor="green"
          icon="↑"
          onClick={() => navigate('/transactions?type=income')}
        />
        <MetricCard
          label="Total expenses"
          value={fmtShort(totalExpenses)}
          sub={overBudget > 0 ? `↓ ${fmtShort(overBudget)} over budget` : 'Within budget'}
          subColor={overBudget > 0 ? 'red' : 'green'}
          onClick={() => navigate('/transactions?type=expenses')}
        />
        <MetricCard
          label="Savings rate"
          value={`${savingsRate}%`}
          sub="↑ Goal is 30%"
          subColor="green"
          onClick={() => navigate('/transactions?type=savings')}
        />
        <MetricCard
          label="Transactions"
          value={expenses.length}
          sub={`↑ ${thisWeekCount} this week`}
          subColor="green"
          onClick={() => navigate('/transactions?type=expenses')}
        />
      </section>


      <section className={styles.insightGrid}>
        <div className={styles.insightPanel}>
          <h2 className={styles.sectionTitle}>Smart insights</h2>
          {smartInsights.length === 0 ? <p className={styles.panelEmpty}>Add income, budgets, and expenses to unlock insights.</p> : (
            <div className={styles.insightList}>
              {smartInsights.slice(0, 4).map(insight => <p key={insight}>{insight}</p>)}
            </div>
          )}
        </div>
        <div className={styles.insightPanel}>
          <h2 className={styles.sectionTitle}>Budget alerts</h2>
          {budgetAlerts.length === 0 ? <p className={styles.panelEmpty}>No budget alerts right now.</p> : (
            <div className={styles.alertList}>
              {budgetAlerts.slice(0, 3).map(alert => (
                <div key={alert.name} className={styles.alertItem}>
                  <span>{alert.name}</span>
                  <strong>{alert.percent}%</strong>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.insightPanel}>
          <h2 className={styles.sectionTitle}>Savings goals</h2>
          {savingsGoals.length === 0 ? <p className={styles.panelEmpty}>Create a goal in Settings.</p> : (
            <div className={styles.goalList}>
              {savingsGoals.slice(0, 2).map(goal => {
                const pct = Math.min(100, Math.round((Number(goal.saved || 0) / Number(goal.target || 1)) * 100))
                return (
                  <div key={goal.id}>
                    <div className={styles.goalTop}><span>{goal.name}</span><strong>{pct}%</strong></div>
                    <div className={styles.goalTrack}><div style={{ width: `${pct}%` }} /></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Quick actions ── */}
      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick actions</h2>
        <div className={styles.actionGrid}>
          <ActionCard
            icon="📊"
            title="View reports"
            desc="See spending trends by category"
            onClick={() => navigate('/reports')}
          />
          <ActionCard
            icon="💰"
            title="Set budgets"
            desc="Define monthly limits per category"
            onClick={() => navigate('/budget')}
          />
          <ActionCard
            icon="📥"
            title="Export data"
            desc="Download your expenses as CSV"
            onClick={() => exportCSV(expenses)}
          />
          <ActionCard
            icon="⚙️"
            title="Settings"
            desc="Update income and preferences"
            onClick={() => navigate('/settings')}
          />
        </div>
      </section>

      {/* ── Recent transactions ── */}
      {thisMonth.length > 0 && (
        <section className={styles.recent}>
          <div className={styles.recentHeader}>
            <h2 className={styles.sectionTitle}>Recent transactions</h2>
            <button className={styles.viewAll} onClick={() => navigate('/transactions')}>
              View all →
            </button>
          </div>
          <div className={styles.txList}>
            {thisMonth.slice(0, 5).map(ex => (
              <TxRow key={ex.id} ex={ex} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

/* ── Sub-components ── */

function MetricCard({ label, value, sub, subColor, onClick }) {
  return (
    <button className={styles.metricCard} onClick={onClick} type="button">
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
      {sub && (
        <p className={`${styles.metricSub} ${subColor === 'red' ? styles.red : styles.green}`}>
          {sub}
        </p>
      )}
    </button>
  )
}

function ActionCard({ icon, title, desc, onClick }) {
  return (
    <button className={styles.actionCard} onClick={onClick}>
      <span className={styles.actionIcon}>{icon}</span>
      <p className={styles.actionTitle}>{title}</p>
      <p className={styles.actionDesc}>{desc}</p>
    </button>
  )
}

function TxRow({ ex }) {
  return (
    <div className={styles.txRow}>
      <div>
        <p className={styles.txCat}>{ex.category}</p>
        {ex.note && <p className={styles.txNote}>{ex.note}</p>}
      </div>
      <div className={styles.txRight}>
        <p className={styles.txAmount}>-{fmt(ex.amount)}</p>
        <p className={styles.txDate}>{ex.date}</p>
      </div>
    </div>
  )
}
