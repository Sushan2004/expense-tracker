import { Link, NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { to: '/',              label: 'Dashboard'    },
  { to: '/transactions',  label: 'Transactions' },
  { to: '/income',        label: 'Income'       },
  { to: '/budget',        label: 'Budget'       },
  { to: '/settings',      label: 'Settings'     },
]

export default function Navbar() {
  const { user, theme, toggleTheme } = useApp()

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link className={styles.logo} to="/" aria-label="Go to dashboard">
          <div className={styles.logoIcon}>M</div>
          <span className={styles.logoText}>MoneyFlow</span>
        </Link>

        <ul className={styles.links}>
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ''}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          className={styles.themeBtn}
          onClick={toggleTheme}
          type="button"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <NavLink
          className={({ isActive }) => `${styles.avatar} ${isActive ? styles.avatarActive : ''}`}
          to="/profile"
          aria-label="Open profile"
          title="Profile"
        >
          {user.initials}
        </NavLink>
      </div>
    </nav>
  )
}
