import { useState } from 'react'
import { exportCSV, exportFinancePDF } from '../utils/helpers'
import { useApp } from '../context/AppContext'
import styles from './Settings.module.css'

// Empty form models make it easy to reset Settings forms after saving.
const recurringStart = { type: 'expense', label: '', amount: '', currency: 'USD', category: 'Other', nextRun: '' }
const goalStart = { name: '', target: '', saved: '' }

export default function Settings({ onLogout }) {
  const {
    expenses,
    user,
    CATEGORIES,
    CURRENCIES,
    income,
    totalExpenses,
    balance,
    savingsRate,
    budgetAlerts,
    recurring,
    addRecurring,
    deleteRecurring,
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    notificationsEnabled,
    setNotificationsEnabled,
    theme,
    toggleTheme,
    today,
  } = useApp()
  const [recurringForm, setRecurringForm] = useState({ ...recurringStart, nextRun: today() })
  const [goalForm, setGoalForm] = useState(goalStart)

  // Browser notifications require permission, so the user must explicitly enable them.
  const requestNotifications = async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    const enabled = permission === 'granted'
    setNotificationsEnabled(enabled)
    if (enabled) new Notification('MoneyFlow notifications enabled')
  }

  // A recurring rule is a template; AppContext turns due rules into real transactions.
  const addRule = (ev) => {
    ev.preventDefault()
    const amount = parseFloat(recurringForm.amount)
    if (!recurringForm.label.trim() || isNaN(amount) || amount <= 0) return
    addRecurring({ ...recurringForm, amount, label: recurringForm.label.trim() })
    setRecurringForm({ ...recurringStart, nextRun: today() })
  }

  // Savings goals track progress separately from account balance so users can plan ahead.
  const addGoal = (ev) => {
    ev.preventDefault()
    const target = parseFloat(goalForm.target)
    const saved = parseFloat(goalForm.saved || 0)
    if (!goalForm.name.trim() || isNaN(target) || target <= 0) return
    addSavingsGoal({ name: goalForm.name.trim(), target, saved: isNaN(saved) ? 0 : saved })
    setGoalForm(goalStart)
  }

  // PDF export opens a printable report window and lets the browser save it as PDF.
  const printReport = () => exportFinancePDF({ user, income, totalExpenses, balance, savingsRate, budgetAlerts, savingsGoals })

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Settings</h1>

      <section className={styles.grid}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Data export</h2>
          <div className={styles.buttonRow}>
            <button className={styles.btn} onClick={() => exportCSV(expenses)}>Export CSV</button>
            <button className={styles.btn} onClick={printReport}>Export PDF</button>
          </div>
        </div>


        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Appearance</h2>
          <p className={styles.about}>{theme === 'dark' ? 'Dark mode is active.' : 'Light mode is active.'}</p>
          <button className={styles.btn} onClick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Notifications</h2>
          <p className={styles.about}>{notificationsEnabled ? 'Browser notifications are enabled.' : 'Enable alerts for budget and goal reminders.'}</p>
          <button className={styles.btn} onClick={requestNotifications}>{notificationsEnabled ? 'Enabled' : 'Enable notifications'}</button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recurring transactions</h2>
        <form className={styles.form} onSubmit={addRule}>
          <select className={styles.input} value={recurringForm.type} onChange={ev => setRecurringForm(f => ({ ...f, type: ev.target.value }))}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input className={styles.input} placeholder="Name" value={recurringForm.label} onChange={ev => setRecurringForm(f => ({ ...f, label: ev.target.value }))} />
          <input className={styles.input} type="number" min="0" step="0.01" placeholder="Amount" value={recurringForm.amount} onChange={ev => setRecurringForm(f => ({ ...f, amount: ev.target.value }))} />
          <select className={styles.input} value={recurringForm.currency} onChange={ev => setRecurringForm(f => ({ ...f, currency: ev.target.value }))}>
            {CURRENCIES.map(currency => <option key={currency.code} value={currency.code}>{currency.code}</option>)}
          </select>
          <select className={styles.input} value={recurringForm.category} onChange={ev => setRecurringForm(f => ({ ...f, category: ev.target.value }))} disabled={recurringForm.type === 'income'}>
            {CATEGORIES.map(cat => <option key={cat.name}>{cat.name}</option>)}
          </select>
          <input className={styles.input} type="date" value={recurringForm.nextRun} onChange={ev => setRecurringForm(f => ({ ...f, nextRun: ev.target.value }))} />
          <button className={styles.btnPrimary} type="submit">Add recurring</button>
        </form>
        <div className={styles.list}>
          {recurring.length === 0 ? <p className={styles.about}>No recurring transactions yet.</p> : recurring.map(rule => (
            <div key={rule.id} className={styles.row}>
              <span>{rule.label}</span>
              <span>{rule.type} {rule.currency || 'USD'} {Number(rule.amount).toFixed(2)}</span>
              <span>Next {rule.nextRun}</span>
              <button className={styles.textBtn} onClick={() => deleteRecurring(rule.id)}>Delete</button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Savings goals</h2>
        <form className={styles.form} onSubmit={addGoal}>
          <input className={styles.input} placeholder="Goal name" value={goalForm.name} onChange={ev => setGoalForm(f => ({ ...f, name: ev.target.value }))} />
          <input className={styles.input} type="number" min="0" step="0.01" placeholder="Target" value={goalForm.target} onChange={ev => setGoalForm(f => ({ ...f, target: ev.target.value }))} />
          <input className={styles.input} type="number" min="0" step="0.01" placeholder="Saved so far" value={goalForm.saved} onChange={ev => setGoalForm(f => ({ ...f, saved: ev.target.value }))} />
          <button className={styles.btnPrimary} type="submit">Add goal</button>
        </form>
        <div className={styles.goalList}>
          {savingsGoals.length === 0 ? <p className={styles.about}>No savings goals yet.</p> : savingsGoals.map(goal => {
            const pct = Math.min(100, Math.round((Number(goal.saved || 0) / Number(goal.target || 1)) * 100))
            return (
              <div key={goal.id} className={styles.goalCard}>
                <div className={styles.goalHead}><strong>{goal.name}</strong><span>{pct}%</span></div>
                <div className={styles.goalTrack}><div style={{ width: `${pct}%` }} /></div>
                <div className={styles.goalControls}>
                  <input className={styles.input} type="number" min="0" step="0.01" value={goal.saved} onChange={ev => updateSavingsGoal(goal.id, ev.target.value)} />
                  <span>of ${Number(goal.target).toFixed(2)}</span>
                  <button className={styles.textBtn} onClick={() => deleteSavingsGoal(goal.id)}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Authentication</h2>
        <p className={styles.about}>{user.name}{user.email ? ` - ${user.email}` : ''}</p>
        <button className={styles.dangerBtn} onClick={onLogout}>Logout</button>
      </section>
    </main>
  )
}
