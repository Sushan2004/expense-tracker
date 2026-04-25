import { useApp } from '../context/AppContext'
import { fmtShort } from '../utils/helpers'
import styles from './Profile.module.css'

export default function Profile({ onLogout }) {
  const { user, expenses, income, balance, savingsRate } = useApp()

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <div className={styles.avatar}>{user.initials}</div>
        <div>
          <h1 className={styles.title}>{user.name}</h1>
          <p className={styles.email}>{user.email || 'MoneyFlow profile'}</p>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.label}>Monthly income</p>
          <p className={styles.value}>{fmtShort(income.amount)}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.label}>Current balance</p>
          <p className={styles.value}>{fmtShort(balance)}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.label}>Savings rate</p>
          <p className={styles.value}>{savingsRate}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.label}>Transactions</p>
          <p className={styles.value}>{expenses.length}</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Account</h2>
        <button className={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </section>
    </main>
  )
}
